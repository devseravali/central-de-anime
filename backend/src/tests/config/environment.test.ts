import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  assertAdministrativeWrite, loadEnvironment, resolveEnvironment, selectEnvironment,
  validateDatabaseUrls, type AppEnvironment, type EnvironmentValues,
} from '../../config/environment';
import { assertDatabaseOperation } from '../../config/databasePolicy';
import { readOnlyEnvironment } from '../../middlewares/readOnlyEnvironment';
import express from 'express';
import request from 'supertest';
import pg from 'pg';
import * as environmentModule from '../../config/environment';

const localValues = (environment: 'local' | 'staging' | 'test' = 'local'): EnvironmentValues => {
  const database = { local: 'centraldeanime', staging: 'centraldeanime_staging', test: 'centraldeanimetest' }[environment];
  return {
    APP_ENV: environment,
    DATABASE_URL: `postgresql://localhost:5432/${database}`,
    DATABASE_URL_UNPOOLED: `postgresql://localhost:5432/${database}`,
    JWT_SECRET: 'local-only-secret-'.repeat(4),
    JWT_REFRESH_SECRET: 'local-refresh-secret-'.repeat(4),
    SESSION_STORE: 'memory',
    MAIL_MODE: 'disabled',
    FRONTEND_URL: 'http://localhost:5173',
  };
};
const prodValues = (): EnvironmentValues => ({
  DATABASE_URL: 'postgresql://ep-withered-cherry-b6giwtqf-pooler.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require',
  DATABASE_URL_UNPOOLED: 'postgresql://ep-withered-cherry-b6giwtqf.c-2.sa-east-1.aws.neon.tech/neondb?sslmode=require',
});

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

describe('Selecao explicita de ambiente', () => {
  it('exige selecao, sem inferencia por NODE_ENV', () => {
    expect(() => selectEnvironment(undefined)).toThrow('Selecione APP_ENV');
    expect(() => selectEnvironment('development')).toThrow('Selecione APP_ENV');
  });

  it.each(['local', 'staging', 'test'] as const)('isola o destino de %s', environment => {
    const result = resolveEnvironment(environment, localValues(environment), {});
    expect(result.environment).toBe(environment);
    expect(result.readOnly).toBe(environment === 'staging');
    expect(result.urls.application.pathname).toBe(result.urls.direct.pathname);
  });

  it.each(['DATABASE_URL', 'DATABASE_URL_UNPOOLED', 'JWT_SECRET', 'REDIS_URL', 'SMTP_PASS', 'PGHOST', 'PRISMA_ACCELERATE_URL'])(
    'rejeita conflito herdado em %s sem revelar o valor', key => {
      expect(() => resolveEnvironment('local', localValues(), { [key]: 'sensitive-never-print' })).toThrow(key);
      try {
        resolveEnvironment('local', localValues(), { [key]: 'sensitive-never-print' });
      } catch (error) {
        expect(String(error)).not.toContain('sensitive-never-print');
      }
    },
  );

  it('permite heranca identica, nao substitui silenciosamente valores', () => {
    const values = localValues();
    expect(resolveEnvironment('local', values, { DATABASE_URL: values.DATABASE_URL }).readOnly).toBe(false);
  });

  it('rejeita seletor divergente no arquivo', () => {
    expect(() => resolveEnvironment('local', localValues('staging'), {})).toThrow('diverge');
  });

  it('nenhuma URL possui fallback para a outra', () => {
    expect(() => validateDatabaseUrls('local', { DATABASE_URL: localValues().DATABASE_URL })).toThrow('UNPOOLED');
    expect(() => validateDatabaseUrls('local', { DATABASE_URL_UNPOOLED: localValues().DATABASE_URL })).toThrow('DATABASE_URL obrigatoria');
  });

  it.each([
    'postgresql://remote.example/centraldeanime',
    'postgresql://localhost:5433/centraldeanime',
    'postgresql://localhost:5432/centraldeanime_staging',
    'postgresql://localhost:5432/centraldeanime?host=remote.example',
    'postgresql://localhost:5432/centraldeanime?options=-c%20default_transaction_read_only=off',
    'postgresql://localhost:5432/centraldeanime#unexpected',
    'not-a-url',
  ])('rejeita destino ou redirecionamento invalido', url => {
    expect(() => validateDatabaseUrls('local', { ...localValues(), DATABASE_URL: url })).toThrow();
  });

  it('exige identidade do papel e schema nas duas URLs', () => {
    expect(() => validateDatabaseUrls('local', {
      ...localValues(), DATABASE_URL_UNPOOLED: 'postgresql://different@localhost:5432/centraldeanime',
    })).toThrow('mesmo destino');
    expect(() => validateDatabaseUrls('local', {
      ...localValues(), DATABASE_URL_UNPOOLED: 'postgresql://127.0.0.1:5432/centraldeanime',
    })).toThrow('mesmo destino');
    expect(() => validateDatabaseUrls('local', {
      ...localValues(), DATABASE_URL_UNPOOLED: 'postgresql://localhost:5432/centraldeanime?schema=other',
    })).toThrow('mesmo destino');
  });

  it('aceita Neon autorizado com TLS e rejeita endpoint alternativo e pooler direto', () => {
    expect(validateDatabaseUrls('production', prodValues()).direct.hostname).not.toContain('-pooler');
    expect(() => validateDatabaseUrls('production', {
      ...prodValues(), DATABASE_URL_UNPOOLED: prodValues().DATABASE_URL,
    })).toThrow('pooler');
    expect(() => validateDatabaseUrls('production', {
      ...prodValues(), DATABASE_URL: 'postgresql://other.neon.tech/neondb?sslmode=require',
    })).toThrow('endpoint');
    expect(() => validateDatabaseUrls('production', {
      ...prodValues(), DATABASE_URL: prodValues().DATABASE_URL?.replace('?sslmode=require', ''),
    })).toThrow('TLS');
  });

  it('producao local e somente leitura; runtime Render nao libera administracao', () => {
    expect(resolveEnvironment('production', prodValues(), {}, false).readOnly).toBe(true);
    expect(resolveEnvironment('production', prodValues(), {}, true).readOnly).toBe(false);
    expect(() => assertAdministrativeWrite('production')).toThrow('bloqueados');
    expect(() => assertAdministrativeWrite('staging')).toThrow('bloqueados');
  });

  it.each([
    { SMTP_HOST: 'localhost' }, { RESEND_API_KEY: 'test' }, { REDIS_URL: 'redis://localhost' },
    { SESSION_STORE: 'redis' }, { MAIL_MODE: 'smtp' }, { JWT_SECRET: 'short' },
    { FRONTEND_URL: 'https://production.example' }, { FRONTEND_ALLOWED_ORIGINS: 'https://production.example' },
  ])('rejeita integracoes externas ou secrets inseguros', extra => {
    expect(() => resolveEnvironment('local', { ...localValues(), ...extra }, {})).toThrow();
  });

  it('carrega o ambiente isolado de testes sem ler producao', () => {
    vi.stubEnv('APP_ENV', 'test');
    const result = loadEnvironment();
    expect(result.urls.direct.pathname).toBe('/centraldeanimetest');
    expect(result.values.MAIL_MODE).toBe('disabled');
  });
});

