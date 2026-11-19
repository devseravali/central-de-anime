import { spawn } from 'node:child_process';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import {
  closeSync, constants, existsSync, fstatSync, fsyncSync, lstatSync, mkdirSync,
  openSync, readFileSync, readSync, realpathSync, writeFileSync,
} from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ClientConfig } from 'pg';
import { isIP } from 'node:net';
import { assertSupabaseDestination, type SupabaseDestination } from '../../src/config/supabase';

// No dotenv/environment loader, driver construction, filesystem writes or spawn on import.
export const REPOSITORY = fileURLToPath(new URL('../../../', import.meta.url));
export const TOOL_DIRECTORY = 'C:\\Program Files\\PostgreSQL\\18\\bin';
export const ERROR_MESSAGES = {
  configuration: 'Configuracao de backup/restore recusada.',
  path: 'Diretorio ou arquivo de backup recusado.',
  tools: 'Ferramentas PostgreSQL 18.4 indisponiveis.',
  process: 'Operacao PostgreSQL falhou; detalhes externos suprimidos.',
  identity: 'Identidade PostgreSQL nao corresponde ao destino autorizado.',
  empty: 'Destino de restauracao nao esta vazio ou exclusivo.',
  archive: 'Arquivo ou manifesto de backup invalido.',
  inspection: 'Inspecao de contagens ou integridade falhou.',
  storage: 'Persistencia exclusiva do backup falhou; arquivos preservados.',
} as const;
export type ErrorCode = keyof typeof ERROR_MESSAGES;
export class BackupError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = 'BackupError';
  }
}
function fail(code: ErrorCode): never { throw new BackupError(code); }
function close(fd: number | undefined): void {
  if (fd !== undefined) {
    try { closeSync(fd); } catch { /* Never replace a sanitized error with a filesystem error. */ }
  }
}
export function safeError(error: unknown): string {
  // Never trust a caller-provided Error.message, even a subclass.
  return error instanceof BackupError && Object.hasOwn(ERROR_MESSAGES, error.code)
    ? ERROR_MESSAGES[error.code] : ERROR_MESSAGES.process;
}
export interface Connection {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  supabase?: true;
}
/** No DNS, sockets or subprocesses: validation only. Remote access is source-only. */
export function supabaseConnectionFromUrl(value: string, values: SupabaseDestination): Connection {
  try {
    if (typeof value !== 'string' || /[\u0000-\u0020\u007f]/.test(value)) fail('configuration');
    const url = new URL(value);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.hash) fail('configuration');
    const seen = new Set<string>();
    for (const [key, parameter] of url.searchParams) {
      if (seen.has(key)) fail('configuration');
      seen.add(key);
      // Only neutral ORM hints and strict transport settings; never libpq redirects.
      if (!(
        (key === 'sslmode' && parameter === 'verify-full') ||
        (key === 'channel_binding' && parameter === 'require') ||
        (key === 'schema' && parameter === 'public') ||
        (['connection_limit', 'pool_timeout', 'connect_timeout'].includes(key) && /^[1-9]\d{0,3}$/.test(parameter))
      )) fail('configuration');
    }
    assertSupabaseDestination(url, values, true);
    const password = decodeURIComponent(url.password);
    if (!password || /[\u0000-\u001f\u007f]/.test(password)) fail('configuration');
    return {
      host: url.hostname, port: Number(url.port || '5432'), database: 'postgres',
      user: decodeURIComponent(url.username), password, supabase: true,
    };
  } catch { return fail('configuration'); }
}
export function connectionFromUrl(value: string): Connection {
  try {
    if (typeof value !== 'string' || /[\u0000-\u0020\u007f]/.test(value)) fail('configuration');
    const url = new URL(value);
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.search || url.hash) fail('configuration');
    // No DNS, Unix sockets, multihost, libpq service, URL options or remote hosts.
    const host = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
      ? '127.0.0.1' : url.hostname === '[::1]' ? '::1' : fail('configuration');
    const database = decodeURIComponent(url.pathname.slice(1));
    const user = decodeURIComponent(url.username);
    const password = decodeURIComponent(url.password);
    const port = Number(url.port || '5432');
    if (!/^[a-z][a-z0-9_]{0,62}$/.test(database) || /prod/i.test(database) ||
        ['postgres', 'template0', 'template1'].includes(database) ||
        !/^[a-zA-Z_][a-zA-Z0-9_-]{0,62}$/.test(user) || !password ||
        /[\u0000-\u001f\u007f]/.test(password) || !Number.isInteger(port) || port < 1 || port > 65535) {
      fail('configuration');
    }
    return { host, port, database, user, password };
  } catch { return fail('configuration'); }
}
export function restoreConnection(url: string, name: string, confirmation: string): Connection {
  const connection = connectionFromUrl(url);
  if (!/^centraldeanime_restore_[a-z0-9][a-z0-9_]{0,31}$/.test(name) ||
      /prod/i.test(name) || connection.database !== name || confirmation !== `RESTORE:${name}`) {
    fail('configuration');
  }
  return connection;
}

