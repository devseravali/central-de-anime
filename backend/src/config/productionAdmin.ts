import { createHash, timingSafeEqual } from 'node:crypto';
import { isAbsolute } from 'node:path';

// Operacoes administrativas em producao exigem autorizacao explicita, restrita
// a UMA operacao aprovada, com confirmacao textual, motivo e expiracao curta.
// APP_ENV=production sozinho nunca autoriza nada.

export const APPROVED_MIGRATION_SHA256 = Object.freeze({
  '20261103220000_add_estacao_anime': 'ad3a73b2ba117daf25a237b7bf4ab9bc0c10d99a4b878944610803259e2d695d',
});
export const APPROVED_MIGRATIONS: readonly (keyof typeof APPROVED_MIGRATION_SHA256)[] = [
  '20261103220000_add_estacao_anime',
];

export const PRODUCTION_DATABASE = 'neondb';
export const MAX_AUTHORIZATION_MINUTES = 30;

// Seeds individuais permitidos em producao, na ordem de dependencia.
// Tabelas listadas em `requires` precisam conter registros antes da execucao.
// `anime-status` e `fixtures` ficam de fora: atualizam/criam dados existentes.
export const PRODUCTION_SEEDS = {
  status: { requires: [] },
  generos: { requires: [] },
  estudios: { requires: [] },
  plataformas: { requires: [] },
  tags: { requires: [] },
  franquias: { requires: [] },
  capas: { requires: [] },
  estacoes: { requires: [] },
  animes: { requires: ['status', 'estudio', 'franquia', 'capas', 'estacao'] },
  personagens: { requires: [] },
  episodios: { requires: ['anime'] },
  'anime-genero': { requires: ['anime', 'genero'] },
  'anime-personagem': { requires: ['anime', 'personagem'] },
  'anime-plataforma': { requires: ['anime', 'plataforma'] },
  'anime-tag': { requires: ['anime', 'animeTag'] },
} as const satisfies Record<string, { requires: readonly string[] }>;

export type ProductionSeed = keyof typeof PRODUCTION_SEEDS;

export class AdminAuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdminAuthorizationError';
  }
}

export type AdminAuthorization = Readonly<{
  operation: string;
  reason: string;
  expiresAt: Date;
  nonce: string;
}>;

export type MigrationPreflightTicket = Readonly<{
  token: string;
  parentPid: number;
  operation: string;
  nonce: string;
  expiresAt: string;
  migration: string;
  migrationSha256: string;
  migrationsPath: string;
  migrationNames: readonly string[];
}>;

export const migrationOperation = (name: string): string => `migrate:${name}`;
export const seedOperation = (name: string): string => `seed:${name}`;
export const confirmationFor = (operation: string): string => `CONFIRMO ${operation} EM ${PRODUCTION_DATABASE}`;

export function isApprovedOperation(operation: string): boolean {
  if (operation.startsWith('migrate:')) return APPROVED_MIGRATIONS.some(name => name === operation.slice(8));
  if (operation.startsWith('seed:')) return Object.hasOwn(PRODUCTION_SEEDS, operation.slice(5));
  return false;
}

