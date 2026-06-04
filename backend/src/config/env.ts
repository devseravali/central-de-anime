import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const isTestEnv = process.env.NODE_ENV === 'test';
const envFilePath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../',
  isTestEnv ? '.env.test' : '.env',
);

dotenv.config({
  path: envFilePath,
});

const envInput = {
  ...process.env,
  JWT_SECRET:
    process.env.JWT_SECRET ??
    (isTestEnv ? 'test-jwt-secret-with-at-least-32-characters' : undefined),
  SESSION_SECRET:
    process.env.SESSION_SECRET ??
    (isTestEnv ? 'test-session-secret-with-at-least-32-characters' : undefined),
};

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),

  PORT: z.coerce.number().int().positive().default(3000),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória.'),

  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET deve ter no mínimo 32 caracteres.'),

  SESSION_SECRET: z
    .string()
    .min(32, 'SESSION_SECRET deve ter no mínimo 32 caracteres.'),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  SESSION_NAME: z.string().optional(),
  SESSION_MAX_AGE_MS: z.coerce.number().int().positive().optional(),
  SESSION_STORE: z.enum(['redis', 'pg', 'memory']).optional(),
  REDIS_URL: z.string().url().optional(),

  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),

  RATE_LIMIT_GLOBAL: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_AUTH: z.coerce.number().int().positive().optional(),
  RATE_LIMIT_REGISTER: z.coerce.number().int().positive().optional(),
});

const parsedEnv = envSchema.safeParse(envInput);

if (!parsedEnv.success) {
  console.error(parsedEnv.error.format());
  throw new Error('Erro ao validar variáveis de ambiente');
}

export const env = parsedEnv.data;
