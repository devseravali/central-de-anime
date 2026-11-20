import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadEnvironment, prismaCliConfiguration } from '../../config/environment';
import { loadValidationEnvironment } from '../../config/validationEnvironment.mjs';
import { assertSeedDestination } from '../../seed/config/context';

const replay = 'centraldeanime_migrate_validation_20261112';
const imported = 'centraldeanime_import_validation_20261112';
const restored = 'centraldeanime_restore_20261112';
const password = 'a1'.repeat(48);
const url = (db: string) => `postgresql://centraldeanime_validation:${password}@127.0.0.1:55432/${db}`;
const config = (operation: string, database = replay) => ({
  APP_ENV: 'validation', VALIDATION_OPERATION: operation,
  DATABASE_URL: url(database), DATABASE_URL_UNPOOLED: url(database),
});
afterEach(() => vi.unstubAllEnvs());

describe('destinos de validation (offline)', () => {
  it.each([['replay', replay], ['migrate-import', imported], ['import', imported], ['backup', imported], ['restore', restored]] as const)(
    '%s aceita apenas o banco atribuido', (operation, database) => {
      expect(loadValidationEnvironment(operation, config(operation, database)).connectionUrl).toBe(url(database));
      for (const other of [replay, imported, restored, 'centraldeanime', 'centraldeanime_restore_other']) {
        if (other !== database) expect(() => loadValidationEnvironment(operation, config(operation, other))).toThrow();
      }
    },
  );
  it.each([
    undefined, '', 'invalid', url(replay).replace(`:${password}`, ''),
    url(replay).replace(password, 'short'), url(replay).replace(password, 'b2'.repeat(48)),
    url(replay).replace('55432', '5432'), url(replay).replace('127.0.0.1', 'localhost'),
    url(replay).replace('127.0.0.1', '[::1]'), url(replay).replace('127.0.0.1', 'ep-test.neon.tech'),
    url(replay).replace('127.0.0.1', 'db.test.supabase.co'), url(replay).replace('127.0.0.1', 'test.render.com'),
    url(replay).replace('127.0.0.1', '127.1'), url(replay).replace('centraldeanime_validation', 'postgres'),
    `${url(replay)}?host=127.0.0.1`, `${url(replay)}?`, `${url(replay)}#secret`, `${url(replay)}/..`,
  ].map((value, index) => ({ value, index })))('rejeita configuracao de URL $index sem expor senha', ({ value }) => {
    expect(() => loadValidationEnvironment('replay', { ...config('replay'), DATABASE_URL: value }))
      .toThrow(/^Configuracao de validation recusada:/);
  });
  it('nao usa arquivo, URL alternativa, operacao implicita ou outro ambiente', () => {
    for (const extra of [
      { DATABASE_URL_UNPOOLED: undefined }, { VALIDATION_OPERATION: undefined },
      { VALIDATION_OPERATION: 'import' }, { APP_ENV: undefined },
      { PGHOST: 'localhost' }, { DIRECT_URL: 'unused' }, { RENDER: 'true' },
    ]) {
      expect(() => loadValidationEnvironment('replay', { ...config('replay'), ...extra })).toThrow();
    }
    vi.stubEnv('APP_ENV', 'validation');
    expect(() => loadEnvironment()).toThrow(/exclusivo dos comandos administrativos/);
  });
  it('Prisma e contexto de seed usam somente o destino da propria operacao', () => {
    for (const [key, value] of Object.entries(config('replay'))) vi.stubEnv(key, value);
    expect(prismaCliConfiguration(['migrate', 'deploy'])).toEqual({ datasourceUrl: url(replay) });
    expect(() => prismaCliConfiguration(['migrate', 'dev'])).toThrow();
    expect(() => prismaCliConfiguration(['db', 'push'])).toThrow();
    expect(() => assertSeedDestination(config('replay'))).toThrow();
    expect(() => assertSeedDestination(config('import', replay))).toThrow();
    expect(assertSeedDestination(config('import', imported))).toBe(url(imported));
  });
  it('Prisma permite migrate-import somente no banco de importacao e nao aceita a operacao de seed', () => {
    for (const [key, value] of Object.entries(config('migrate-import', imported))) vi.stubEnv(key, value);
    expect(prismaCliConfiguration(['migrate', 'deploy'])).toEqual({ datasourceUrl: url(imported) });
    vi.stubEnv('DATABASE_URL', url(replay));
    vi.stubEnv('DATABASE_URL_UNPOOLED', url(replay));
    expect(() => prismaCliConfiguration(['migrate', 'deploy'])).toThrow();
    vi.stubEnv('VALIDATION_OPERATION', 'import');
    vi.stubEnv('DATABASE_URL', url(imported));
    vi.stubEnv('DATABASE_URL_UNPOOLED', url(imported));
    expect(() => prismaCliConfiguration(['migrate', 'deploy'])).toThrow();
  });
});

