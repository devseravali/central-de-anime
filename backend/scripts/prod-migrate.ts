import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AdminAuthorizationError, approvedMigrationFromEnv, assertApprovedMigrationChecksum, authorizeProductionAdmin, migrationOperation } from '../src/config/productionAdmin';
import { assertCleanInvocation, readUsedNonces, safeMessage } from './prod-admin-common';

try {
  assertCleanInvocation();
  const approved = approvedMigrationFromEnv(process.env);
  authorizeProductionAdmin(migrationOperation(approved), process.env, new Date(), readUsedNonces());
  assertApprovedMigrationChecksum(approved, readFileSync(resolve(import.meta.dirname, '..', 'prisma', 'migrations', approved, 'migration.sql')));
  throw new AdminAuthorizationError('Migration de producao bloqueada: identidade da sessao efetiva do Prisma e backup restauravel nao comprovados. Nenhum nonce consumido ou conexao aberta.');
} catch (error) {
  console.error(JSON.stringify({ result: 'bloqueada', message: safeMessage(error) }));
  process.exitCode = 1;
}
