import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, readdirSync, rmSync, writeSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  backup, restoreConnection, childEnvironment, supabaseConnectionFromUrl,
  IDENTITY_SQL, SOURCE_TLS_SQL, TABLES_SQL, INTEGRITY_SQL, ERROR_MESSAGES,
  type Dependencies, type Command,
} from '../../../scripts/backup/library';
import { prepareBackup, runBackup, runRestore } from '../../../scripts/backup/runners';

// Synthetic test data only. No DNS, sockets, real credentials or PG executables.
const project = 'a'.repeat(20);
const otherProject = 'b'.repeat(20);
const pooler = 'aws-0-offline-1.pooler.supabase.com';
const password = 'unit-test-only-not-a-real-credential';
function url(host = `db.${project}.supabase.co`, user = 'postgres', port = '5432') {
  return `postgresql://${user}:${password}@${host}:${port}/postgres?sslmode=verify-full`;
}
const values = () => ({
  SUPABASE_PROJECT_REF: project, SUPABASE_POOLER_HOST: pooler,
  DATABASE_URL: url('transactional.invalid'),
  DATABASE_URL_UNPOOLED: url(),
});
const directories: string[] = [];
function directory() {
  const result = mkdtempSync(join(tmpdir(), 'backup-supabase-offline-'));
  directories.push(result);
  return result;
}
function environment() {
  return {
    APP_ENV: 'production', APP_RUNTIME: 'readonly',
    BACKUP_RESTORE_EXECUTION: 'supabase-readonly',
    SUPABASE_PROJECT_REF: project,
    BACKUP_CONFIRMATION: `BACKUP:SUPABASE:${project}`, BACKUP_DIRECTORY: directory(),
  };
}
afterEach(() => {
  for (const root of directories.splice(0)) rmSync(root, { force: true, recursive: true });
});
function loader(selected = values()) {
  return vi.fn(() => ({ environment: 'production', values: selected }));
}
function offline() {
  const session = {
    connect: vi.fn().mockResolvedValue(undefined), end: vi.fn().mockResolvedValue(undefined),
    query: vi.fn(async (sql: string) => {
      if (sql === IDENTITY_SQL) return { rows: [{
        database: 'postgres', role: 'postgres', session_role: 'postgres',
        address: '192.0.2.10', port: 5432, version: '170006', recovery: false,
      }] };
      if (sql === SOURCE_TLS_SQL) return { rows: [{ ssl: true }] };
      if (sql.includes('pg_export_snapshot')) return { rows: [{ snapshot: '00000003-00000001-1' }] };
      if (sql === TABLES_SQL) return { rows: [{ schema: 'public', name: 'Anime' }] };
      if (sql === INTEGRITY_SQL) return { rows: [{ invalid: '0' }] };
      if (sql.startsWith('SELECT count(*)')) return { rows: [{ count: '1' }] };
      return { rows: [] };
    }),
  };
  const execute = vi.fn(async (command: Command) => {
    if (command.args[0] === '--version') return `${command.tool} (PostgreSQL) 18.4`;
    if (command.args[0] === '--list') return '; Format: CUSTOM\n1; 0 1 TABLE DATA public Anime postgres\n';
    if (command.outputFd !== undefined) writeSync(command.outputFd, Buffer.from('PGDMPsynthetic-only'));
    return '';
  });
  const client = vi.fn(() => session);
  const deps: Dependencies = { client, execute };
  return { deps, session, client, execute };
}

