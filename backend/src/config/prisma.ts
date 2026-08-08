import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient as PrismaClientClass } from '../../generated/prisma/client';
import type { PrismaClient as PrismaClientType } from '../../generated/prisma/client';
import type { Prisma } from '../../generated/prisma/client';

const connectionString = process.env.DATABASE_URL ?? '';

const adapter = connectionString
  ? new PrismaPg({
      connectionString,
    })
  : undefined;

declare global {
  var __prisma: PrismaClientType | undefined;
}

const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'production'
    ? ['error', 'warn']
    : ['query', 'info', 'warn', 'error'];

let prismaInstance: PrismaClientType;

if (adapter) {
  const opts: Prisma.PrismaClientOptions = {
    adapter,
    log: logLevels,
  };

  prismaInstance =
    global.__prisma ?? new PrismaClientClass(opts);
} else if (process.env.PRISMA_ACCELERATE_URL) {
  const opts: Prisma.PrismaClientOptions = {
    accelerateUrl: process.env.PRISMA_ACCELERATE_URL,
    log: logLevels,
  };

  prismaInstance =
    global.__prisma ?? new PrismaClientClass(opts);
} else {
  throw new Error(
    'DATABASE_URL ou PRISMA_ACCELERATE_URL não foi definido.'
  );
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}