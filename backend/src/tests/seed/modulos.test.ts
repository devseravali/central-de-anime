import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const harness = vi.hoisted(() => {
  type Row = Record<string, unknown>;
  const tables = new Map<string, Map<string, Row>>();
  const writes = vi.fn();
  const constructor = vi.fn();
  const disconnect = vi.fn();
  const transaction = vi.fn();
  const files: Record<string, Row[]> = {};
  function delegate(name: string, keys = ['id']) {
    const key = (row: Row) => keys.map(k => String(row[k])).join(':');
    const table = () => {
      if (!tables.has(name)) tables.set(name, new Map());
      return tables.get(name)!;
    };
    return {
      findMany: vi.fn(async (args?: { where?: { id?: { in: number[] } } }) => [...table().values()]
        .filter(row => !args?.where?.id?.in || args.where.id.in.includes(Number(row.id)))),
      findUniqueOrThrow: vi.fn(async ({ where }: { where: { id: number } }) => {
        const row = table().get(String(where.id));
        if (!row) throw new Error('Missing');
        return row;
      }),
      create: vi.fn(async ({ data }: { data: Row }) => {
        if (table().has(key(data))) throw new Error('Duplicate');
        writes(name, 'create', data);
        table().set(key(data), { ...data });
        return data;
      }),
      update: vi.fn(async ({ where, data }: { where: { id: number }; data: Row }) => {
        if ('id' in data) throw new Error('ID mutation');
        const previous = table().get(String(where.id));
        if (!previous) throw new Error('Missing');
        const row = { ...previous, ...data };
        writes(name, 'update', data);
        table().set(String(where.id), row);
        return row;
      }),
      createMany: vi.fn(async ({ data }: { data: Row[] }) => {
        for (const row of data) {
          if (table().has(key(row))) throw new Error('Duplicate');
          table().set(key(row), { ...row });
        }
        writes(name, 'createMany', data);
        return { count: data.length };
      }),
    };
  }
  const database = {
    status: delegate('Status'),
    estacao: delegate('Estacao'),
    genero: delegate('Genero'),
    estudio: delegate('Estudio'),
    plataforma: delegate('Plataforma'),
    animeTag: delegate('AnimeTag'),
    franquia: delegate('Franquia'),
    capas: delegate('Capas'),
    anime: delegate('Anime'),
    personagem: delegate('Personagem'),
    episodio: delegate('Episodio'),
    animeGenero: delegate('AnimeGenero', ['animeId', 'generoId']),
    animePersonagem: delegate('AnimePersonagem', ['animeId', 'personagemId']),
    animePlataforma: delegate('AnimePlataforma', ['animeId', 'plataformaId']),
    animeTagAnime: delegate('AnimeTagAnime', ['animeId', 'tagId']),
    $transaction: transaction,
    $disconnect: disconnect,
  };
  transaction.mockImplementation(async (callback: (db: typeof database) => Promise<unknown>) => {
    const backup = new Map([...tables].map(([name, rows]) => [name, new Map(rows)]));
    try {
      return await callback(database);
    } catch (error) {
      tables.clear();
      for (const [name, rows] of backup) tables.set(name, rows);
      throw error;
    }
  });
  return { tables, files, database, writes, constructor, disconnect };
});

vi.mock('../../../generated/prisma/client', () => ({
  PrismaClient: class {
    constructor() { harness.constructor(); return harness.database; }
  },
}));
vi.mock('@prisma/adapter-pg', () => ({ PrismaPg: class {} }));
vi.mock('../../config/environment', async importOriginal => ({
  ...await importOriginal<typeof import('../../config/environment')>(),
  loadEnvironment: vi.fn(),
}));
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(async (filename: string) => {
    const rows = harness.files[path.basename(filename)];
    if (!rows) throw new Error('ENOENT');
    return JSON.stringify(rows);
  }),
}));

