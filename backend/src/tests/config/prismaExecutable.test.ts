import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const prisma = require.resolve('prisma/build/index.js');
const wrapper = path.join(root, 'scripts', 'prisma.mjs');
const barrier = path.join(root, 'src', 'tests', 'fixtures', 'prisma-no-connections.cjs');
const rejection = 'Substituicao de datasource ou configuracao Prisma bloqueada';
const sentinel = 'PRISMA_TEST_STOP_BEFORE_CONNECTION_CONFIG';
const foreignUrls = [
  'postgresql://not-used.invalid/neondb?sslmode=require',
  'postgresql://not-used.invalid/centraldeanime_staging',
];

function run(entry: string, args: string[], environment = 'local') {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (/^(DATABASE_|DIRECT_URL$|PG|DB_|JWT_|SMTP_|REDIS_|PRISMA_|NODE_OPTIONS|APP_)/.test(key)) delete env[key];
  }
  Object.assign(env, {
    APP_ENV: environment,
    APP_RUNTIME: 'readonly',
    RENDER: 'false',
    CHECKPOINT_DISABLE: '1',
    PRISMA_HIDE_UPDATE_MESSAGE: '1',
    NODE_OPTIONS: `--require=${JSON.stringify(barrier)}`,
  });
  const result = spawnSync(process.execPath, [entry, ...args], {
    cwd: root, env, encoding: 'utf8', timeout: 30000, input: '',
  });
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  expect(result.error).toBeUndefined();
  expect(result.status).not.toBe(0);
  expect(output).not.toContain('PRISMA_TEST_NETWORK_BLOCKED');
  expect(output).not.toContain('PRISMA_TEST_ENGINE_BLOCKED');
  return output;
}

function expectRejected(output: string) {
  expect(output).toContain(rejection);
  expect(output).not.toContain(sentinel);
  expect(output).not.toContain(foreignUrls[0]);
  expect(output).not.toContain(foreignUrls[1]);
}

describe('Executavel Prisma real: substituicao bloqueada antes da conexao', () => {
  it.each([
    ['--url', foreignUrls[0]],
    [`--url=${foreignUrls[1]}`],
    ['--URL', foreignUrls[0]],
    [`--Url=${foreignUrls[1]}`],
    ['--datasource-url', foreignUrls[0]],
    ['--shadow-database-url', foreignUrls[1]],
    ['--direct-url', foreignUrls[0]],
    ['--from-url', foreignUrls[0]],
    ['--to-url', foreignUrls[1]],
    ['--schema', 'alternative.prisma'],
  ])('config central rejeita argumento direto: %j', (...extra) => {
    expectRejected(run(prisma, ['migrate', 'dev', ...extra]));
  });

  it.each(['local', 'test'])('comando legitimo em %s chega apenas ao sentinela, nunca conecta', environment => {
    const output = run(prisma, ['migrate', 'dev', '--name', 'permitted-name-url'], environment);
    expect(output).toContain(sentinel);
    expect(output).not.toContain(rejection);
  });

  it.each(['production', 'staging'])('CLI real bloqueia administracao em %s', environment => {
    for (const args of [
      ['migrate', 'dev'], ['migrate', 'deploy'], ['migrate', 'reset'],
      ['db', 'push'], ['db', 'execute', '--stdin'], ['db', 'seed'],
    ]) {
      const output = run(prisma, args, environment);
      expect(output).toContain('Migrations, seeds e resets bloqueados');
      expect(output).not.toContain(sentinel);
    }
  }, 120000);

  it.each([
    ['--config', 'alternative.ts'],
    ['--config=alternative.ts'],
    ['--CONFIG=alternative.ts'],
    ['-c', 'alternative.ts'],
    ['--schema', 'alternative.prisma'],
    ['--to-config-datasource'],
  ])('wrapper rejeita configuracao alternativa antes de iniciar o Prisma: %j', (...extra) => {
    expectRejected(run(wrapper, ['migrate', 'dev', ...extra]));
  });

  it.each([
    ['local', 'db:migrate'],
    ['local', 'db:migrate:relations'],
    ['test', 'db:migrate:test'],
  ])('npm legitimo em %s, alias %s, preserva a selecao central sem conectar', (environment, script) => {
    const npm = process.env.npm_execpath;
    if (!npm) throw new Error('Execute este teste por npm test para testar o npm real.');
    const output = run(npm, ['run', '--silent', script], environment);
    expect(output).toContain(sentinel);
    expect(output).not.toContain(rejection);
  });

  it.each(['db:migrate', 'db:migrate:relations', 'db:migrate:test', 'db:reset', 'db:reset:test'])(
    'npm encaminha argumentos ao bloqueio oficial de %s', script => {
      const npm = process.env.npm_execpath;
      if (!npm) throw new Error('Execute este teste por npm test para testar o npm real.');
      for (const extra of [['--url', foreignUrls[0]], [`--url=${foreignUrls[1]}`]]) {
        expectRejected(run(npm, ['run', '--silent', script, '--', ...extra]));
      }
    }, 60000,
  );
});