describe('wrapper de replay', () => {
  const wrapper = fileURLToPath(new URL('../../../scripts/prisma.mjs', import.meta.url));
  // Intercept every spawn before importing the wrapper: even a regression cannot start Prisma.
  const block = `
    import cp from 'node:child_process';
    import { syncBuiltinESMExports } from 'node:module';
    import { EventEmitter } from 'node:events';
    import { fileURLToPath, pathToFileURL } from 'node:url';
    cp.spawn = (_program, args, options) => {
      if (args.slice(1).join(' ') !== 'migrate deploy' || options.shell !== false ||
          options.stdio !== 'ignore' || options.env.DATABASE_URL !== process.env.DATABASE_URL ||
          options.cwd !== fileURLToPath(new URL('../', pathToFileURL(process.argv[1]))) ||
          options.env.SECRET_TEST !== undefined) throw new Error('UNEXPECTED_SPAWN');
      console.log('PRISMA_MOCK_STARTED');
      const child = new EventEmitter();
      queueMicrotask(() => child.emit('exit', 2));
      return child;
    };
    syncBuiltinESMExports();
    await import(pathToFileURL(process.argv[1]).href);
  `;
  function run(args: string[], operation = 'replay', database = replay) {
    const env = { ...config(operation, database), SystemRoot: process.env.SystemRoot, SECRET_TEST: 'not-for-child' };
    const result = spawnSync(process.execPath, ['--input-type=module', '-e', block, wrapper, ...args],
      { env, encoding: 'utf8', timeout: 10_000 });
    expect(result.error).toBeUndefined();
    const output = result.stdout + result.stderr;
    expect(output).not.toContain(password);
    expect(output).not.toContain(url(database));
    return { code: result.status, output };
  }
  it.each([['--config=other.ts'], ['--url', 'unused'], ['--schema=other.prisma'], ['--help']])(
    'recusa override ou flag extra antes do processo filho: %j', (...extra) => {
      expect(run(['migrate', 'deploy', ...extra])).toMatchObject({
        code: 1, output: expect.not.stringContaining('PRISMA_MOCK_STARTED'),
      });
    },
  );
  it('envia somente o comando fixo e imprime destino e erro sem credenciais', () => {
    const result = run(['migrate', 'deploy']);
    expect(result.code).toBe(2);
    expect(result.output).toContain(`127.0.0.1:55432/${replay}`);
    expect(result.output).toContain('PRISMA_MOCK_STARTED');
    expect(result.output).toContain('Migration de validacao falhou');
  });
  it('aceita migrate-import apenas no destino de importacao, sem aceitar replay cruzado', () => {
    const result = run(['migrate', 'deploy'], 'migrate-import', imported);
    expect(result.code).toBe(2);
    expect(result.output).toContain(`127.0.0.1:55432/${imported}`);
    expect(result.output).toContain('PRISMA_MOCK_STARTED');
    for (const [operation, database] of [['replay', imported], ['migrate-import', replay], ['import', imported]]) {
      expect(run(['migrate', 'deploy'], operation, database).output).not.toContain('PRISMA_MOCK_STARTED');
    }
    expect(run(['migrate', 'deploy', '--schema=other.prisma'], 'migrate-import', imported).output)
      .not.toContain('PRISMA_MOCK_STARTED');
  });
});
