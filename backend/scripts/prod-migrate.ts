import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  APPROVED_MIGRATION_SHA256, approvedMigrationFromEnv, assertApprovedMigrationChecksum,
  assertOnlyApprovedPending, authorizeProductionAdmin, migrationOperation, type MigrationPreflightTicket,
  type MigrationRow,
} from '../src/config/productionAdmin';
import {
  assertCleanInvocation, consumeAuthorizationNonce, openReadOnlyClient, readUsedNonces, safeMessage, writeAudit,
} from './prod-admin-common';

function createMigrationSnapshot(source: string, names: readonly string[], target: string, approved: string): string {
  const snapshot = join(target, 'migrations');
  mkdirSync(snapshot);
  writeFileSync(join(snapshot, 'migration_lock.toml'), readFileSync(join(source, 'migration_lock.toml')), { flag: 'wx' });
  for (const name of names) {
    if (!/^[0-9]{14}_[a-zA-Z0-9_-]+$/.test(name)) throw new Error('Nome de migration invalido.');
    const sql = readFileSync(join(source, name, 'migration.sql'));
    if (name === approved) assertApprovedMigrationChecksum(name, sql);
    const folder = join(snapshot, name);
    mkdirSync(folder);
    writeFileSync(join(folder, 'migration.sql'), sql, { flag: 'wx' });
  }
  return snapshot;
}

let temporaryDirectory: string | undefined;
try {
  assertCleanInvocation();
  const approved = approvedMigrationFromEnv(process.env);
  const auth = authorizeProductionAdmin(migrationOperation(approved), process.env, new Date(), readUsedNonces());
  consumeAuthorizationNonce(auth);
  const migrationsDir = resolve(import.meta.dirname, '..', 'prisma', 'migrations');
  const local = readdirSync(migrationsDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  const approvedSql = readFileSync(join(migrationsDir, approved, 'migration.sql'));
  assertApprovedMigrationChecksum(approved, approvedSql);

  const { client, hostname } = await openReadOnlyClient('DATABASE_URL_UNPOOLED');
  try {
    const { rows } = await client.query<MigrationRow>(
      'select migration_name, finished_at, rolled_back_at from _prisma_migrations order by migration_name',
    );
    assertOnlyApprovedPending(local, rows, approved);
  } finally {
    await client.end();
  }

  temporaryDirectory = mkdtempSync(join(tmpdir(), 'central-anime-prod-migrate-'));
  const snapshot = createMigrationSnapshot(migrationsDir, local, temporaryDirectory, approved);
  const token = randomBytes(32).toString('hex');
  const ticket: MigrationPreflightTicket = {
    token,
    parentPid: process.pid,
    operation: auth.operation,
    nonce: auth.nonce,
    expiresAt: process.env.PROD_ADMIN_EXPIRES_AT ?? '',
    migration: approved,
    migrationSha256: APPROVED_MIGRATION_SHA256[approved as keyof typeof APPROVED_MIGRATION_SHA256],
    migrationsPath: snapshot,
    migrationNames: local,
  };
  const ticketFile = join(temporaryDirectory, 'preflight.json');
  writeFileSync(ticketFile, JSON.stringify(ticket), { flag: 'wx', mode: 0o600 });

  writeAudit(auth, hostname, 'iniciada');
  const require = createRequire(import.meta.url);
  const result = spawnSync(process.execPath, [require.resolve('prisma/build/index.js'), 'migrate', 'deploy'], {
    shell: false, stdio: 'inherit',
    env: {
      ...process.env,
      PROD_ADMIN_PREFLIGHT_FILE: ticketFile,
      PROD_ADMIN_PREFLIGHT_TOKEN: token,
    },
  });
  const ok = result.status === 0;
  writeAudit(auth, hostname, ok ? 'concluida' : 'falhou', ok ? undefined : `exit=${result.status}`);
  console.log(JSON.stringify({ operation: auth.operation, result: ok ? 'concluida' : 'falhou' }));
  process.exitCode = ok ? 0 : 1;
} catch (error) {
  console.error(JSON.stringify({ result: 'bloqueada', message: safeMessage(error) }));
  process.exitCode = 1;
} finally {
  if (temporaryDirectory) {
    try {
      rmSync(temporaryDirectory, { recursive: true, force: true });
    } catch (error) {
      console.error(JSON.stringify({ result: 'limpeza-falhou', message: safeMessage(error) }));
      process.exitCode = 1;
    }
  }
}
