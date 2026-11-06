import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'dotenv';
import { assertPrismaArguments } from './prismaArguments.mjs';
import {
  approvedMigrationFromEnv, assertApprovedMigrationChecksum, assertApprovedMigrationCommand,
  assertProductionMigrationPreflight, authorizeProductionAdmin, migrationOperation,
  type MigrationPreflightTicket,
} from './productionAdmin';

export type AppEnvironment = 'local' | 'staging' | 'test' | 'production';
export type EnvironmentValues = Record<string, string | undefined>;

export class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const backendRoot = path.basename(root) === 'dist' ? path.dirname(root) : root;

const environmentFiles = {
  local: '.env.local',
  staging: '.env.staging',
  test: '.env.test.local',
  production: '.env',
} as const;

const databases = {
  local: 'centraldeanime',
  staging: 'centraldeanime_staging',
  test: 'centraldeanimetest',
  production: 'neondb',
} as const;

const localHosts = new Set(['localhost', '127.0.0.1', '[::1]']);
const productionHost = 'ep-withered-cherry-b6giwtqf.c-2.sa-east-1.aws.neon.tech';
const serviceKey = /^(DATABASE_|DIRECT_URL$|PRISMA_|PG|DB_|JWT_|SESSION_|REDIS_|SMTP_|MAIL_|SENDGRID_|RESEND_|GOOGLE_|OAUTH_|FRONTEND_|SEED_)/;

export function selectEnvironment(value: string | undefined): AppEnvironment {
  if (value !== 'local' && value !== 'staging' && value !== 'test' && value !== 'production') {
    throw new EnvironmentError('Selecione APP_ENV=local|staging|test|production explicitamente.');
  }
  return value;
}

function databaseUrl(value: string | undefined, key: string): URL {
  if (!value) throw new EnvironmentError(`${key} obrigatoria; fallback de conexao desabilitado.`);
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new EnvironmentError(`${key} invalida.`);
  }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new EnvironmentError(`${key} exige PostgreSQL.`);
  }
  // Connection parameters must not redirect libpq/pg to another destination.
  const parameters = new Set<string>();
  for (const key of url.searchParams.keys()) {
    if (parameters.has(key)) {
      throw new EnvironmentError('Parametro de conexao duplicado nao permitido.');
    }
    parameters.add(key);
    if (!['sslmode', 'channel_binding', 'schema', 'connection_limit', 'pool_timeout', 'connect_timeout'].includes(key)) {
      throw new EnvironmentError('Parametro de conexao nao permitido.');
    }
  }
  if (url.hash) throw new EnvironmentError('Fragmento de conexao nao permitido.');
  return url;
}

export function validateDatabaseUrls(environment: AppEnvironment, values: EnvironmentValues) {
  const application = databaseUrl(values.DATABASE_URL, 'DATABASE_URL');
  const direct = databaseUrl(values.DATABASE_URL_UNPOOLED, 'DATABASE_URL_UNPOOLED');
  for (const url of [application, direct]) {
    if (url.pathname !== `/${databases[environment]}` || (url.port || '5432') !== '5432') {
      throw new EnvironmentError('Database ou porta nao corresponde ao ambiente selecionado.');
    }
    if (environment === 'production') {
      if (![productionHost, productionHost.replace('.c-2.', '-pooler.c-2.')].includes(url.hostname)) {
        throw new EnvironmentError('Producao exige o endpoint Neon autorizado.');
      }
      if (!['require', 'verify-full'].includes(url.searchParams.get('sslmode') ?? '')) {
        throw new EnvironmentError('Producao exige TLS.');
      }
    } else if (!localHosts.has(url.hostname)) {
      throw new EnvironmentError('Ambiente nao produtivo exige host PostgreSQL local.');
    }
  }
  if (direct.hostname.includes('-pooler')) {
    throw new EnvironmentError('DATABASE_URL_UNPOOLED nao pode utilizar pooler.');
  }
  const canonicalHost = (url: URL) => url.hostname.replace('-pooler.', '.');
  if (canonicalHost(application) !== canonicalHost(direct) ||
      application.username !== direct.username || application.password !== direct.password ||
      application.searchParams.get('schema') !== direct.searchParams.get('schema')) {
    throw new EnvironmentError('As duas URLs devem identificar o mesmo destino e papel.');
  }
  return { application, direct };
}

