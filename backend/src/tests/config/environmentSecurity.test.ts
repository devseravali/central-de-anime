import { createRequire } from 'node:module';
import type { Request, Response, NextFunction } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  adapter: vi.fn(),
  extend: vi.fn(),
  transport: vi.fn(),
}));
vi.mock('node:fs', async importOriginal => ({
  ...await importOriginal<typeof import('node:fs')>(),
  readFileSync: mocks.read,
}));
vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: class {
    constructor(options: unknown) { mocks.adapter(options); }
  },
}));
vi.mock('../../../generated/prisma/client', () => ({
  PrismaClient: class { $extends = mocks.extend; },
}));
vi.mock('nodemailer', () => ({
  default: { createTransport: mocks.transport },
}));

const sourceHost = 'ep-withered-cherry-b6giwtqf.c-2.sa-east-1.aws.neon.tech';
const prod = (query = 'sslmode=require') => ({
  DATABASE_URL: `postgresql://${sourceHost}/neondb?${query}`,
  DATABASE_URL_UNPOOLED: `postgresql://${sourceHost}/neondb?${query}`,
});
const file = () => Object.entries({
  ...prod(), RENDER: 'true', APP_RUNTIME: 'production-deploy', NODE_ENV: 'production',
}).map(([key, value]) => `${key}=${value}`).join('\n');

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  for (const key of Object.keys(process.env)) {
    if (/^(DATABASE_|JWT_|FRONTEND_|MAIL_|SESSION_|REDIS_|SMTP_|PG|DB_|PRISMA_|SEED_)/.test(key)) {
      vi.stubEnv(key, undefined);
    }
  }
  vi.stubEnv('APP_ENV', 'production');
  vi.stubEnv('APP_RUNTIME', 'readonly');
  vi.stubEnv('RENDER', 'false');
  mocks.read.mockReturnValue(file());
  mocks.extend.mockReturnValue({});
  delete global.__prisma;
  delete global.__prismaEnvironment;
});
afterEach(() => {
  delete global.__prisma;
  delete global.__prismaEnvironment;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe('Regressao: politica unica e imutavel', () => {
  it('arquivo nao promove readonly; Prisma, HTTP e mailer reutilizam a mesma resolucao', async () => {
    const { loadEnvironment } = await import('../../config/environment');
    const initial = loadEnvironment();
    expect(initial.readOnly).toBe(true);
    expect(initial.mailEnabled).toBe(false);
    expect(process.env.RENDER).toBe('false');
    expect(process.env.APP_RUNTIME).toBe('readonly');
    expect(Object.isFrozen(initial)).toBe(true);
    expect(Object.isFrozen(initial.values)).toBe(true);
    expect(Object.isFrozen(initial.urls.application)).toBe(true);
    expect(() => Object.assign(initial, { readOnly: false })).toThrow();
    expect(() => Object.assign(initial.values, { DATABASE_URL: 'other' })).toThrow();

    vi.stubEnv('RENDER', 'true');
    vi.stubEnv('APP_RUNTIME', 'production-deploy');
    vi.stubEnv('APP_ENV', 'staging');
    expect(loadEnvironment()).toBe(initial);
    await import('../../config/prisma');
    expect(mocks.adapter).toHaveBeenCalledWith(expect.objectContaining({
      options: '-c default_transaction_read_only=on',
    }));
    const query = vi.fn();
    for (const operation of ['create', 'update', 'delete', '$queryRaw', '$executeRawUnsafe']) {
      expect(() => mocks.extend.mock.calls[0][0].query.$allOperations({ operation, args: {}, query }))
        .toThrow('somente leitura');
    }
    expect(query).not.toHaveBeenCalled();

    const { readOnlyEnvironment } = await import('../../middlewares/readOnlyEnvironment');
    const status = vi.fn().mockReturnThis();
    const json = vi.fn();
    const next = vi.fn();
    readOnlyEnvironment(
      { method: 'POST' } as Request,
      { status, json } as unknown as Response,
      next as NextFunction,
    );
    expect(status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    const { sendMail } = await import('../../config/mailer');
    await expect(sendMail({ text: 'blocked' })).rejects.toThrow('desabilitado');
    expect(mocks.transport).not.toHaveBeenCalled();
    expect(mocks.read).toHaveBeenCalledOnce();
  });

  it('RENDER=true sozinho nao autoriza deploy', async () => {
    vi.stubEnv('RENDER', 'true');
    vi.stubEnv('APP_RUNTIME', undefined);
    const { loadEnvironment } = await import('../../config/environment');
    expect(loadEnvironment().readOnly).toBe(true);
  });

  it('autorizacao de deploy explicita exige metadados e continua bloqueando administracao', async () => {
    vi.stubEnv('APP_RUNTIME', 'production-deploy');
    vi.stubEnv('RENDER', 'true');
    vi.stubEnv('RENDER_SERVICE_ID', undefined);
    const { loadEnvironment, assertAdministrativeWrite } = await import('../../config/environment');
    expect(() => loadEnvironment()).toThrow('metadados');
    vi.stubEnv('RENDER_SERVICE_ID', 'synthetic-service');
    vi.stubEnv('RENDER_INSTANCE_ID', 'synthetic-instance');
    for (const [key, value] of Object.entries(prod())) vi.stubEnv(key, value);
    expect(loadEnvironment().readOnly).toBe(false);
    expect(mocks.read).not.toHaveBeenCalled();
    expect(() => assertAdministrativeWrite('production')).toThrow('bloqueados');
  });
});

describe('Regressao: URLs TLS ambiguas rejeitadas antes do adapter', () => {
  it.each([
    'sslmode=require&sslmode=disable',
    'sslmode=disable&sslmode=require',
    'sslmode=verify-full&sslmode=disable',
    'sslmode=disable&sslmode=verify-full',
    'ssl=true&ssl=false&sslmode=require',
    'ssl=false&ssl=true&sslmode=require',
    'sslmode=require&ssl=false',
    'ssl=false&sslmode=require',
    'sslmode=require&%73slmode=disable',
  ])('rejeita %s sem construir adapter', async parameters => {
    mocks.read.mockReturnValue(Object.entries(prod(parameters)).map(([k, v]) => `${k}=${v}`).join('\n'));
    await expect(import('../../config/prisma')).rejects.toThrow();
    expect(mocks.adapter).not.toHaveBeenCalled();
  });

  it('driver instalado confirma TLS nas duas URLs aceitas', async () => {
    const require = createRequire(import.meta.url);
    const pgRequire = createRequire(require.resolve('pg'));
    const parser: { parse: (value: string) => { ssl?: unknown } } = pgRequire('pg-connection-string');
    const { validateDatabaseUrls } = await import('../../config/environment');
    for (const mode of ['require', 'verify-full']) {
      const values = prod(`sslmode=${mode}`);
      validateDatabaseUrls('production', values);
      for (const value of Object.values(values)) {
        const ssl = parser.parse(value).ssl;
        expect(ssl).toBeTruthy();
        expect(ssl).not.toBe(false);
        expect(ssl).not.toEqual(expect.objectContaining({ rejectUnauthorized: false }));
      }
    }
  });

  it('rejeita duplicatas tambem na URL direta', async () => {
    const { validateDatabaseUrls } = await import('../../config/environment');
    expect(() => validateDatabaseUrls('production', {
      ...prod(), DATABASE_URL_UNPOOLED: prod('sslmode=require&sslmode=disable').DATABASE_URL_UNPOOLED,
    })).toThrow('duplicado');
  });
});
