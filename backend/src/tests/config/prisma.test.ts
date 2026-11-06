import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  adapter: vi.fn(),
  client: vi.fn(),
  extend: vi.fn(),
  load: vi.fn(),
}));

vi.mock('../../config/environment', async importOriginal => ({
  ...await importOriginal<typeof import('../../config/environment')>(),
  loadEnvironment: mocks.load,
}));
vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class {
    constructor(options: unknown) { mocks.adapter(options); }
  },
}));
vi.mock('../../../generated/prisma/client', () => ({
  PrismaClient: class {
    constructor(options: unknown) { mocks.client(options); }
    $extends = mocks.extend;
  },
}));

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  delete global.__prisma;
  delete global.__prismaEnvironment;
  mocks.extend.mockReturnValue({ guarded: true });
  mocks.load.mockReturnValue({
    environment: 'local',
    values: { DATABASE_URL: 'postgresql://localhost/centraldeanime' },
    readOnly: false,
  });
});

afterEach(() => {
  delete global.__prisma;
  delete global.__prismaEnvironment;
  vi.unstubAllEnvs();
});

describe('Prisma: destino e politica de escrita', () => {
  it('utiliza exclusivamente a URL validada, sem logs de consultas', async () => {
    await import('../../config/prisma');
    expect(mocks.adapter).toHaveBeenCalledWith({
      connectionString: 'postgresql://localhost/centraldeanime',
    });
    expect(mocks.client).toHaveBeenCalledWith(expect.objectContaining({ log: [] }));
  });

  it('configura conexoes de staging como somente leitura e bloqueia mutations antes da query', async () => {
    mocks.load.mockReturnValue({
      environment: 'staging',
      values: { DATABASE_URL: 'postgresql://localhost/centraldeanime_staging' },
      readOnly: true,
    });
    await import('../../config/prisma');
    expect(mocks.adapter).toHaveBeenCalledWith(expect.objectContaining({
      options: '-c default_transaction_read_only=on',
    }));
    const extension = mocks.extend.mock.calls[0][0];
    const query = vi.fn();
    expect(() => extension.query.$allOperations({ operation: 'create', args: {}, query }))
      .toThrow('somente leitura');
    expect(query).not.toHaveBeenCalled();
    extension.query.$allOperations({ operation: 'findMany', args: {}, query });
    expect(query).toHaveBeenCalledWith({});
  });

  it('interrompe antes de criar adapter quando a selecao e invalida', async () => {
    mocks.load.mockImplementation(() => { throw new Error('Destino invalido'); });
    await expect(import('../../config/prisma')).rejects.toThrow('Destino invalido');
    expect(mocks.adapter).not.toHaveBeenCalled();
  });

  it('nao reutiliza cliente global de outro ambiente', async () => {
    await import('../../config/prisma');
    vi.resetModules();
    mocks.load.mockReturnValue({
      environment: 'staging',
      values: { DATABASE_URL: 'postgresql://localhost/centraldeanime_staging' },
      readOnly: true,
    });
    await expect(import('../../config/prisma')).rejects.toThrow('outro ambiente');
  });
});