export function resolveEnvironment(
  environment: AppEnvironment,
  selected: EnvironmentValues,
  inherited: EnvironmentValues,
  deployed = false,
) {
  if (selected.APP_ENV && selected.APP_ENV !== environment) {
    throw new EnvironmentError('APP_ENV do arquivo diverge da selecao explicita.');
  }
  for (const [key, value] of Object.entries(inherited)) {
    if (serviceKey.test(key) && value !== undefined && value !== selected[key]) {
      throw new EnvironmentError(`Variavel herdada conflitante: ${key}. Remova-a antes de selecionar o ambiente.`);
    }
  }
  if (selected.PRISMA_ACCELERATE_URL || selected.DIRECT_URL) {
    throw new EnvironmentError('Conexoes alternativas nao permitidas; utilize as duas URLs PostgreSQL validadas.');
  }
  for (const key of Object.keys(selected)) {
    if (key.startsWith('PG') && selected[key]) {
      throw new EnvironmentError('Variaveis PG alternativas nao permitidas.');
    }
  }
  const urls = validateDatabaseUrls(environment, selected);
  const values: EnvironmentValues = { ...selected, APP_ENV: environment };
  values.NODE_ENV = environment === 'production' ? 'production' : environment === 'test' ? 'test' : 'development';

  if (environment !== 'production') {
    for (const key of Object.keys(values)) {
      if (/^(SMTP_|SENDGRID_|RESEND_|GOOGLE_|OAUTH_)/.test(key) && values[key]) {
        throw new EnvironmentError(`Integracao externa nao permitida: ${key}.`);
      }
    }
    if (values.REDIS_URL || values.SESSION_STORE !== 'memory' || values.MAIL_MODE !== 'disabled') {
      throw new EnvironmentError('Ambiente isolado exige sessoes em memoria, sem Redis e email desabilitado.');
    }
    for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET']) {
      const secret = values[key];
      if (!secret || secret.length < 32) {
        throw new EnvironmentError(`${key} local deve possuir ao menos 32 caracteres.`);
      }
    }
    const origins = [values.FRONTEND_URL, ...(values.FRONTEND_ALLOWED_ORIGINS ?? '').split(',')]
      .filter((origin): origin is string => Boolean(origin));
    for (const origin of origins) {
      let url: URL;
      try {
        url = new URL(origin.trim());
      } catch {
        throw new EnvironmentError('Origem local invalida.');
      }
      if (!localHosts.has(url.hostname) || !['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
        throw new EnvironmentError('CORS isolado exige origens locais.');
      }
    }
  }
  const readOnly = environment === 'staging' || (environment === 'production' && !deployed);
  const destination = (url: URL) => Object.freeze({
    hostname: url.hostname, port: url.port, pathname: url.pathname,
  });
  return Object.freeze({
    environment,
    values: Object.freeze(values),
    urls: Object.freeze({ application: destination(urls.application), direct: destination(urls.direct) }),
    readOnly,
    mailEnabled: environment === 'production' && deployed,
  });
}

export type SelectedEnvironment = ReturnType<typeof resolveEnvironment>;
let resolvedEnvironment: SelectedEnvironment | undefined;
const operationalKey = /^(APP_ENV|APP_RUNTIME|RENDER(?:_.*)?|NODE_OPTIONS|NODE_ENV)$/;

