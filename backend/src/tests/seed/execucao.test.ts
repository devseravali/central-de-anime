import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  disconnect: vi.fn(),
  transaction: vi.fn(),
  constructor: vi.fn(),
}));

vi.mock('../../../generated/prisma/client', () => ({
  PrismaClient: class {
    constructor() { mocks.constructor(); }
    $disconnect = mocks.disconnect;
    $transaction = mocks.transaction;
  },
}));
vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));
vi.mock('../../config/environment', async importOriginal => ({
  ...await importOriginal<typeof import('../../config/environment')>(),
  loadEnvironment: vi.fn(),
}));

import { createSeedContext } from '../../seed/config/context';
import { executeSeed, runDirect } from '../../seed/utils/executar';
import { persistPairs, persistRecords } from '../../seed/utils/persistencia';
import { newReport, SeedFailure, SeedInputError } from '../../seed/utils/relatorio';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('APP_ENV', 'test');
  vi.stubEnv('DATABASE_URL', 'postgresql://localhost/centraldeanimetest');
  vi.stubEnv('DATABASE_URL_UNPOOLED', 'postgresql://localhost/centraldeanimetest');
  vi.stubEnv('NODE_ENV', 'test');
  mocks.disconnect.mockResolvedValue(undefined);
  mocks.transaction.mockImplementation(async (callback: () => Promise<unknown>) => callback());
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Seeds: execucao independente e conexao compartilhada', () => {
  it('abre uma instancia e encerra uma vez na execucao individual', async () => {
    const report = await executeSeed('Teste', async (_ctx, report) => {
      report.lidos = report.validos = report.inalterados = 1;
    });
    expect(mocks.constructor).toHaveBeenCalledTimes(1);
    expect(mocks.disconnect).toHaveBeenCalledTimes(1);
    expect(report.estado).toBe('concluido');
  });

  it('nao cria ou encerra conexoes adicionais quando recebe contexto', async () => {
    const context = createSeedContext();
    await executeSeed('Primeiro', async () => {}, context);
    await executeSeed('Segundo', async () => {}, context);
    expect(mocks.constructor).toHaveBeenCalledTimes(1);
    expect(mocks.disconnect).not.toHaveBeenCalled();
  });

  it('propaga falhas com relatorio e encerra conexao individual', async () => {
    await expect(executeSeed('Teste', async (_ctx, report) => {
      report.lidos = 3;
      throw new SeedInputError('Referencia ausente id=2.');
    })).rejects.toMatchObject({
      report: { estado: 'falhou', naoExecutados: 3, erros: ['Referencia ausente id=2.'] },
    });
    expect(mocks.disconnect).toHaveBeenCalledTimes(1);
  });

  it('nao expõe mensagens de infraestrutura que podem conter credenciais', async () => {
    try {
      await executeSeed('Teste', async () => { throw new Error('postgresql://secret@example.test'); });
    } catch (error) {
      expect(error).toBeInstanceOf(SeedFailure);
      if (error instanceof SeedFailure) expect(JSON.stringify(error.report)).not.toContain('secret');
    }
  });

  it('importar um modulo nao executa seu main', async () => {
    const original = process.argv[1];
    process.argv[1] = 'test-runner.ts';
    try {
      const main = vi.fn();
      runDirect(import.meta.url, main);
      expect(main).not.toHaveBeenCalled();
      const modules = await import('../../seed/config/modulos');
      expect(modules.modules).toHaveLength(16);
      expect(modules.modules.every(main => typeof main === 'function')).toBe(true);
      expect(mocks.constructor).not.toHaveBeenCalled();
    } finally {
      process.argv[1] = original;
    }
  });
});

describe('Seeds: persistencia por ID e resultados reais', () => {
  it('insere, atualiza sem ID no payload e nao modifica nada na segunda execucao', async () => {
    const context = createSeedContext();
    const data = new Map([[1, { id: 1, nome: 'Antigo' }]]);
    const create = vi.fn(async (_db, row: { id: number; nome: string }) => { data.set(row.id, row); });
    const update = vi.fn(async (_db, id: number, fields: { nome: string }) => { data.set(id, { id, ...fields }); });
    const store = {
      list: async () => [...data.values()],
      create,
      update,
      unique: ['nome'] as const,
    };
    const rows = [{ id: 1, nome: 'Novo' }, { id: 2, nome: 'Segundo' }];
    const first = newReport('Teste');
    await persistRecords(context, first, rows, { ...store, unique: ['nome'] });
    expect(first.inseridos).toBe(1);
    expect(first.atualizados).toBe(1);
    expect(update.mock.calls[0][2]).toEqual({ nome: 'Novo' });
    const second = newReport('Teste');
    await persistRecords(context, second, rows, { ...store, unique: ['nome'] });
    expect(second.inseridos).toBe(0);
    expect(second.atualizados).toBe(0);
    expect(second.inalterados).toBe(2);
  });

  it('bloqueia colisao de nome com outro ID antes de gravar', async () => {
    const create = vi.fn();
    await expect(persistRecords(createSeedContext(), newReport('Teste'), [{ id: 2, nome: 'Mesmo' }], {
      list: async () => [{ id: 1, nome: 'Mesmo' }],
      create,
      update: vi.fn(),
      unique: ['nome'],
    })).rejects.toThrow('identidade');
    expect(create).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it('nao conta registros de uma transacao que falhou', async () => {
    mocks.transaction.mockRejectedValueOnce(new Error('falha'));
    const report = newReport('Teste');
    await expect(persistRecords(createSeedContext(), report, [{ id: 1, nome: 'Novo' }], {
      list: async () => [],
      create: vi.fn(),
      update: vi.fn(),
    })).rejects.toThrow('falha');
    expect(report.inseridos).toBe(0);
    expect(report.atualizados).toBe(0);
  });

  it('conta pares existentes e inseridos sem anunciar duplicados como novas insercoes', async () => {
    const rows = [{ animeId: 1, tagId: 1 }, { animeId: 1, tagId: 2 }];
    const createMany = vi.fn(async () => ({ count: 1 }));
    const report = newReport('Pares');
    await persistPairs(createSeedContext(), report, rows, row => `${row.animeId}:${row.tagId}`, {
      list: async () => [rows[0]],
      createMany,
    });
    expect(createMany.mock.calls[0]).toHaveLength(2);
    expect(report.inseridos).toBe(1);
    expect(report.inalterados).toBe(1);
  });
});