function within(root: string, path: string): boolean {
  const rel = relative(root, path);
  return !rel || (!rel.startsWith(`..${sep}`) && rel !== '..' && !isAbsolute(rel));
}
function plainPath(path: string): void {
  if (!isAbsolute(path) || /[\u0000-\u001f]/.test(path) ||
      (process.platform === 'win32' && (
        !/^[a-zA-Z]:[\\/]/.test(path) || /:/.test(path.slice(2)) ||
        path.split(/[\\/]/).some(part => /[. ]$/.test(part))
      ))) fail('path');
}
function noLinks(path: string): void {
  let current = resolve(path);
  while (true) {
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) fail('path');
    const parent = dirname(current);
    if (parent === current) break;
    current = parent;
  }
}
export function externalDirectory(path: string): string {
  try {
    plainPath(path);
    noLinks(path);
    const canonical = realpathSync(path);
    const repo = realpathSync(REPOSITORY);
    // Also refuse ancestors of repo; no recursive creation or implicit cwd defaults.
    if (!lstatSync(canonical).isDirectory() || within(repo, canonical) || within(canonical, repo)) fail('path');
    return canonical;
  } catch { return fail('path'); }
}
function regularFile(path: string): number {
  try {
    noLinks(path);
    const fd = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW || 0));
    const stat = fstatSync(fd);
    if (!stat.isFile() || stat.nlink !== 1) { closeSync(fd); fail('path'); }
    return fd;
  } catch { return fail('path'); }
}
function digest(fd: number): { sha256: string; bytes: number } {
  const buffer = Buffer.alloc(1024 * 1024);
  const hash = createHash('sha256');
  let bytes = 0;
  let size: number;
  while ((size = readSync(fd, buffer, 0, buffer.length, bytes)) > 0) {
    hash.update(buffer.subarray(0, size));
    bytes += size;
  }
  return { sha256: hash.digest('hex'), bytes };
}

