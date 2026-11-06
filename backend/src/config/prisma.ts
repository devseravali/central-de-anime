import { PrismaPg } from '@prisma/adapter-pg';
import { loadEnvironment } from './environment';
import { assertDatabaseOperation } from './databasePolicy';

import {
  PrismaClient,
  type Prisma,
} from '../../generated/prisma/client';

const environment = loadEnvironment();

declare global {
  var __prisma: ReturnType<typeof createClient> | undefined;
  var __prismaEnvironment: string | undefined;
}

function createClient() {
  const logLevels: Prisma.LogLevel[] = [];
  const adapter = new PrismaPg({
    connectionString: environment.values.DATABASE_URL,
    ...(environment.readOnly ? { options: '-c default_transaction_read_only=on' } : {}),
  });
  return new PrismaClient({ adapter, log: logLevels }).$extends({
    query: {
      $allOperations({ operation, args, query }) {
        assertDatabaseOperation(environment.readOnly, operation);
        return query(args);
      },
    },
  });
}

const identity = JSON.stringify([
  environment.environment, environment.values.DATABASE_URL, environment.readOnly,
]);
if (global.__prisma && global.__prismaEnvironment !== identity) {
  throw new Error('Cliente Prisma existente pertence a outro ambiente. Reinicie o processo.');
}

export const prisma = global.__prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
  global.__prismaEnvironment = identity;
}