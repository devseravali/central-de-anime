import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prismaCliDatasource } from '../../config/environment';

vi.mock('prisma/config', () => ({
  defineConfig: <T>(config: T): T => config,
}));

beforeEach(() => { vi.resetModules(); });
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('Prisma CLI: isolamento', () => {
  it.each([
    ['--url', 'postgresql://not-used.invalid/neondb'],
    ['--url=postgresql://not-used.invalid/neondb'],
    ['--URL=postgresql://not-used.invalid/neondb'],
    ['--config', 'alternative.ts'],
    ['--schema=alternative.prisma'],
    ['--from-url=postgresql://not-used.invalid/neondb'],
    ['--to-config-datasource'],
  ])('rejeita substituicao antes de exigir ambiente: %j', (...extra) => {
    vi.stubEnv('APP_ENV', undefined);
    expect(() => prismaCliDatasource(['migrate', 'dev', ...extra])).toThrow('Substituicao');
    expect(() => prismaCliDatasource(['generate', ...extra])).toThrow('Substituicao');
  });

  it.each(['production', 'staging'])('bloqueia comandos administrativos em %s', environment => {
    vi.stubEnv('APP_ENV', environment);
    for (const command of [['migrate', 'dev'], ['migrate', 'deploy'], ['migrate', 'reset'], ['db', 'push'], ['db', 'seed'], ['db', 'execute']]) {
      expect(() => prismaCliDatasource(command)).toThrow('bloqueados');
    }
  });

  it('NODE_ENV nao seleciona destino e nao permite fallback', () => {
    vi.stubEnv('APP_ENV', undefined);
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => prismaCliDatasource(['migrate', 'dev'])).toThrow('Selecione APP_ENV');
  });

  it('generate e validate nao carregam conexoes ou arquivos de ambiente', async () => {
    vi.stubEnv('APP_ENV', undefined);
    const previous = process.argv;
    try {
      process.argv = ['node', 'prisma', 'generate'];
      const { default: config } = await import('../../../prisma.config');
      expect(config.datasource).toBeUndefined();
      expect(prismaCliDatasource(['validate'])).toBeUndefined();
    } finally {
      process.argv = previous;
    }
  });
});