export interface Command {
  tool: 'pg_dump' | 'pg_restore' | 'psql';
  args: string[];
  env: NodeJS.ProcessEnv;
  cwd: string;
  outputFd?: number;
  inputFd?: number;
}
export type Execute = (command: Command) => Promise<string>;
export interface PgSession {
  connect(): Promise<unknown>;
  query(sql: string, values?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>;
  end(): Promise<void>;
}
export interface Dependencies {
  execute: Execute;
  client: (config: ClientConfig) => PgSession;
}
export function childEnvironment(connection?: Connection, readOnly = false): NodeJS.ProcessEnv {
  // Do not inherit PG*, DATABASE_URL, NODE_OPTIONS, PATH, SSL files or application secrets.
  const env: NodeJS.ProcessEnv = {
    ...(process.platform === 'win32' ? { SystemRoot: process.env.SystemRoot || 'C:\\Windows' } : {}),
    LANG: 'C', LC_ALL: 'C',
    PGPASSFILE: process.platform === 'win32' ? 'NUL' : '/dev/null',
    PGSERVICEFILE: process.platform === 'win32' ? 'NUL' : '/dev/null',
    PGCONNECT_TIMEOUT: '5',
  };
  if (connection) Object.assign(env, {
    PGHOST: connection.host, PGPORT: String(connection.port), PGDATABASE: connection.database,
    PGUSER: connection.user, PGPASSWORD: connection.password,
    PGSSLMODE: connection.supabase ? 'verify-full' : 'disable',
    ...(connection.supabase ? { PGSSLROOTCERT: 'system', PGCHANNELBINDING: 'require' } : {}),
    PGOPTIONS: `-c statement_timeout=600000 -c lock_timeout=5000 -c row_security=off${readOnly ? ' -c default_transaction_read_only=on' : ''}`,
  });
  return env;
}
export const execute: Execute = command => new Promise((accept, reject) => {
  try {
    const child = spawn(join(TOOL_DIRECTORY, `${command.tool}.exe`), command.args, {
      cwd: command.cwd, env: command.env, shell: false, windowsHide: true,
      stdio: [command.inputFd ?? 'ignore', command.outputFd ?? 'pipe', 'ignore'],
    });
    const chunks: Buffer[] = [];
    let length = 0;
    let overflow = false;
    const timer = setTimeout(() => { overflow = true; child.kill(); }, 15 * 60_000);
    child.stdout?.on('data', (chunk: Buffer) => {
      length += chunk.length;
      if (length > 8 * 1024 * 1024) { overflow = true; child.kill(); }
      else chunks.push(chunk);
    });
    child.stdout?.once('error', () => {
      overflow = true;
      child.kill();
      reject(new BackupError('process'));
    });
    child.once('error', () => { clearTimeout(timer); reject(new BackupError('process')); });
    child.once('close', code => {
      clearTimeout(timer);
      if (code !== 0 || overflow) reject(new BackupError('process'));
      else accept(Buffer.concat(chunks).toString('utf8'));
    });
  } catch { reject(new BackupError('process')); }
});
function clientConfig(connection: Connection, readOnly: boolean): ClientConfig {
  return {
    host: connection.host, port: connection.port, database: connection.database,
    user: connection.user, password: connection.password,
    ssl: connection.supabase ? { rejectUnauthorized: true, servername: connection.host } : false,
    ...(connection.supabase ? { enableChannelBinding: true } : {}),
    connectionTimeoutMillis: 5000, query_timeout: 610000,
    application_name: 'central-de-anime-backup-restore',
    options: `-c search_path=pg_catalog -c row_security=off -c statement_timeout=600000 -c lock_timeout=5000${readOnly ? ' -c default_transaction_read_only=on' : ''}`,
  };
}
async function call(deps: Dependencies, command: Command): Promise<string> {
  try { return await deps.execute(command); } catch { return fail('process'); }
}
async function checkTools(deps: Dependencies, cwd: string): Promise<void> {
  for (const tool of ['pg_dump', 'pg_restore', 'psql'] as const) {
    let version: string;
    try { version = await deps.execute({ tool, args: ['--version'], env: childEnvironment(), cwd }); }
    catch { fail('tools'); }
    if (version!.trim() !== `${tool} (PostgreSQL) 18.4`) fail('tools');
  }
}

export const IDENTITY_SQL = `SELECT current_database() AS database, current_user AS role,
 session_user AS session_role, host(inet_server_addr()) AS address, inet_server_port() AS port,
 current_setting('server_version_num') AS version, pg_is_in_recovery() AS recovery,
 r.rolsuper AS superuser, r.rolcreatedb AS createdb, r.rolcreaterole AS createrole,
 r.rolreplication AS replication, r.rolbypassrls AS bypassrls
 FROM pg_catalog.pg_roles r WHERE r.rolname = current_user`;
export const SOURCE_TLS_SQL = `SELECT ssl FROM pg_catalog.pg_stat_ssl WHERE pid=pg_backend_pid()`;
function assertIdentity(rows: Record<string, unknown>[], connection: Connection, restore: boolean): void {
  const row = rows[0];
  // Supabase session pooler login suffix routes the project, SQL role remains postgres.
  const expectedRole = connection.supabase ? 'postgres' : connection.user;
  if (rows.length !== 1 || !row || row.database !== connection.database ||
      row.role !== expectedRole || row.session_role !== expectedRole ||
      (connection.supabase ? typeof row.address !== 'string' || !isIP(row.address) ||
        ['127.0.0.1', '::1', '0.0.0.0', '::'].includes(row.address) : row.address !== connection.host) ||
      row.port !== connection.port ||
      typeof row.version !== 'string' || !(connection.supabase ? /^1[4-8]\d{4}$/ : /^18\d{4}$/).test(row.version) ||
      row.recovery !== false) fail('identity');
  if (restore && ['superuser', 'createdb', 'createrole', 'replication', 'bypassrls'].some(key => row[key] !== false)) {
    fail('identity');
  }
}
// Empty public namespace is permitted, but managed schemas/objects and extensions are not.
export const EMPTY_SQL = `SELECT (
 (SELECT count(*) FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname !~ '^pg_toast' AND n.nspname !~ '^pg_temp_') +
 (SELECT count(*) FROM pg_catalog.pg_proc p JOIN pg_catalog.pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname NOT IN ('pg_catalog','information_schema')) +
 (SELECT count(*) FROM pg_catalog.pg_type t JOIN pg_catalog.pg_namespace n ON n.oid=t.typnamespace
  WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND n.nspname !~ '^pg_') +
 (SELECT count(*) FROM pg_catalog.pg_namespace WHERE nspname NOT IN ('public','pg_catalog','information_schema')
  AND nspname !~ '^pg_') +
 (SELECT count(*) FROM pg_catalog.pg_extension WHERE extname <> 'plpgsql') +
 (SELECT count(*) FROM pg_catalog.pg_event_trigger) +
 (SELECT count(*) FROM pg_catalog.pg_publication) +
 (SELECT count(*) FROM pg_catalog.pg_subscription) +
 (SELECT count(*) FROM pg_catalog.pg_foreign_server)
 )::text AS objects,
 (SELECT count(*) FROM pg_catalog.pg_stat_activity WHERE datname=current_database()
  AND pid<>pg_backend_pid())::text AS other_sessions,
 (SELECT pg_catalog.pg_get_userbyid(datdba)=current_user FROM pg_catalog.pg_database
  WHERE datname=current_database()) AS owner`;
export const TABLES_SQL = `SELECT n.nspname AS schema, c.relname AS name
 FROM pg_catalog.pg_class c JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='public' AND c.relkind IN ('r','p') ORDER BY c.relname`;
export const INTEGRITY_SQL = `SELECT (
 (SELECT count(*) FROM pg_catalog.pg_constraint c JOIN pg_catalog.pg_namespace n ON n.oid=c.connamespace
  WHERE n.nspname='public' AND NOT c.convalidated) +
 (SELECT count(*) FROM pg_catalog.pg_index i JOIN pg_catalog.pg_class c ON c.oid=i.indrelid
  JOIN pg_catalog.pg_namespace n ON n.oid=c.relnamespace
  WHERE n.nspname='public' AND (NOT i.indisvalid OR NOT i.indisready))
 )::text AS invalid`;
export interface TableCount { schema: 'public'; name: string; count: string }
function identifier(value: string): string { return `"${value.replace(/"/g, '""')}"`; }
function countValue(value: unknown): value is string { return typeof value === 'string' && /^(0|[1-9]\d*)$/.test(value); }
async function inspect(session: PgSession): Promise<TableCount[]> {
  const tables = (await session.query(TABLES_SQL)).rows;
  if (!tables.length) fail('inspection');
  const counts: TableCount[] = [];
  for (const table of tables) {
    if (table.schema !== 'public' || typeof table.name !== 'string' || !table.name ||
        /[\u0000-\u001f]/.test(table.name) || Buffer.byteLength(table.name) > 63) fail('inspection');
    const rows = (await session.query(`SELECT count(*)::text AS count FROM "public".${identifier(table.name)}`)).rows;
    if (rows.length !== 1 || !countValue(rows[0].count)) fail('inspection');
    counts.push({ schema: 'public', name: table.name, count: rows[0].count });
  }
  const rows = (await session.query(INTEGRITY_SQL)).rows;
  if (rows.length !== 1 || rows[0].invalid !== '0') fail('inspection');
  return counts;
}
function tocStructure(output: string): { entries: number; tableData: number } {
  const lines = output.split(/\r?\n/).filter(line => line && !line.startsWith(';'));
  if (!/^;\s+Format:\s+CUSTOM\s*$/m.test(output) || !lines.length ||
      lines.some(line => !/^\d+; \d+ \d+ [A-Z]/.test(line))) fail('archive');
  const tableData = lines.filter(line => /^\d+; \d+ \d+ TABLE DATA public /.test(line)).length;
  if (!tableData) fail('archive');
  // Persist numbers only, never raw TOC headers (database/role identifiers).
  return { entries: lines.length, tableData };
}
export interface Manifest {
  version: 1;
  format: 'custom';
  scope: 'public';
  toolVersion: '18.4';
  sha256: string;
  bytes: number;
  structure: { entries: number; tableData: number };
  counts: TableCount[];
  restoration: 'not-validated';
}
export interface BackupInput {
  connectionUrl: string;
  directory: string;
  /** Explicitly validated Supabase source only; never used by restore(). */
  supabase?: SupabaseDestination;
  validationArchiveKey?: string;
}
export interface BackupResult { directory: string; manifest: Manifest }

function validationArchiveMac(key: string, manifest: Manifest): Buffer {
  return createHmac('sha256', Buffer.from(key, 'hex'))
    .update('centraldeanime:validation:import-to-restore:v1\0')
    .update(JSON.stringify(manifest))
    .digest();
}

export async function backup(input: BackupInput, deps: Dependencies): Promise<BackupResult> {
  let session: PgSession | undefined;
  let fd: number | undefined;
  try {
    const connection = input.supabase
      ? supabaseConnectionFromUrl(input.connectionUrl, input.supabase)
      : connectionFromUrl(input.connectionUrl);
    const root = externalDirectory(input.directory);
    await checkTools(deps, root);
    session = deps.client(clientConfig(connection, true));
    await session.connect();
    await session.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    assertIdentity((await session.query(IDENTITY_SQL)).rows, connection, false);
    if (connection.supabase) {
      const tls = (await session.query(SOURCE_TLS_SQL)).rows;
      if (tls.length !== 1 || tls[0].ssl !== true) fail('identity');
    }
    const snapshot = (await session.query('SELECT pg_export_snapshot() AS snapshot')).rows;
    if (snapshot.length !== 1 || typeof snapshot[0].snapshot !== 'string' ||
        !/^[0-9A-F]+-[0-9A-F]+-\d+$/.test(snapshot[0].snapshot)) fail('identity');
    const counts = await inspect(session);
    // New private directory and new fd; failed/partial artifacts are NEVER deleted or overwritten.
    const directory = join(root, `backup-${randomUUID()}`);
    mkdirSync(directory, { mode: 0o700 });
    fd = openSync(join(directory, 'archive.dump'), 'wx+', 0o600);
    await call(deps, {
      tool: 'pg_dump',
      args: ['--format=custom', '--schema=public', '--no-owner', '--no-privileges', '--no-password',
        `--snapshot=${snapshot[0].snapshot}`],
      env: childEnvironment(connection, true), cwd: directory, outputFd: fd,
    });
    fsyncSync(fd);
    const hash = digest(fd);
    const magic = Buffer.alloc(5);
    readSync(fd, magic, 0, 5, 0);
    closeSync(fd); fd = undefined;
    if (hash.bytes < 5 || magic.toString() !== 'PGDMP') fail('archive');
    const list = await call(deps, {
      tool: 'pg_restore', args: ['--list', 'archive.dump'], env: childEnvironment(), cwd: directory,
    });
    const manifest: Manifest = {
      version: 1, format: 'custom', scope: 'public', toolVersion: '18.4', ...hash,
      structure: tocStructure(list), counts, restoration: 'not-validated',
    };
    await session.query('COMMIT');
    const storedManifest = input.validationArchiveKey
      ? { ...manifest, validationMac: validationArchiveMac(input.validationArchiveKey, parseManifest(manifest)).toString('hex') }
      : manifest;
    writeFileSync(join(directory, 'manifest.json'), JSON.stringify(storedManifest, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    return { directory, manifest };
  } catch (error) {
    if (error instanceof BackupError) throw new BackupError(error.code);
    return fail('storage');
  } finally {
    close(fd);
    // Cleanup is only a connection close; no archive or database cleanup.
    if (session) await session.end().catch(() => undefined);
  }
}
function parseManifest(value: unknown): Manifest {
  if (!value || typeof value !== 'object') fail('archive');
  const m = value as Partial<Manifest>;
  if (m.version !== 1 || m.format !== 'custom' || m.scope !== 'public' ||
      m.toolVersion !== '18.4' || m.restoration !== 'not-validated' ||
      typeof m.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(m.sha256) ||
      !Number.isSafeInteger(m.bytes) || m.bytes! < 5 || !m.structure ||
      !Number.isSafeInteger(m.structure.entries) || m.structure.entries < 1 ||
      !Number.isSafeInteger(m.structure.tableData) || m.structure.tableData < 1 ||
      !Array.isArray(m.counts) || !m.counts.length ||
      m.counts.some(t => !t || t.schema !== 'public' || typeof t.name !== 'string' ||
        !t.name || Buffer.byteLength(t.name) > 63 || /[\u0000-\u001f]/.test(t.name) || !countValue(t.count)) ||
      new Set(m.counts.map(t => t.name)).size !== m.counts.length) fail('archive');
  // Project only allowed fields; no untrusted extra fields are copied into reports.
  return {
    version: 1, format: 'custom', scope: 'public', toolVersion: '18.4',
    sha256: m.sha256, bytes: m.bytes!,
    structure: { entries: m.structure.entries, tableData: m.structure.tableData },
    counts: m.counts.map(t => ({ schema: 'public', name: t.name, count: t.count })),
    restoration: 'not-validated',
  };
}
export interface RestoreInput {
  connectionUrl: string;
  directory: string;
  database: string;
  confirmation: string;
  validationArchiveKey?: string;
}
export interface RestoreReport {
  version: 1;
  restoration: 'validated';
  sha256: string;
  validatedAt: string;
  target: { database: string; host: '127.0.0.1' | '::1'; port: number };
  inspection: { counts: TableCount[]; invalidConstraintsAndIndexes: 0 };
}
export async function restore(input: RestoreInput, deps: Dependencies): Promise<RestoreReport> {
  let session: PgSession | undefined;
  let archiveFd: number | undefined;
  let manifestFd: number | undefined;
  let reservation: number | undefined;
  try {
    const connection = restoreConnection(input.connectionUrl, input.database, input.confirmation);
    const directory = externalDirectory(input.directory);
    archiveFd = regularFile(join(directory, 'archive.dump'));
    manifestFd = regularFile(join(directory, 'manifest.json'));
    if (fstatSync(manifestFd).size > 1024 * 1024) fail('archive');
    const storedManifest = JSON.parse(readFileSync(manifestFd, 'utf8'));
    const manifest = parseManifest(storedManifest);
    if (input.validationArchiveKey) {
      const mac = storedManifest.validationMac;
      if (typeof mac !== 'string' || !/^[0-9a-f]{64}$/.test(mac) ||
          !timingSafeEqual(Buffer.from(mac, 'hex'), validationArchiveMac(input.validationArchiveKey, manifest))) fail('archive');
    }
    const hash = digest(archiveFd);
    if (hash.sha256 !== manifest.sha256 || hash.bytes !== manifest.bytes) fail('archive');
    await checkTools(deps, directory);
    const structure = tocStructure(await call(deps, {
      tool: 'pg_restore', args: ['--list', 'archive.dump'], env: childEnvironment(), cwd: directory,
    }));
    if (JSON.stringify(structure) !== JSON.stringify(manifest.structure)) fail('archive');
    // Permanent exclusive attempt marker: no reruns against a partly restored database.
    reservation = openSync(join(directory, `restore-${connection.database}.attempt`), 'wx', 0o600);
    writeFileSync(reservation, 'Restore attempt reserved; not a validation record.\n');
    session = deps.client(clientConfig(connection, false));
    await session.connect();
    assertIdentity((await session.query(IDENTITY_SQL)).rows, connection, true);
    const lock = (await session.query("SELECT pg_try_advisory_lock(183746, 1) AS locked")).rows;
    if (lock.length !== 1 || lock[0].locked !== true) fail('empty');
    const empty = (await session.query(EMPTY_SQL)).rows;
    if (empty.length !== 1 || empty[0].objects !== '0' ||
        empty[0].other_sessions !== '0' || empty[0].owner !== true) fail('empty');
    // --dbname is a restricted plain name, never a connection string or credentials.
    // Non-superuser local database owner only. No --create, --clean, --disable-triggers.
    await call(deps, {
      tool: 'pg_restore',
      args: ['--exit-on-error', '--single-transaction', '--no-owner', '--no-privileges',
        '--no-password', `--dbname=${connection.database}`, ...(input.validationArchiveKey ? [] : ['archive.dump'])],
      ...(input.validationArchiveKey ? { inputFd: archiveFd } : {}),
      env: childEnvironment(connection), cwd: directory,
    });
    // Guard session remains open through subprocess and post-restore inspection.
    await session.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    assertIdentity((await session.query(IDENTITY_SQL)).rows, connection, true);
    const counts = await inspect(session);
    if (JSON.stringify(counts) !== JSON.stringify(manifest.counts)) fail('inspection');
    if (digest(archiveFd).sha256 !== manifest.sha256) fail('archive');
    await session.query('COMMIT');
    const report: RestoreReport = {
      version: 1, restoration: 'validated', sha256: manifest.sha256,
      validatedAt: new Date().toISOString(),
      target: {
        database: connection.database,
        host: connection.host === '127.0.0.1' ? '127.0.0.1' : connection.host === '::1' ? '::1' : fail('identity'),
        port: connection.port,
      },
      inspection: { counts, invalidConstraintsAndIndexes: 0 },
    };
    writeFileSync(join(directory, `restore-${connection.database}.validated.json`),
      JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    return report;
  } catch (error) {
    if (error instanceof BackupError) throw new BackupError(error.code);
    return fail('process');
  } finally {
    close(archiveFd);
    close(manifestFd);
    close(reservation);
    if (session) await session.end().catch(() => undefined);
  }
}
