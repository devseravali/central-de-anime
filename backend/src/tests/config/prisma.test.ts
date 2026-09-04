import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  prismaClient: vi.fn(),
  prismaPg: vi.fn(),
  dotenvConfig: vi.fn(),
}));

vi.mock('dotenv', () => ({
  default: { config: prismaMocks.dotenvConfig },
  config: prismaMocks.dotenvConfig,
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class MockPrismaPg {
    constructor(options: unknown) {
      prismaMocks.prismaPg(options);
    }
  },
}));

vi.mock('../../../generated/prisma/client', () => ({
  PrismaClient: class MockPrismaClient {
    constructor(options: unknown) {
      prismaMocks.prismaClient(options);
    }
  },
}));

describe('Configuração: prisma', () => {
  const envOriginal = {
    DATABASE_URL: process.env.DATABASE_URL,
    PRISMA_ACCELERATE_URL: process.env.PRISMA_ACCELERATE_URL,
    NODE_ENV: process.env.NODE_ENV,
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    delete (global as unknown as { __prisma?: unknown }).__prisma;
  });

  afterEach(() => {
    process.env.DATABASE_URL = envOriginal.DATABASE_URL;
    process.env.PRISMA_ACCELERATE_URL = envOriginal.PRISMA_ACCELERATE_URL;
    process.env.NODE_ENV = envOriginal.NODE_ENV;
    delete (global as unknown as { __prisma?: unknown }).__prisma;
    vi.restoreAllMocks();
  });

  it('deve instanciar PrismaClient com adapter pg quando DATABASE_URL estiver presente', async () => {
    process.env.DATABASE_URL = 'postgresql://usuario:senha@localhost:5432/teste';
    delete process.env.PRISMA_ACCELERATE_URL;
    process.env.NODE_ENV = 'development';

    const { prisma } = await import('../../config/prisma');

    expect(prismaMocks.prismaPg).toHaveBeenCalledWith({
      connectionString: 'postgresql://usuario:senha@localhost:5432/teste',
    });
    expect(prismaMocks.prismaClient).toHaveBeenCalledWith(
      expect.objectContaining({
        log: ['query', 'info', 'warn', 'error'],
      })
    );
    expect(prisma).toBeDefined();
  });

  it('deve instanciar PrismaClient com accelerateUrl quando apenas PRISMA_ACCELERATE_URL estiver definido', async () => {
    delete process.env.DATABASE_URL;
    process.env.PRISMA_ACCELERATE_URL = 'prisma://accelerate.net/?api_key=teste';
    process.env.NODE_ENV = 'production';

    const { prisma } = await import('../../config/prisma');

    expect(prismaMocks.prismaClient).toHaveBeenCalledWith(
      expect.objectContaining({
        accelerateUrl: 'prisma://accelerate.net/?api_key=teste',
        log: ['error', 'warn'],
      })
    );
    expect(prisma).toBeDefined();
  });

  it('deve lançar exceção quando nem DATABASE_URL nem PRISMA_ACCELERATE_URL estiverem definidos', async () => {
    delete process.env.DATABASE_URL;
    delete process.env.PRISMA_ACCELERATE_URL;

    await expect(import('../../config/prisma')).rejects.toThrow(
      'DATABASE_URL ou PRISMA_ACCELERATE_URL não foi definido.'
    );
  });
});