import { modules } from '../../seed/config/modulos';
import { main as all } from '../../seed/index';
import { main as animes } from '../../seed/entidades/Animes';
import { main as personagens } from '../../seed/entidades/Personagens';
import { main as episodios } from '../../seed/entidades/Episodios';
import { main as animeTag } from '../../seed/relacionamentos/AnimeTag';
import { runDirect } from '../../seed/utils/executar';
import { readFile } from 'node:fs/promises';

beforeEach(() => {
  vi.clearAllMocks();
  harness.tables.clear();
  Object.assign(harness.files, {
    'status.json': [{ id: 1, nome: 'Concluido' }, { id: 2, nome: 'Planejado' }],
    'generos.json': [{ id: 1, nome: 'Aventura' }],
    'estudios.json': [{ id: 1, nome: 'Estudio', principaisObras: '' }],
    'plataformas.json': [{ id: 1, nome: 'Plataforma' }],
    'tags.json': [{ id: 1, nome: 'Tag' }],
    'franquia.json': [{ id: 1, nome: 'Franquia', descricao: null, anoInicio: 2017 }],
    'capa.json': [{ id: 1, nome_original: 'capa.jpg', nome_salvo: 'capa.jpg', caminho: 'images/capas/ausente.jpg', mime_type: 'image/jpeg' }],
    'estacoes.json': [{ id: 1, nome: 'Verao' }],
    'animes.json': [{
      id: 1, titulo: 'Anime', tipo: 'filme', temporada: 0, ano: 2017, sinopse: '',
      capaUrl: null, quantidadeEpisodios: 1, franquiaId: 1, estudioId: 1, statusId: 1, estacaoId: 1,
    }],
    'personagens.json': [{ id: 1, nome: 'Personagem', imagem: 'images/personagens/ausente.jpg', sobre: '', nivelCombate: 250 }],
    'episodios.json': [{ id: 1, numero: 1, titulo: 'Episodio', sinopse: '', temporadaId: 0, animeId: 1, imagemUrl: 'images/episodios/ausente.jpg' }],
    'anime_genero.json': [{ animeId: 1, generoId: 1 }],
    'anime_personagem.json': [{ animeId: 1, personagemId: 1 }],
    'anime_plataforma.json': [{ animeId: 1, plataformaId: 1 }],
    'anime_tag.json': [{ animeId: 1, tagId: 1 }],
    'anime_status.json': [{ animeId: 1, statusId: 2 }],
  });
  vi.stubEnv('APP_ENV', 'test');
  vi.stubEnv('DATABASE_URL', 'postgresql://localhost/centraldeanimetest');
  vi.stubEnv('DATABASE_URL_UNPOOLED', 'postgresql://localhost/centraldeanimetest');
  vi.stubEnv('NODE_ENV', 'test');
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe('Seeds: modulos reais com persistencia simulada', () => {
  it('executa todos os 16 main diretamente, sem depender de index, fechando cada conexao', async () => {
    const reports = [];
    for (const main of modules) reports.push(await main());
    expect(reports.every(report => report.estado === 'concluido')).toBe(true);
    expect(harness.constructor).toHaveBeenCalledTimes(16);
    expect(harness.disconnect).toHaveBeenCalledTimes(16);
    expect(harness.tables.get('Personagem')?.get('1')?.nivelCombate).toBe(250);
    expect(harness.tables.get('Episodio')?.get('1')?.temporada).toBe(0);
    expect(harness.tables.get('Anime')?.get('1')?.statusId).toBe(2);
    expect(harness.tables.get('Anime')?.get('1')?.estacaoId).toBe(1);
  });

  it('orquestrador reutiliza uma unica instancia e retorna relatorio consolidado', async () => {
    const reports = await all();
    expect(reports).toHaveLength(17);
    expect(harness.constructor).toHaveBeenCalledTimes(1);
    expect(harness.disconnect).toHaveBeenCalledTimes(1);
    expect(harness.tables.get('AnimeTagAnime')?.size).toBe(1);
    expect(harness.tables.get('Anime')?.get('1')?.statusId).toBe(2);
  });

  it('reexecucao do conjunto nao duplica IDs nem pares, mantendo o estado final das fontes', async () => {
    await all();
    const snapshot = JSON.stringify([...harness.tables].map(([name, table]) => [name, [...table]]));
    const reports = await all();
    expect(reports.slice(1).reduce((sum, report) => sum + report.inseridos, 0)).toBe(0);
    expect(JSON.stringify([...harness.tables].map(([name, table]) => [name, [...table]]))).toBe(snapshot);
  });

  it('preflight impede qualquer gravacao quando personagens tem nivelCombate textual', async () => {
    harness.files['personagens.json'][0].nivelCombate = 'Avancado';
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
    expect(harness.constructor).not.toHaveBeenCalled();
  });

  it('preflight bloqueia estacao inexistente antes de abrir uma conexao', async () => {
    harness.files['animes.json'][0].estacaoId = 99;
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
    expect(harness.constructor).not.toHaveBeenCalled();
  });

  it('preflight rejeita JSON invalido sem criar conexao ou gravar', async () => {
    vi.mocked(readFile).mockResolvedValueOnce('{');
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.constructor).not.toHaveBeenCalled();
    expect(harness.writes).not.toHaveBeenCalled();
  });

  it('preflight rejeita campo obrigatorio ausente identificando o registro', async () => {
    delete harness.files['animes.json'][0].titulo;
    await expect(all()).rejects.toMatchObject({
      report: { estado: 'falhou', erros: [expect.stringContaining('id=1')] },
    });
    expect(harness.writes).not.toHaveBeenCalled();
  });

  it('preflight rejeita IDs duplicados e pares orfaos sem gravar', async () => {
    harness.files['status.json'].push({ id: 1, nome: 'Duplicado' });
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    harness.files['status.json'].pop();
    harness.files['anime_personagem.json'][0].personagemId = 999;
    await expect(all()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
    expect(harness.constructor).not.toHaveBeenCalled();
  });

  it('animes exige estacoes persistidas mesmo quando os outros catalogos existem', async () => {
    for (const name of ['Estudio', 'Status', 'Franquia']) {
      harness.tables.set(name, new Map([['1', { id: 1 }]]));
    }
    await expect(animes()).rejects.toMatchObject({
      report: { estado: 'falhou', erros: ['Animes.estacaoId: IDs ausentes 1.'] },
    });
    expect(harness.writes).not.toHaveBeenCalled();
  });

  it('personagens valida seu proprio arquivo sem importar auxiliares ou outros JSONs', async () => {
    const report = await personagens();
    expect(report.inseridos).toBe(1);
    expect([...harness.tables.keys()]).toEqual(['Personagem']);
  });

  it('anime independente falha antes de gravar se seus catalogos nao estiverem persistidos', async () => {
    await expect(animes()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
    expect(harness.disconnect).toHaveBeenCalledTimes(1);
  });

  it('relacionamento valida tambem o lado da tag antes de gravar', async () => {
    harness.tables.set('Anime', new Map([['1', { id: 1 }]]));
    await expect(animeTag()).rejects.toMatchObject({ report: { estado: 'falhou' } });
    expect(harness.writes).not.toHaveBeenCalled();
  });

  it('episodio mantem temporada divergente e imagem ausente, reportando ambos sem descartar', async () => {
    harness.tables.set('Anime', new Map([['1', { id: 1, temporada: 2 }]]));
    const report = await episodios();
    expect(report.inseridos).toBe(1);
    expect(report.avisos).toHaveLength(2);
    expect(harness.tables.get('Episodio')?.get('1')?.temporada).toBe(0);
    expect(harness.tables.get('Episodio')?.get('1')?.imagemUrl).toBe('images/episodios/ausente.jpg');
  });

  it('execucao direta sinaliza exit code 1 quando main falha', async () => {
    const originalArg = process.argv[1];
    const originalCode = process.exitCode;
    process.argv[1] = new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
    try {
      runDirect(import.meta.url, async () => { throw new Error('simulada'); });
      await new Promise(resolve => setImmediate(resolve));
      expect(process.exitCode).toBe(1);
    } finally {
      process.argv[1] = originalArg;
      process.exitCode = originalCode;
    }
  });
});