export function loadEnvironment(): SelectedEnvironment {
  if (resolvedEnvironment) return resolvedEnvironment;
  const environment = selectEnvironment(process.env.APP_ENV);
  const runtime = process.env.APP_RUNTIME;
  if (runtime && runtime !== 'readonly' && runtime !== 'production-deploy') {
    throw new EnvironmentError('APP_RUNTIME invalido.');
  }
  // Explicit operator authorization, not platform attestation by a forgeable marker.
  const deployed = environment === 'production' && runtime === 'production-deploy';
  if (deployed && !(process.env.RENDER === 'true' && process.env.RENDER_SERVICE_ID && process.env.RENDER_INSTANCE_ID)) {
    throw new EnvironmentError('Runtime de deploy exige selecao explicita e metadados do Render.');
  }
  let selected: EnvironmentValues;
  if (deployed) {
    selected = { ...process.env };
  } else {
    try {
      selected = parse(readFileSync(path.join(backendRoot, environmentFiles[environment])));
    } catch {
      throw new EnvironmentError(`Arquivo ${environmentFiles[environment]} ausente ou ilegivel; nenhum fallback permitido.`);
    }
  }
  const result = resolveEnvironment(environment, selected, process.env, deployed);
  for (const [key, value] of Object.entries(result.values)) {
    if (value !== undefined && !operationalKey.test(key)) process.env[key] = value;
  }
  process.env.NODE_ENV = result.values.NODE_ENV;
  resolvedEnvironment = result;
  return resolvedEnvironment;
}

export function assertAdministrativeWrite(environment: AppEnvironment): void {
  if (environment === 'production' || environment === 'staging') {
    throw new EnvironmentError('Migrations, seeds e resets bloqueados em producao e staging, inclusive no Render.');
  }
}

export type PrismaCliConfiguration = Readonly<{
  datasourceUrl?: string;
  migrationsPath?: string;
}>;

function readProductionMigrationTicket(): MigrationPreflightTicket {
  const file = process.env.PROD_ADMIN_PREFLIGHT_FILE;
  if (!file) throw new EnvironmentError('Ticket de preflight administrativo ausente: use o runner prod:migrate.');
  let value: unknown;
  try {
    value = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    throw new EnvironmentError('Ticket de preflight administrativo ausente ou invalido.');
  }
  try {
    return assertProductionMigrationPreflight(
      value, process.env.PROD_ADMIN_PREFLIGHT_TOKEN, process.ppid, process.env,
    );
  } catch (error) {
    if (error instanceof Error) throw new EnvironmentError(error.message);
    throw error;
  }
}

function assertMigrationSnapshot(ticket: MigrationPreflightTicket): void {
  const rootEntries = readdirSync(ticket.migrationsPath, { withFileTypes: true });
  const directoryNames = rootEntries.filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
  const rootFiles = rootEntries.filter(entry => entry.isFile()).map(entry => entry.name);
  if (rootEntries.length !== directoryNames.length + rootFiles.length ||
      JSON.stringify(directoryNames) !== JSON.stringify([...ticket.migrationNames].sort()) ||
      rootFiles.length !== 1 || rootFiles[0] !== 'migration_lock.toml') {
    throw new EnvironmentError('Snapshot de migrations diverge do preflight aprovado.');
  }
  for (const migrationName of directoryNames) {
    const entries = readdirSync(path.join(ticket.migrationsPath, migrationName), { withFileTypes: true });
    if (entries.length !== 1 || !entries[0].isFile() || entries[0].name !== 'migration.sql') {
      throw new EnvironmentError('Snapshot de migrations contem arquivos inesperados.');
    }
    if (migrationName === ticket.migration) {
      assertApprovedMigrationChecksum(
        migrationName, readFileSync(path.join(ticket.migrationsPath, migrationName, 'migration.sql')),
      );
    }
  }
}

export function prismaCliConfiguration(args: string[]): PrismaCliConfiguration {
  assertPrismaArguments(args);
  if (args[0] === 'generate' || args[0] === 'validate') return {};
  const environment = selectEnvironment(process.env.APP_ENV);
  if (environment === 'production' && process.env.PROD_ADMIN_OPERATION) {
    assertApprovedMigrationCommand(args);
    const approved = approvedMigrationFromEnv(process.env);
    authorizeProductionAdmin(migrationOperation(approved), process.env);
    const ticket = readProductionMigrationTicket();
    assertMigrationSnapshot(ticket);
    return {
      datasourceUrl: loadEnvironment().values.DATABASE_URL_UNPOOLED,
      migrationsPath: ticket.migrationsPath,
    };
  }
  assertAdministrativeWrite(environment);
  return { datasourceUrl: loadEnvironment().values.DATABASE_URL_UNPOOLED };
}

export function prismaCliDatasource(args: string[]): string | undefined {
  return prismaCliConfiguration(args).datasourceUrl;
}
