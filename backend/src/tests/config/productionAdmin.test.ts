import { describe, expect, it, vi } from 'vitest';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import {
  APPROVED_MIGRATIONS, APPROVED_MIGRATION_SHA256, PRODUCTION_SEEDS, assertApprovedMigrationChecksum,
  assertApprovedMigrationCommand, assertOnlyApprovedPending, assertProductionIdentity,
  assertProductionMigrationPreflight, auditRecord, authorizeProductionAdmin, confirmationFor,
  migrationOperation, seedOperation,
} from '../../config/productionAdmin';
import { prismaCliDatasource } from '../../config/environment';
import { persistRecords } from '../../seed/utils/persistencia';
import { consumeAuthorizationNonce, readUsedNonces } from '../../../scripts/prod-admin-common';

const MIGRATION = APPROVED_MIGRATIONS[0];
const MIGRATION_SQL = readFileSync(new URL('../../../prisma/migrations/20261103220000_add_estacao_anime/migration.sql', import.meta.url));
const now = new Date('2030-01-01T12:00:00.000Z');
const inMinutes = (minutes: number) => new Date(now.getTime() + minutes * 60_000).toISOString();

function envFor(operation: string, overrides: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  return {
    APP_ENV: 'production',
    PROD_ADMIN_OPERATION: operation,
    PROD_ADMIN_CONFIRMATION: confirmationFor(operation),
    PROD_ADMIN_REASON: 'Aplicar migration Estacao aprovada',
    PROD_ADMIN_EXPIRES_AT: inMinutes(10),
    ...overrides,
  };
}

