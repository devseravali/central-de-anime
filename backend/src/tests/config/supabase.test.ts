import { afterEach, describe, expect, it, vi } from 'vitest';
import { assertSupabaseDestination } from '../../config/supabase';
import { sanitizeAdministrativeText } from '../../config/sanitization';
import { auditRecord, authorizeProductionAdmin, confirmationFor } from '../../config/productionAdmin';
import { readUsedNonces, safeMessage } from '../../../scripts/prod-admin-common';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const config = { SUPABASE_PROJECT_REF: 'abcdefghijklmnopqrst', SUPABASE_POOLER_HOST: 'aws-0-test.pooler.supabase.com' };
const direct = 'postgresql://postgres@db.abcdefghijklmnopqrst.supabase.co/postgres?sslmode=verify-full';
const session = 'postgresql://postgres.abcdefghijklmnopqrst@aws-0-test.pooler.supabase.com:5432/postgres?sslmode=verify-full';
afterEach(() => vi.unstubAllEnvs());

describe('Supabase: identidade de destino explicita', () => {
  it('permite direto e sessao, bloqueia projeto divergente e transacional administrativo', () => {
    expect(() => assertSupabaseDestination(new URL(direct), config, true)).not.toThrow();
    expect(() => assertSupabaseDestination(new URL(session), config, true)).not.toThrow();
    expect(() => assertSupabaseDestination(new URL(session.replace(':5432', ':6543')), config, true)).toThrow('transacional');
    expect(() => assertSupabaseDestination(new URL(session.replace('postgres.abc', 'postgres.xyz')), config, true)).toThrow('projeto');
    expect(() => assertSupabaseDestination(new URL(direct), {}, true)).toThrow('PROJECT_REF');
    expect(() => assertSupabaseDestination(new URL(direct.replace('/postgres?', '/test?')), config, true)).toThrow('Database');
  });
  it('nao imprime senha solta, URL ou tokens na mensagem nem na auditoria', () => {
    vi.stubEnv('DATABASE_URL', direct.replace('postgres@', 'postgres:private-password@'));
    const reason = `motivo ${process.env.DATABASE_URL} token=abc123 senha=xyz`;
    const op = 'migrate:20261103220000_add_estacao_anime';
    const auth = authorizeProductionAdmin(op, {
      APP_ENV: 'production', PROD_ADMIN_OPERATION: op, PROD_ADMIN_CONFIRMATION: confirmationFor(op),
      PROD_ADMIN_REASON: reason, PROD_ADMIN_EXPIRES_AT: '2030-01-01T12:10:00.000Z',
    }, new Date('2030-01-01T12:00:00Z'));
    for (const result of [safeMessage(new Error(`private-password ${reason}`)),
      JSON.stringify(auditRecord(auth, 'safe-host', 'falhou', reason)), sanitizeAdministrativeText(reason)]) {
      expect(result).not.toContain('private-password');
      expect(result).not.toContain('abc123');
      expect(result).not.toContain('xyz');
      expect(result).not.toContain('postgresql://');
    }
  });
  it('falha de leitura de auditoria bloqueia sem imprimir caminho interno', () => {
    expect(() => readUsedNonces(resolve(import.meta.dirname))).toThrow('Falha ao ler auditoria');
  });
  it('runner bloqueado nao inicia Prisma, abre conexao ou consome nonce', () => {
    const source = readFileSync(resolve(import.meta.dirname, '../../../scripts/prod-migrate.ts'), 'utf8');
    expect(source).not.toMatch(/spawnSync|consumeAuthorizationNonce|openReadOnlyClient/);
    expect(source).toContain('identidade da sessao efetiva');
    expect(source).toContain('backup restauravel');
  });
});