export function authorizeProductionAdmin(
  expectedOperation: string,
  env: NodeJS.ProcessEnv,
  now: Date = new Date(),
  usedNonces: ReadonlySet<string> = new Set(),
): AdminAuthorization {
  if (env.APP_ENV !== 'production') {
    throw new AdminAuthorizationError('Operacoes administrativas de producao exigem APP_ENV=production explicito; local, staging e test nao sao alvos.');
  }
  if (env.APP_RUNTIME === 'production-deploy') {
    throw new AdminAuthorizationError('Operacoes administrativas nao rodam no runtime de deploy.');
  }
  if (!isApprovedOperation(expectedOperation)) {
    throw new AdminAuthorizationError('Operacao fora da lista de operacoes aprovadas.');
  }
  if (env.PROD_ADMIN_OPERATION !== expectedOperation) {
    throw new AdminAuthorizationError('PROD_ADMIN_OPERATION ausente ou diferente da operacao solicitada.');
  }
  if (env.PROD_ADMIN_CONFIRMATION !== confirmationFor(expectedOperation)) {
    throw new AdminAuthorizationError('PROD_ADMIN_CONFIRMATION ausente ou invalida para a operacao.');
  }
  const reason = env.PROD_ADMIN_REASON?.trim() ?? '';
  if (reason.length < 10 || reason.length > 200) {
    throw new AdminAuthorizationError('PROD_ADMIN_REASON deve ter entre 10 e 200 caracteres.');
  }
  const raw = env.PROD_ADMIN_EXPIRES_AT ?? '';
  const expiresAt = new Date(raw);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(raw) || Number.isNaN(expiresAt.getTime())) {
    throw new AdminAuthorizationError('PROD_ADMIN_EXPIRES_AT deve ser uma data ISO-8601.');
  }
  if (expiresAt.getTime() <= now.getTime()) {
    throw new AdminAuthorizationError('Autorizacao expirada.');
  }
  if (expiresAt.getTime() - now.getTime() > MAX_AUTHORIZATION_MINUTES * 60_000) {
    throw new AdminAuthorizationError(`Autorizacao nao pode durar mais de ${MAX_AUTHORIZATION_MINUTES} minutos.`);
  }
  const nonce = createHash('sha256').update(`${expectedOperation}|${raw}|${reason}`).digest('hex').slice(0, 16);
  if (usedNonces.has(nonce)) {
    throw new AdminAuthorizationError('Autorizacao ja utilizada; emita uma nova.');
  }
  return Object.freeze({ operation: expectedOperation, reason, expiresAt, nonce });
}

// Unico comando Prisma CLI aceito em producao: aplicar migrations pendentes,
// sem flags. Qualquer outro argumento (inclusive reset, push, execute, seed) falha.
export function assertApprovedMigrationCommand(args: readonly string[]): void {
  if (args.length !== 2 || args[0] !== 'migrate' || args[1] !== 'deploy') {
    throw new AdminAuthorizationError('Somente "prisma migrate deploy" sem argumentos adicionais e permitido em producao.');
  }
}

export function approvedMigrationFromEnv(env: NodeJS.ProcessEnv): string {
  const operation = env.PROD_ADMIN_OPERATION ?? '';
  if (!operation.startsWith('migrate:')) {
    throw new AdminAuthorizationError('A autorizacao informada nao e de migration.');
  }
  return operation.slice(8);
}

export function assertApprovedMigrationChecksum(migration: string, sql: string | Uint8Array): void {
  const expected = APPROVED_MIGRATION_SHA256[migration as keyof typeof APPROVED_MIGRATION_SHA256];
  const actual = createHash('sha256').update(sql).digest('hex');
  if (!expected || actual !== expected) {
    throw new AdminAuthorizationError('Conteudo da migration nao corresponde ao SQL aprovado.');
  }
}