describe('authorizeProductionAdmin', () => {
  const op = migrationOperation(MIGRATION);

  it('aceita autorizacao completa', () => {
    expect(authorizeProductionAdmin(op, envFor(op), now).operation).toBe(op);
  });

  it('APP_ENV=production sozinho nao autoriza', () => {
    expect(() => authorizeProductionAdmin(op, { APP_ENV: 'production' }, now)).toThrow();
  });

  it.each(['local', 'staging', 'test', undefined])('rejeita APP_ENV=%s', appEnv => {
    expect(() => authorizeProductionAdmin(op, envFor(op, { APP_ENV: appEnv }), now)).toThrow(/APP_ENV=production/);
  });

  it('rejeita runtime de deploy', () => {
    expect(() => authorizeProductionAdmin(op, envFor(op, { APP_RUNTIME: 'production-deploy' }), now)).toThrow(/deploy/);
  });

  it('rejeita operacao divergente, confirmacao errada, motivo curto', () => {
    expect(() => authorizeProductionAdmin(op, envFor(seedOperation('status')), now)).toThrow();
    expect(() => authorizeProductionAdmin(op, envFor(op, { PROD_ADMIN_CONFIRMATION: 'sim' }), now)).toThrow(/CONFIRMATION/);
    expect(() => authorizeProductionAdmin(op, envFor(op, { PROD_ADMIN_REASON: 'curto' }), now)).toThrow(/REASON/);
  });

  it('rejeita expirada, invalida e longa demais', () => {
    expect(() => authorizeProductionAdmin(op, envFor(op, { PROD_ADMIN_EXPIRES_AT: inMinutes(-1) }), now)).toThrow(/expirada/);
    expect(() => authorizeProductionAdmin(op, envFor(op, { PROD_ADMIN_EXPIRES_AT: 'amanha' }), now)).toThrow(/ISO/);
    expect(() => authorizeProductionAdmin(op, envFor(op, { PROD_ADMIN_EXPIRES_AT: inMinutes(120) }), now)).toThrow(/minutos/);
  });

  it('rejeita reutilizacao de nonce', () => {
    const first = authorizeProductionAdmin(op, envFor(op), now);
    expect(() => authorizeProductionAdmin(op, envFor(op), now, new Set([first.nonce]))).toThrow(/utilizada/);
  });

  it('consome o nonce atomicamente e bloqueia execucoes concorrentes', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'prod-admin-nonce-test-'));
    try {
      const auth = authorizeProductionAdmin(op, envFor(op), now);
      const results = await Promise.allSettled([
        Promise.resolve().then(() => consumeAuthorizationNonce(auth, directory)),
        Promise.resolve().then(() => consumeAuthorizationNonce(auth, directory)),
      ]);
      expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
      expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('bloqueia arquivo de auditoria corrompido ou registro invalido', () => {
    const directory = mkdtempSync(join(tmpdir(), 'prod-admin-audit-test-'));
    const auditFile = join(directory, 'audit.log');
    try {
      writeFileSync(auditFile, '{registro incompleto\n');
      expect(() => readUsedNonces(auditFile)).toThrow(/corrompido/);
      writeFileSync(auditFile, '{"nonce":"invalido","result":"iniciada"}\n');
      expect(() => readUsedNonces(auditFile)).toThrow(/invalido/);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('rejeita operacoes fora da lista aprovada', () => {
    for (const bad of ['migrate:20990101000000_outra', 'seed:all', 'seed:anime-status', 'migrate:reset', 'seed:fixtures']) {
      expect(() => authorizeProductionAdmin(bad, envFor(bad), now)).toThrow(/aprovadas/);
    }
  });

  it('flags legadas SEED_ALLOW_* nao concedem autorizacao', () => {
    expect(() => authorizeProductionAdmin(op, { APP_ENV: 'production', SEED_ALLOW_PRODUCTION: 'true' }, now)).toThrow();
  });

  it('allowlist de seeds exclui anime-status e seed:all', () => {
    expect(Object.keys(PRODUCTION_SEEDS)).not.toContain('anime-status');
    expect(Object.keys(PRODUCTION_SEEDS)).not.toContain('all');
  });
});

describe('migration SQL e ticket de preflight', () => {
  it('verifica o hash aprovado do SQL e rejeita alteracao de conteudo', () => {
    expect(APPROVED_MIGRATION_SHA256[MIGRATION]).toMatch(/^[a-f0-9]{64}$/);
    expect(() => assertApprovedMigrationChecksum(MIGRATION, MIGRATION_SQL)).not.toThrow();
    expect(() => assertApprovedMigrationChecksum(MIGRATION, Buffer.concat([MIGRATION_SQL, Buffer.from('\n-- alterado')]))).toThrow(/SQL aprovado/);
  });

  it('aceita o mesmo SQL com LF e CRLF em string ou bytes', () => {
    const lf = MIGRATION_SQL.toString('utf8').replace(/\r\n/g, '\n');
    const crlf = lf.replace(/\n/g, '\r\n');
    for (const sql of [lf, crlf, Buffer.from(lf), Buffer.from(crlf)]) {
      expect(() => assertApprovedMigrationChecksum(MIGRATION, sql)).not.toThrow();
    }
    expect(() => assertApprovedMigrationChecksum(MIGRATION, lf.replace('"Estacao"', '"OutraTabela"'))).toThrow(/SQL aprovado/);
    expect(() => assertApprovedMigrationChecksum(MIGRATION, lf.replace('CREATE TABLE', 'CREATE  TABLE'))).toThrow(/SQL aprovado/);
  });

  it('exige ticket aleatorio ligado ao processo executor e a migration aprovada', () => {
    const operation = migrationOperation(MIGRATION);
    const env = envFor(operation, { PROD_ADMIN_EXPIRES_AT: new Date(Date.now() + 10 * 60_000).toISOString() });
    const authorization = authorizeProductionAdmin(operation, env);
    const token = 'a'.repeat(64);
    const ticket = {
      token,
      parentPid: process.pid,
      operation,
      nonce: authorization.nonce,
      expiresAt: env.PROD_ADMIN_EXPIRES_AT,
      migration: MIGRATION,
      migrationSha256: APPROVED_MIGRATION_SHA256[MIGRATION],
      migrationsPath: resolve('migrations-snapshot'),
      migrationNames: [MIGRATION],
    };
    expect(assertProductionMigrationPreflight(ticket, token, process.pid, env)).toEqual(ticket);
    expect(() => assertProductionMigrationPreflight(ticket, token, process.pid + 1, env)).toThrow(/nao corresponde/);
    expect(() => assertProductionMigrationPreflight(ticket, 'b'.repeat(64), process.pid, env)).toThrow(/invalido/);
  });
});

describe('assertApprovedMigrationCommand', () => {
  it('permite somente migrate deploy sem argumentos extras', () => {
    expect(() => assertApprovedMigrationCommand(['migrate', 'deploy'])).not.toThrow();
    for (const args of [
      ['migrate', 'reset'], ['migrate', 'dev'], ['db', 'push'], ['db', 'seed'], ['db', 'execute'],
      ['migrate', 'deploy', '--url', 'postgres://x'], ['migrate', 'deploy', '--schema', 'x.prisma'],
      ['migrate', 'deploy', '--config', 'x.ts'], ['migrate', 'deploy', '--force'], [],
    ]) {
      expect(() => assertApprovedMigrationCommand(args)).toThrow();
    }
  });
});

describe('assertOnlyApprovedPending', () => {
  const done = (name: string) => ({ migration_name: name, finished_at: new Date(), rolled_back_at: null });

  it('aceita quando a unica pendente e a aprovada', () => {
    expect(() => assertOnlyApprovedPending(['a', MIGRATION], [done('a')], MIGRATION)).not.toThrow();
  });
  it('aborta com outra migration pendente', () => {
    expect(() => assertOnlyApprovedPending(['a', 'b', MIGRATION], [done('a')], MIGRATION)).toThrow(/divergem/);
  });
  it('aborta se a aprovada ja foi aplicada', () => {
    expect(() => assertOnlyApprovedPending(['a', MIGRATION], [done('a'), done(MIGRATION)], MIGRATION)).toThrow(/divergem/);
  });
  it('aborta com migration incompleta ou divergente', () => {
    const broken = { migration_name: 'a', finished_at: null, rolled_back_at: null };
    expect(() => assertOnlyApprovedPending(['a', MIGRATION], [broken], MIGRATION)).toThrow(/incompletas/);
    expect(() => assertOnlyApprovedPending([MIGRATION], [done('zzz')], MIGRATION)).toThrow(/divergencia/);
  });
  it('rejeita migration nao aprovada', () => {
    expect(() => assertOnlyApprovedPending(['x'], [], 'x')).toThrow(/nao aprovada/);
  });
});

describe('assertProductionIdentity', () => {
  it('valida banco e modo somente leitura', () => {
    expect(() => assertProductionIdentity({ database: 'neondb', role: 'r', transaction_read_only: 'on' }, true)).not.toThrow();
    expect(() => assertProductionIdentity({ database: 'neondb_staging', role: 'r', transaction_read_only: 'on' }, true)).toThrow();
    expect(() => assertProductionIdentity({ database: 'neondb', role: 'r', transaction_read_only: 'off' }, true)).toThrow();
  });
});

describe('auditoria', () => {
  it('nao registra credenciais nem host em claro', () => {
    const op = migrationOperation(MIGRATION);
    const auth = authorizeProductionAdmin(op, envFor(op), now);
    const record = auditRecord(auth, 'ep-secret.neon.tech', 'falhou', 'erro postgresql://user:senha@host/db', now);
    const text = JSON.stringify(record);
    expect(text).not.toMatch(/senha|ep-secret|postgresql:\/\//);
    expect(record.hostFingerprint).toHaveLength(12);
  });
});

describe('prismaCliDatasource em producao', () => {
  it('sem autorizacao continua bloqueado', () => {
    vi.stubEnv('APP_ENV', 'production');
    vi.stubEnv('PROD_ADMIN_OPERATION', '');
    expect(() => prismaCliDatasource(['migrate', 'deploy'])).toThrow(/bloqueados/);
    vi.unstubAllEnvs();
  });

  it('com autorizacao, comandos nao aprovados e staging seguem bloqueados', () => {
    const op = migrationOperation(MIGRATION);
    vi.stubEnv('PROD_ADMIN_OPERATION', op);
    vi.stubEnv('APP_ENV', 'production');
    for (const args of [['migrate', 'reset'], ['db', 'push'], ['migrate', 'dev'], ['db', 'seed'], ['db', 'execute']]) {
      expect(() => prismaCliDatasource(args)).toThrow();
    }
    vi.stubEnv('APP_ENV', 'staging');
    expect(() => prismaCliDatasource(['migrate', 'deploy'])).toThrow(/bloqueados/);
    vi.unstubAllEnvs();
  });

  it('preflight calculado manualmente nao autoriza o Prisma CLI direto', () => {
    const op = migrationOperation(MIGRATION);
    vi.stubEnv('APP_ENV', 'production');
    vi.stubEnv('PROD_ADMIN_OPERATION', op);
    vi.stubEnv('PROD_ADMIN_CONFIRMATION', confirmationFor(op));
    vi.stubEnv('PROD_ADMIN_REASON', 'Aplicar migration Estacao aprovada');
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
    vi.stubEnv('PROD_ADMIN_EXPIRES_AT', expiresAt);
    vi.stubEnv('PROD_ADMIN_PREFLIGHT', authorizeProductionAdmin(op, envFor(op, { PROD_ADMIN_EXPIRES_AT: expiresAt })).nonce);
    expect(() => prismaCliDatasource(['migrate', 'deploy'])).toThrow(/Ticket de preflight/);
    vi.unstubAllEnvs();
  });

  it('rejeita migrations adicionadas fora do snapshot validado', () => {
    const operation = migrationOperation(MIGRATION);
    const expiresAt = new Date(Date.now() + 10 * 60_000).toISOString();
    const env = envFor(operation, { PROD_ADMIN_EXPIRES_AT: expiresAt });
    const authorization = authorizeProductionAdmin(operation, env);
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'prod-admin-snapshot-test-'));
    const migrationsPath = join(temporaryDirectory, 'migrations');
    const ticketFile = join(temporaryDirectory, 'preflight.json');
    const token = 'c'.repeat(64);
    try {
      mkdirSync(join(migrationsPath, MIGRATION), { recursive: true });
      mkdirSync(join(migrationsPath, '20261103220001_unapproved'));
      writeFileSync(join(migrationsPath, 'migration_lock.toml'), 'provider = "postgresql"\n');
      writeFileSync(join(migrationsPath, MIGRATION, 'migration.sql'), MIGRATION_SQL);
      writeFileSync(join(migrationsPath, '20261103220001_unapproved', 'migration.sql'), 'SELECT 1;\n');
      writeFileSync(ticketFile, JSON.stringify({
        token,
        parentPid: process.ppid,
        operation,
        nonce: authorization.nonce,
        expiresAt,
        migration: MIGRATION,
        migrationSha256: APPROVED_MIGRATION_SHA256[MIGRATION],
        migrationsPath,
        migrationNames: [MIGRATION],
      }));

      vi.stubEnv('APP_ENV', 'production');
      vi.stubEnv('PROD_ADMIN_OPERATION', operation);
      vi.stubEnv('PROD_ADMIN_CONFIRMATION', confirmationFor(operation));
      vi.stubEnv('PROD_ADMIN_REASON', env.PROD_ADMIN_REASON);
      vi.stubEnv('PROD_ADMIN_EXPIRES_AT', expiresAt);
      vi.stubEnv('PROD_ADMIN_PREFLIGHT_FILE', ticketFile);
      vi.stubEnv('PROD_ADMIN_PREFLIGHT_TOKEN', token);
      expect(() => prismaCliDatasource(['migrate', 'deploy'])).toThrow(/Snapshot de migrations diverge/);
    } finally {
      vi.unstubAllEnvs();
      rmSync(temporaryDirectory, { recursive: true, force: true });
    }
  });
});

describe('persistRecords insertOnly', () => {
  it('nao atualiza registros existentes divergentes', async () => {
    const update = vi.fn();
    const create = vi.fn();
    const store = {
      list: async () => [{ id: 1, nome: 'producao' }],
      create, update,
    } as never;
    const prisma = { $transaction: async (fn: (db: unknown) => unknown) => fn({}) };
    const report = { modulo: 't', lidos: 2, inseridos: 0, atualizados: 0, inalterados: 0, naoExecutados: 0, erros: [] } as never;
    await persistRecords({ prisma, log: () => undefined, insertOnly: true } as never, report,
      [{ id: 1, nome: 'json' }, { id: 2, nome: 'novo' }] as never, store);
    expect(update).not.toHaveBeenCalled();
    expect(create).toHaveBeenCalledTimes(1);
  });
});