describe('preparacao Supabase sem efeitos de banco', () => {
  it('prepara somente UNPOOLED do ambiente selecionado; nao cria arquivos nem conecta', async () => {
    const env = environment();
    const load = loader();
    const prepared = await prepareBackup(env, [], load);
    expect(prepared.connectionUrl).toBe(values().DATABASE_URL_UNPOOLED);
    expect(prepared.supabase?.SUPABASE_PROJECT_REF).toBe(project);
    expect(load).toHaveBeenCalledOnce();
    expect(readdirSync(env.BACKUP_DIRECTORY)).toEqual([]);
  });
  it.each([
    { BACKUP_CONFIRMATION: '' }, { BACKUP_CONFIRMATION: 'yes' },
    { BACKUP_CONFIRMATION: `BACKUP:SUPABASE:${otherProject}` },
    { APP_RUNTIME: 'production-deploy' }, { BACKUP_RESTORE_EXECUTION: 'remote' },
    { BACKUP_DATABASE_URL: url() }, { APP_ENV: 'local' }, { SUPABASE_PROJECT_REF: '' },
    { APP_ENV: 'backup' },
  ])('bloqueia autorizacao insuficiente antes do loader %j', async override => {
    const load = loader();
    await expect(prepareBackup({ ...environment(), ...override }, [], load)).rejects.toMatchObject({ code: 'configuration' });
    expect(load).not.toHaveBeenCalled();
  });
  it('argumentos sao recusados sem ecoar URLs', async () => {
    const f = offline();
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runBackup(environment(), [url()], f.deps, output, loader())).toBe(1);
    expect(output.error).toHaveBeenCalledWith(ERROR_MESSAGES.configuration);
    expect(f.execute).not.toHaveBeenCalled();
    expect(f.client).not.toHaveBeenCalled();
  });
  it.each(['missing-unpooled', 'wrong-project', 'wrong-environment', 'loader-error'])(
    'recusa %s sem fallback para DATABASE_URL ou erro externo', async stage => {
      const selected = values();
      if (stage === 'missing-unpooled') selected.DATABASE_URL_UNPOOLED = '';
      if (stage === 'wrong-project') selected.SUPABASE_PROJECT_REF = otherProject;
      const load = stage === 'loader-error'
        ? vi.fn(() => { throw new Error(url()); })
        : vi.fn(() => ({ environment: stage === 'wrong-environment' ? 'test' : 'production', values: selected }));
      const f = offline();
      const output = { info: vi.fn(), error: vi.fn() };
      expect(await runBackup(environment(), [], f.deps, output, load)).toBe(1);
      expect(output.error).toHaveBeenCalledWith(ERROR_MESSAGES.configuration);
      expect(f.client).not.toHaveBeenCalled();
      expect(f.execute).not.toHaveBeenCalled();
    },
  );
  it('loader real em processo test ja selecionado nao autoriza production nem conecta', async () => {
    const f = offline();
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runBackup(environment(), [], f.deps, output)).toBe(1);
    expect(output.error).toHaveBeenCalledWith(ERROR_MESSAGES.configuration);
    expect(f.execute).not.toHaveBeenCalled();
    expect(f.client).not.toHaveBeenCalled();
  });
});
describe('origem remota exclusivamente Supabase administrativo/TLS', () => {
  it.each([
    url('database.other-provider.invalid'),
    url(`db.${otherProject}.supabase.co`),
    url(`db.${project}.supabase.co.evil.invalid`),
    url(pooler, `postgres.${project}`, '6543'),
    url(pooler, `postgres.${otherProject}`),
    url(pooler, 'postgres'),
    url().replace('5432', '6543'), url().replace('verify-full', 'require'),
    url().replace('/postgres?', '/centraldeanime?'),
    url().replace('postgresql:', 'https:'),
    url() + '&host=remote.invalid', url() + '&sslrootcert=untrusted',
    url() + '&sslmode=disable', url() + '#fragment',
    url().replace(`:${password}@`, '@'), url() + '&schema=auth',
  ])('bloqueia destino/override invalido sem subprocessos', async connectionUrl => {
    const f = offline();
    await expect(backup({
      connectionUrl, directory: directory(), supabase: values(),
    }, f.deps)).rejects.toMatchObject({ code: 'configuration' });
    expect(f.execute).not.toHaveBeenCalled();
    expect(f.client).not.toHaveBeenCalled();
  });
  it.each([url(), url(pooler, `postgres.${project}`)])('prepara e executa apenas mocks com TLS estrito', async connectionUrl => {
    const f = offline();
    const load = loader({ ...values(), DATABASE_URL_UNPOOLED: connectionUrl });
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runBackup(environment(), [], f.deps, output, load)).toBe(0);
    expect(f.client).toHaveBeenCalledWith(expect.objectContaining({
      ssl: expect.objectContaining({ rejectUnauthorized: true }),
      enableChannelBinding: true,
    }));
    const cmd = f.execute.mock.calls.find(([command]) => command.outputFd !== undefined)![0];
    expect(cmd.env.PGSSLMODE).toBe('verify-full');
    expect(cmd.env.PGSSLROOTCERT).toBe('system');
    expect(cmd.env.PGCHANNELBINDING).toBe('require');
    expect(cmd.env.PGOPTIONS).toContain('default_transaction_read_only=on');
    expect(cmd.env.PGPASSWORD).toBe(password);
    expect(cmd.args.join(' ')).not.toContain(password);
    expect(cmd.args.join(' ')).not.toContain(connectionUrl);
    expect(f.session.query).toHaveBeenCalledWith(SOURCE_TLS_SQL);
    expect(output.error).not.toHaveBeenCalled();
    expect(JSON.stringify(output.info.mock.calls)).not.toContain(project);
    expect(f.session.end).toHaveBeenCalledOnce();
  });
  it('falha na verificacao TLS da sessao impede dump', async () => {
    const f = offline();
    const original = f.session.query.getMockImplementation()!;
    f.session.query.mockImplementation(sql => sql === SOURCE_TLS_SQL
      ? Promise.resolve({ rows: [{ ssl: false }] }) : original(sql));
    await expect(backup({ connectionUrl: url(), supabase: values(), directory: directory() }, f.deps))
      .rejects.toMatchObject({ code: 'identity' });
    expect(f.execute.mock.calls.every(([cmd]) => cmd.args[0] === '--version')).toBe(true);
  });
  it('TLS/secret nao sao herdados de outros ambientes', () => {
    const connection = supabaseConnectionFromUrl(url(), values());
    const env = childEnvironment(connection, true);
    expect(env.PGSSLMODE).toBe('verify-full');
    expect(env.DATABASE_URL).toBeUndefined();
    expect(env.SUPABASE_PROJECT_REF).toBeUndefined();
  });
  it('restore nao ganha permissao remota, nem por APP_ENV production', async () => {
    expect(() => restoreConnection(url(), 'centraldeanime_restore_test', 'RESTORE:centraldeanime_restore_test')).toThrow();
    const f = offline();
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runRestore({
      ...environment(), RESTORE_DATABASE_URL: url(),
    }, [], f.deps, output)).toBe(1);
    expect(f.execute).not.toHaveBeenCalled();
    expect(f.client).not.toHaveBeenCalled();
  });
  it('restore com autorizacao local ainda rejeita URL Supabase antes de conectar', async () => {
    const f = offline();
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runRestore({
      APP_ENV: 'restore', BACKUP_RESTORE_EXECUTION: 'local-only',
      RESTORE_DATABASE_URL: url(), RESTORE_BACKUP_DIRECTORY: directory(),
      RESTORE_DATABASE_NAME: 'centraldeanime_restore_test',
      RESTORE_CONFIRMATION: 'RESTORE:centraldeanime_restore_test',
    }, [], f.deps, output)).toBe(1);
    expect(f.execute).not.toHaveBeenCalled();
    expect(f.client).not.toHaveBeenCalled();
  });
});