describe('Politica somente leitura', () => {
  it('a suite impede criar pools e clientes PostgreSQL reais', () => {
    expect(() => new pg.Pool()).toThrow('conexoes PostgreSQL reais estao bloqueadas');
    expect(() => new pg.Client()).toThrow('conexoes PostgreSQL reais estao bloqueadas');
  });
  it.each(['create', 'createMany', 'update', 'upsert', 'delete', 'deleteMany', '$executeRaw', '$queryRaw', '$queryRawUnsafe'])(
    'bloqueia %s antes de chamar o adapter', operation => {
      expect(() => assertDatabaseOperation(true, operation)).toThrow('somente leitura');
    },
  );
  it.each(['findUnique', 'findMany', 'count', 'aggregate', 'groupBy'])('permite %s', operation => {
    expect(() => assertDatabaseOperation(true, operation)).not.toThrow();
  });

  it.each(['staging', 'production'] as AppEnvironment[])('bloqueia mutacoes HTTP em %s fora do deploy', async environment => {
    vi.stubEnv('APP_ENV', environment);
    vi.stubEnv('RENDER', 'false');
    vi.spyOn(environmentModule, 'loadEnvironment').mockReturnValue(
      resolveEnvironment(environment, environment === 'production' ? prodValues() : localValues('staging'), {}),
    );
    const app = express();
    const handler = vi.fn((_req, res) => res.sendStatus(200));
    app.use(readOnlyEnvironment);
    app.all('/resource', handler);
    for (const method of ['post', 'put', 'patch', 'delete'] as const) {
      expect((await request(app)[method]('/resource')).status).toBe(403);
    }
    expect(handler).not.toHaveBeenCalled();
    expect((await request(app).get('/resource')).status).toBe(200);
  });
});