export function assertProductionMigrationPreflight(
  value: unknown,
  providedToken: string | undefined,
  actualParentPid: number,
  env: NodeJS.ProcessEnv,
): MigrationPreflightTicket {
  if (!value || typeof value !== 'object') {
    throw new AdminAuthorizationError('Ticket de preflight administrativo ausente ou invalido.');
  }
  const ticket = value as Partial<MigrationPreflightTicket>;
  const migration = approvedMigrationFromEnv(env);
  const operation = migrationOperation(migration);
  const authorization = authorizeProductionAdmin(operation, env);
  const token = ticket.token;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token) ||
      typeof providedToken !== 'string' || !/^[a-f0-9]{64}$/i.test(providedToken)) {
    throw new AdminAuthorizationError('Ticket de preflight administrativo invalido.');
  }
  const ticketToken = Buffer.from(token, 'hex');
  const childToken = Buffer.from(providedToken, 'hex');
  if (ticketToken.length !== childToken.length || !timingSafeEqual(ticketToken, childToken)) {
    throw new AdminAuthorizationError('Ticket de preflight administrativo invalido.');
  }
  if (ticket.parentPid !== actualParentPid ||
      ticket.operation !== operation ||
      ticket.nonce !== authorization.nonce ||
      ticket.expiresAt !== env.PROD_ADMIN_EXPIRES_AT ||
      ticket.migration !== migration ||
      ticket.migrationSha256 !== APPROVED_MIGRATION_SHA256[migration as keyof typeof APPROVED_MIGRATION_SHA256] ||
      typeof ticket.migrationsPath !== 'string' || !isAbsolute(ticket.migrationsPath) ||
      !Array.isArray(ticket.migrationNames) ||
      !ticket.migrationNames.every(name => typeof name === 'string' && /^[0-9]{14}_[a-zA-Z0-9_-]+$/.test(name)) ||
      new Set(ticket.migrationNames).size !== ticket.migrationNames.length ||
      !ticket.migrationNames.includes(migration)) {
    throw new AdminAuthorizationError('Ticket de preflight administrativo nao corresponde a operacao aprovada.');
  }
  return ticket as MigrationPreflightTicket;
}

export type MigrationRow = { migration_name: string; finished_at: unknown; rolled_back_at: unknown };

// Garante que a unica migration pendente e a aprovada.
export function assertOnlyApprovedPending(
  localMigrations: readonly string[],
  applied: readonly MigrationRow[],
  approved: string,
): void {
  if (!APPROVED_MIGRATIONS.some(name => name === approved)) {
    throw new AdminAuthorizationError('Migration nao aprovada.');
  }
  const broken = applied.filter(row => row.finished_at == null && row.rolled_back_at == null);
  if (broken.length) throw new AdminAuthorizationError('Existem migrations incompletas em _prisma_migrations.');
  const done = new Set(applied.filter(row => row.finished_at != null).map(row => row.migration_name));
  const unknown = [...done].filter(name => !localMigrations.includes(name));
  if (unknown.length) throw new AdminAuthorizationError('Banco possui migrations ausentes localmente (divergencia).');
  const pending = localMigrations.filter(name => !done.has(name));
  if (pending.length !== 1 || pending[0] !== approved) {
    throw new AdminAuthorizationError(`Pendentes divergem da migration autorizada: [${pending.join(', ')}].`);
  }
}

export type DatabaseIdentity = {
  database: unknown;
  role: unknown;
  transaction_read_only?: unknown;
};

// Valida identidade retornada pelo servidor antes de qualquer operacao.
export function assertProductionIdentity(identity: DatabaseIdentity, readOnlyExpected: boolean): void {
  if (identity.database !== PRODUCTION_DATABASE) {
    throw new AdminAuthorizationError('Banco conectado nao e a producao (neondb).');
  }
  if (typeof identity.role !== 'string' || !identity.role) {
    throw new AdminAuthorizationError('Role de conexao nao identificada.');
  }
  if (readOnlyExpected && identity.transaction_read_only !== 'on') {
    throw new AdminAuthorizationError('Sessao de inspecao deve ser somente leitura.');
  }
}

export function fingerprint(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 12);
}

export type AuditRecord = {
  timestamp: string;
  operation: string;
  environment: string;
  database: string;
  hostFingerprint: string;
  reason: string;
  nonce: string;
  result: 'iniciada' | 'concluida' | 'falhou';
  detail?: string;
};

// Nunca inclui URL, senha ou host em claro.
export function auditRecord(
  auth: AdminAuthorization,
  hostname: string,
  result: AuditRecord['result'],
  detail?: string,
  now: Date = new Date(),
): AuditRecord {
  return {
    timestamp: now.toISOString(), operation: auth.operation, environment: 'production',
    database: PRODUCTION_DATABASE, hostFingerprint: fingerprint(hostname),
    reason: auth.reason, nonce: auth.nonce, result,
    ...(detail ? { detail: detail.replace(/postgres(ql)?:\/\/\S+/gi, '[url omitida]').slice(0, 200) } : {}),
  };
}
