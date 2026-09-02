import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'node:path';

import {
  PrismaClient,
  type Prisma,
  type PrismaClient as PrismaClientType,
} from '../../generated/prisma/client';

if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, '../../.env');

  dotenv.config({
    path: envPath,
  });
}

declare global {
  var __prisma: PrismaClientType | undefined;
}

const logLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'production'
    ? ['error', 'warn']
    : ['query', 'info', 'warn', 'error'];

let prismaInstance: PrismaClientType;

if (process.env.DATABASE_URL) {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  prismaInstance =
    global.__prisma ??
    new PrismaClient({
      adapter,
      log: logLevels,
    });
} else if (process.env.PRISMA_ACCELERATE_URL) {
  prismaInstance =
    global.__prisma ??
    new PrismaClient({
      accelerateUrl: process.env.PRISMA_ACCELERATE_URL,
      log: logLevels,
    });
} else {
  throw new Error(
    'DATABASE_URL ou PRISMA_ACCELERATE_URL não foi definido.'
  );
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}