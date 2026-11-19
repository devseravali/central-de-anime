import { AdminAuthorizationError, authorizeProductionAdmin, PRODUCTION_SEEDS, seedOperation } from '../src/config/productionAdmin';
import { assertCleanInvocation, readUsedNonces, safeMessage } from './prod-admin-common';

try {
  assertCleanInvocation(1);
  const seed = process.argv[2] ?? '';
  if (!Object.hasOwn(PRODUCTION_SEEDS, seed)) throw new AdminAuthorizationError('Seed nao permitido em producao.');
  authorizeProductionAdmin(seedOperation(seed), process.env, new Date(), readUsedNonces());
  throw new AdminAuthorizationError('Importacao de producao bloqueada: identidade da sessao efetiva de escrita e schema migrado nao comprovados. Nenhum nonce consumido.');
} catch (error) {
  console.error(JSON.stringify({ result: 'bloqueada', message: safeMessage(error) }));
  process.exitCode = 1;
}
