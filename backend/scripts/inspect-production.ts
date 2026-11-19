import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MigrationRow } from '../src/config/productionAdmin';
import { loadEnvironment } from '../src/config/environment';
import { sanitizeAdministrativeText } from '../src/config/sanitization';
import { inspectSchema } from './database/inspection';
import { assertCleanInvocation, openReadOnlyClient, safeMessage } from './prod-admin-common';

try {
  assertCleanInvocation();
  if (process.env.APP_ENV !== 'production') throw new Error('Inspecao exige APP_ENV=production.');
  const { client, hostname, identity } = await openReadOnlyClient('DATABASE_URL_UNPOOLED');
  try {
    const { rows: exists } = await client.query<{ exists: boolean }>(
      "select to_regclass('public._prisma_migrations') is not null as exists",
    );
    const migrations = exists[0].exists
      ? (await client.query<MigrationRow>('select migration_name, finished_at, rolled_back_at from public._prisma_migrations order by migration_name')).rows
      : [];
    const schema = await inspectSchema(client);
    const local = readdirSync(resolve(import.meta.dirname, '..', 'prisma', 'migrations'), { withFileTypes: true })
      .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
    const applied = migrations.filter(row => row.finished_at != null).map(row => row.migration_name);
    const values = loadEnvironment().values;
    console.log(JSON.stringify({
      provider: 'supabase', database: identity.database, role: sanitizeAdministrativeText(String(identity.role)),
      host: hostname, projectRef: values.SUPABASE_PROJECT_REF, projectIdentity: 'Comparar host e projectRef com painel Connect; PostgreSQL sozinho nao comprova o projeto.',
      branch: { verified: false, limitation: 'Nenhuma evidencia de branch obtida do provedor; nome do banco nao comprova branch.' },
      readOnly: identity.transaction_read_only === 'on',
      appliedMigrations: applied, pendingMigrations: local.filter(name => !applied.includes(name)),
      incompleteMigrations: migrations.filter(row => row.finished_at == null && row.rolled_back_at == null).map(row => row.migration_name),
      unknownMigrations: applied.filter(name => !local.includes(name)), ...schema,
    }, null, 2));
  } finally {
    try {
      await client.query('ROLLBACK');
    } finally {
      await client.end();
    }
  }
} catch (error) {
  console.error(JSON.stringify({ result: 'falhou', message: safeMessage(error) }));
  process.exitCode = 1;
}
