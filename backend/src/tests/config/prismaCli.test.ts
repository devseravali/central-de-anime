import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('dotenv/config', () => ({}));
vi.mock('prisma/config', () => ({
  defineConfig: <T>(config: T): T => config,
}));

describe('Configuracao: datasource do Prisma CLI', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('prioriza a conexao direta sem alterar a URL da aplicacao', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://pooled.example.test/app');
    vi.stubEnv('DATABASE_URL_UNPOOLED', 'postgresql://direct.example.test/app');

    const { default: config } = await import('../../../prisma.config');

    expect(config.datasource?.url).toBe('postgresql://direct.example.test/app');
    expect(process.env.DATABASE_URL).toBe('postgresql://pooled.example.test/app');
  });

  it('preserva ambientes existentes que possuem somente DATABASE_URL', async () => {
    vi.stubEnv('DATABASE_URL', 'postgresql://localhost/test');
    vi.stubEnv('DATABASE_URL_UNPOOLED', undefined);

    const { default: config } = await import('../../../prisma.config');

    expect(config.datasource?.url).toBe('postgresql://localhost/test');
  });
});
