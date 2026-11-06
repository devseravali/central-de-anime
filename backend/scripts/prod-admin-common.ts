import { appendFileSync, closeSync, mkdirSync, openSync, readFileSync, writeSync } from 'node:fs';
import { join, resolve } from 'node:path';
import pg from 'pg';
import { parseIntoClientConfig } from 'pg-connection-string';
import { loadEnvironment } from '../src/config/environment';
import {
  AdminAuthorizationError, assertProductionIdentity, auditRecord, type AdminAuthorization, type AuditRecord,
} from '../src/config/productionAdmin';

export const AUDIT_FILE = resolve(import.meta.dirname, '..', 'admin-audit.log');
export const NONCE_DIRECTORY = resolve(import.meta.dirname, '..', '.prod-admin-nonces');

export function readUsedNonces(file = AUDIT_FILE): Set<string> {
  let contents: string;
  try {
    contents = readFileSync(file, 'utf8');
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return new Set();
    throw error;
  }
  const nonces = new Set<string>();
  for (const line of contents.split('\n').filter(Boolean)) {
    let entry: Partial<AuditRecord>;
    try {
      entry = JSON.parse(line) as Partial<AuditRecord>;
    } catch {
      throw new Error('Arquivo de auditoria corrompido; operacao administrativa bloqueada.');
    }
    if (typeof entry.nonce !== 'string' || !/^[a-f0-9]{16}$/.test(entry.nonce) ||
        !['iniciada', 'concluida', 'falhou'].includes(entry.result ?? '')) {
      throw new Error('Registro de auditoria invalido; operacao administrativa bloqueada.');
    }
    nonces.add(entry.nonce);
  }
  return nonces;
}

export function consumeAuthorizationNonce(auth: AdminAuthorization, directory = NONCE_DIRECTORY): void {
  if (!/^[a-f0-9]{16}$/.test(auth.nonce)) {
    throw new AdminAuthorizationError('Nonce de autorizacao invalido.');
  }
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const lockPath = join(directory, `${auth.nonce}.lock`);
  let descriptor: number;
  try {
    descriptor = openSync(lockPath, 'wx', 0o600);
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'EEXIST') {
      throw new AdminAuthorizationError('Autorizacao ja utilizada; emita uma nova.');
    }
    throw error;
  }
  try {
    writeSync(descriptor, `${auth.nonce}\n`);
  } finally {
    closeSync(descriptor);
  }
}

export function writeAudit(auth: AdminAuthorization, hostname: string, result: AuditRecord['result'], detail?: string): void {
  appendFileSync(AUDIT_FILE, `${JSON.stringify(auditRecord(auth, hostname, result, detail))}\n`, { mode: 0o600 });
}

export function assertCleanInvocation(allowedArgs = 0): void {
  if (process.env.NODE_OPTIONS) throw new Error('NODE_OPTIONS herdado nao permitido.');
  if (process.argv.slice(2).length > allowedArgs) throw new Error('Argumentos adicionais nao permitidos.');
}

// Conexao pg somente leitura, usada para identidade, preflight e inspecao.
export async function openReadOnlyClient(kind: 'DATABASE_URL' | 'DATABASE_URL_UNPOOLED') {
  const policy = loadEnvironment();
  const url = policy.values[kind];
  if (!url) throw new Error(`${kind} obrigatoria.`);
  const client = new pg.Client({
    ...parseIntoClientConfig(url),
    options: '-c default_transaction_read_only=on -c statement_timeout=10000 -c row_security=off',
  });
  await client.connect();
  const { rows } = await client.query(
    "select current_database() as database, current_user as role, current_setting('transaction_read_only') as transaction_read_only",
  );
  assertProductionIdentity(rows[0], true);
  const hostname = new URL(url).hostname;
  return { client, hostname };
}

export function safeMessage(error: unknown): string {
  const text = error instanceof Error ? error.message : 'erro desconhecido';
  return text.replace(/postgres(ql)?:\/\/\S+/gi, '[url omitida]').slice(0, 300);
}
