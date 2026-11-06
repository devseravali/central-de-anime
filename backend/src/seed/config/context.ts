import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, type Prisma } from '../../../generated/prisma/client';
import {
  assertAdministrativeWrite, loadEnvironment, selectEnvironment, validateDatabaseUrls,
} from '../../config/environment';
import { authorizeProductionAdmin, seedOperation } from '../../config/productionAdmin';

export type SeedDatabase = Prisma.TransactionClient;
export type SeedContext = {
  prisma: PrismaClient;
  log: (message: string) => void;
  insertOnly?: boolean;
};

export function assertSeedDestination(env: NodeJS.ProcessEnv): string {
  const environment = selectEnvironment(env.APP_ENV);
  assertAdministrativeWrite(environment);
  return validateDatabaseUrls(environment, env).application.toString();
}

// Contexto exclusivo dos runners de producao: exige autorizacao ja validada
// (a de seed individual) e nunca atualiza registros existentes.
export function createAuthorizedProductionSeedContext(seed: string): SeedContext {
  authorizeProductionAdmin(seedOperation(seed), process.env);
  if (selectEnvironment(process.env.APP_ENV) !== 'production') {
    throw new Error('Contexto de seed autorizado so existe em producao.');
  }
  const adapter = new PrismaPg({ connectionString: loadEnvironment().values.DATABASE_URL });
  return {
    prisma: new PrismaClient({ adapter, log: [] }),
    log: (message) => console.log(message),
    insertOnly: true,
  };
}

export function createSeedContext(): SeedContext {
  assertAdministrativeWrite(selectEnvironment(process.env.APP_ENV));
  loadEnvironment();
  const adapter = new PrismaPg({ connectionString: assertSeedDestination(process.env) });
  return {
    prisma: new PrismaClient({ adapter, log: [] }),
    log: (message) => console.log(message),
  };
}
