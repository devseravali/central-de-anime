import { afterEach, describe, expect, it, vi } from 'vitest';
import { randomUUID } from 'node:crypto';
import {
  existsSync, linkSync, mkdirSync, mkdtempSync, readFileSync, readSync, readdirSync,
  rmSync, symlinkSync, writeFileSync, writeSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runBackup, runRestore } from '../../../scripts/backup/runners';
import {
  backup, restore, childEnvironment, connectionFromUrl, externalDirectory, restoreConnection,
  BackupError, safeError, REPOSITORY, IDENTITY_SQL, EMPTY_SQL, TABLES_SQL, INTEGRITY_SQL,
  type Command, type Connection, type Dependencies, type PgSession,
} from '../../../scripts/backup/library';

vi.mock('node:crypto', async importOriginal => {
  const actual = await importOriginal<typeof import('node:crypto')>();
  return { ...actual, randomUUID: vi.fn(actual.randomUUID) };
});

const secret = 'offline-secret-with-@-and-=';
const sourceUrl = `postgresql://backup_reader:${encodeURIComponent(secret)}@localhost:5432/centraldeanime`;
const database = 'centraldeanime_restore_offline';
const targetUrl = `postgresql://restore_owner:${encodeURIComponent(secret)}@127.0.0.1:5432/${database}`;
const toc = `; Archive created at offline
;     Format: CUSTOM
;     dbname: private-source
1; 0 0 SCHEMA - public private-role
2; 1259 100 TABLE public Anime private-role
3; 0 100 TABLE DATA public Anime private-role
4; 2606 101 CONSTRAINT public Anime Anime_pkey private-role
`;
const directories: string[] = [];
const temporary = () => {
  const directory = mkdtempSync(join(tmpdir(), 'anime-backup-unit-'));
  directories.push(directory);
  return directory;
};
afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true, force: true });
});
function identity(connection: Connection) {
  return {
    database: connection.database, role: connection.user, session_role: connection.user,
    address: connection.host, port: connection.port, version: '180004', recovery: false,
    superuser: false, createdb: false, createrole: false, replication: false, bypassrls: false,
  };
}
function fake(url: string, onRestoreInput?: (header: string) => void) {
  const connection = connectionFromUrl(url);
  const session: PgSession = {
    connect: vi.fn().mockResolvedValue(undefined),
    end: vi.fn().mockResolvedValue(undefined),
    query: vi.fn(async (sql: string) => {
      if (sql === IDENTITY_SQL) return { rows: [identity(connection)] };
      if (sql === EMPTY_SQL) return { rows: [{ objects: '0', other_sessions: '0', owner: true }] };
      if (sql === TABLES_SQL) return { rows: [{ schema: 'public', name: 'Anime' }] };
      if (sql === INTEGRITY_SQL) return { rows: [{ invalid: '0' }] };
      if (sql.includes('pg_try_advisory_lock')) return { rows: [{ locked: true }] };
      if (sql.includes('pg_export_snapshot')) return { rows: [{ snapshot: '00000003-00000001-1' }] };
      if (sql.startsWith('SELECT count(*)')) return { rows: [{ count: '12' }] };
      return { rows: [] };
    }),
  };
  const execute = vi.fn(async (command: Command) => {
    if (command.args[0] === '--version') return `${command.tool} (PostgreSQL) 18.4\n`;
    if (command.args[0] === '--list') return toc;
    if (command.tool === 'pg_dump') {
      if (command.outputFd === undefined) throw new Error('missing fd');
      writeSync(command.outputFd, Buffer.from('PGDMPoffline-unit-test-not-a-real-dump'));
    }
    if (command.inputFd !== undefined) {
      const header = Buffer.alloc(5);
      readSync(command.inputFd, header, 0, header.length, null);
      onRestoreInput?.(header.toString());
    }
    return '';
  });
  const deps: Dependencies = { execute, client: vi.fn(() => session) };
  return { deps, session, execute, connection };
}
async function fixture() {
  const root = temporary();
  const source = fake(sourceUrl);
  const result = await backup({ connectionUrl: sourceUrl, directory: root }, source.deps);
  const destination = fake(targetUrl);
  const input = {
    connectionUrl: targetUrl, directory: result.directory, database,
    confirmation: `RESTORE:${database}`,
  };
  return { ...result, source, destination, input };
}
function validatedFiles(directory: string) {
  return readdirSync(directory).filter(file => file.endsWith('.validated.json'));
}

describe('backup e restore de validation com ferramentas mockadas', () => {
  const importDb = 'centraldeanime_import_validation_20261112';
  const restoreDb = 'centraldeanime_restore_20261112';
  const password = 'c3'.repeat(48);
  const key = 'd4'.repeat(32);
  const url = (name: string) => `postgresql://centraldeanime_validation:${password}@127.0.0.1:55432/${name}`;
  function env(operation: 'backup' | 'restore', database = operation === 'backup' ? importDb : restoreDb) {
    return {
      APP_ENV: 'validation', VALIDATION_OPERATION: operation, BACKUP_RESTORE_EXECUTION: 'local-only',
      DATABASE_URL: url(database), DATABASE_URL_UNPOOLED: url(database), VALIDATION_ARCHIVE_KEY: key,
      BACKUP_CONFIRMATION: `BACKUP:${importDb}`, RESTORE_CONFIRMATION: `RESTORE:${restoreDb}`,
    };
  }

  it('valida destino e diretorio antes de construir cliente ou executar ferramenta', async () => {
    const f = fake(url(importDb));
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runBackup({ ...env('backup'), BACKUP_DIRECTORY: REPOSITORY }, [], f.deps, output)).toBe(1);
    expect(await runBackup({ ...env('backup', restoreDb), BACKUP_DIRECTORY: temporary() }, [], f.deps, output)).toBe(1);
    expect(await runRestore({ ...env('restore', importDb), RESTORE_BACKUP_DIRECTORY: temporary() }, [], f.deps, output)).toBe(1);
    expect(await runRestore({
      ...env('restore', 'centraldeanime_restore_other'), RESTORE_BACKUP_DIRECTORY: temporary(),
    }, [], f.deps, output)).toBe(1);
    expect(await runRestore({
      APP_ENV: 'restore', BACKUP_RESTORE_EXECUTION: 'local-only',
      RESTORE_DATABASE_URL: targetUrl, RESTORE_DATABASE_NAME: database, RESTORE_CONFIRMATION: `RESTORE:${database}`,
    }, [], f.deps, output)).toBe(1);
    expect(f.execute).not.toHaveBeenCalled();
    expect(f.deps.client).not.toHaveBeenCalled();
    expect(output.error.mock.calls.flat().join()).not.toMatch(new RegExp(`${password}|${key}|postgresql://`));
  });

  it('rejeita manifesto sem autenticacao, com chave errada ou adulterado, e usa o descritor conferido', async () => {
    const root = temporary();
    const source = fake(url(importDb));
    const restoreInput = vi.fn();
    const destination = fake(url(restoreDb), restoreInput);
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runBackup({ ...env('backup'), BACKUP_DIRECTORY: root }, [], source.deps, output)).toBe(0);
    const directory = join(root, readdirSync(root)[0]);
    const restoreEnv = { ...env('restore'), RESTORE_BACKUP_DIRECTORY: directory };
    const path = join(directory, 'manifest.json');
    const original = readFileSync(path, 'utf8');
    const manifest = JSON.parse(original);
    const { validationMac, ...unsigned } = manifest;
    writeFileSync(path, JSON.stringify(unsigned));
    expect(await runRestore(restoreEnv, [], destination.deps, output)).toBe(1);
    writeFileSync(path, JSON.stringify({ ...unsigned, validationMac, counts: [{ schema: 'public', name: 'Anime', count: '999' }] }));
    expect(await runRestore(restoreEnv, [], destination.deps, output)).toBe(1);
    writeFileSync(path, original);
    expect(await runRestore({ ...restoreEnv, VALIDATION_ARCHIVE_KEY: 'e5'.repeat(32) }, [], destination.deps, output)).toBe(1);
    expect(destination.execute).not.toHaveBeenCalled();
    expect(destination.deps.client).not.toHaveBeenCalled();
    expect(await runRestore(restoreEnv, [], destination.deps, output)).toBe(0);
    expect(restoreInput).toHaveBeenCalledWith('PGDMP');
    expect(destination.execute).toHaveBeenCalledWith(expect.objectContaining({
      tool: 'pg_restore', inputFd: expect.any(Number),
      args: expect.arrayContaining([`--dbname=${restoreDb}`, '--single-transaction']),
    }));
    expect(output.info.mock.calls.flat().join()).toContain(manifest.sha256);
    expect([...output.info.mock.calls, ...output.error.mock.calls].flat().join())
      .not.toMatch(new RegExp(`${password}|${key}|postgresql://`));
  });
});

describe('backup: URL, ambiente e caminhos offline', () => {
  it.each(['remote.example', 'db.example.supabase.co', '127.0.0.2', 'localhost.evil', '0.0.0.0'])(
    'recusa host %s sem executor', async host => {
      const f = fake(sourceUrl);
      await expect(backup({
        connectionUrl: sourceUrl.replace('localhost', host), directory: temporary(),
      }, f.deps)).rejects.toMatchObject({ code: 'configuration' });
      expect(f.execute).not.toHaveBeenCalled();
      expect(f.deps.client).not.toHaveBeenCalled();
    },
  );
  it.each([
    '', 'not-a-url', 'https://reader:password@localhost/db',
    'postgresql://reader@localhost/db',
    'postgresql://reader:password@localhost/db?host=remote.example',
    'postgresql://reader:password@localhost/db?options=-c%20role=postgres',
    'postgresql://reader:password@localhost/db#private',
    'postgresql://reader:password@localhost/a%2Fb',
    'postgresql://reader:password@localhost/centraldeanime_production',
    'postgresql://reader:password@localhost/postgres',
    'postgresql://reader:password@localhost/template1',
    'postgresql://reader:pass%00word@localhost/db',
    'postgresql://bad%20user:password@localhost/db',
    'postgresql://reader:password@local\nhost/db',
    ' postgresql://reader:password@localhost/db',
  ])('sanitiza configuracao recusada %s', value => {
    expect(() => connectionFromUrl(value)).toThrow(BackupError);
    try { connectionFromUrl(value); } catch (error) {
      expect(safeError(error)).not.toContain(value || 'password');
      expect(safeError(error)).not.toContain(secret);
    }
  });
  it('normaliza loopback numerico sem DNS e decodifica credenciais', () => {
    expect(connectionFromUrl(sourceUrl)).toMatchObject({ host: '127.0.0.1', password: secret });
    expect(connectionFromUrl(sourceUrl.replace('localhost', '[::1]')).host).toBe('::1');
  });
  it.each([
    '', '.', REPOSITORY, join(REPOSITORY, 'backend'), 'D:\\',
    '\\\\remote.invalid\\share', '//remote.invalid/share', '\\\\?\\C:\\private',
    'C:\\private:stream', 'C:\\private.\\directory', 'C:\\private \\directory',
  ])('recusa caminho inseguro %s', path => {
    expect(() => externalDirectory(path)).toThrow(expect.objectContaining({ code: 'path' }));
  });
  it('exige diretorio existente externo e rejeita arquivo', () => {
    const root = temporary();
    expect(externalDirectory(root)).toBe(root);
    expect(() => externalDirectory(join(root, 'missing'))).toThrow(BackupError);
    const file = join(root, 'file');
    writeFileSync(file, 'private');
    expect(() => externalDirectory(file)).toThrow(BackupError);
  });
  it('recusa junction/symlink externo apontando para repo ou outro diretorio', () => {
    const root = temporary();
    const link = join(root, 'link');
    symlinkSync(REPOSITORY, link, 'junction');
    expect(() => externalDirectory(link)).toThrow(BackupError);
  });
  it('nao herda segredos ou overrides PG do processo', () => {
    vi.stubEnv('PGHOST', 'remote.example');
    vi.stubEnv('PGSERVICE', 'production');
    vi.stubEnv('NODE_OPTIONS', '--require private-loader');
    vi.stubEnv('DATABASE_URL', 'private-url');
    try {
      const env = childEnvironment(connectionFromUrl(sourceUrl), true);
      expect(env.PGHOST).toBe('127.0.0.1');
      expect(env.PGPASSWORD).toBe(secret);
      expect(env.PGSERVICE).toBeUndefined();
      expect(env.DATABASE_URL).toBeUndefined();
      expect(env.NODE_OPTIONS).toBeUndefined();
      expect(env.PATH).toBeUndefined();
      expect(env.PGOPTIONS).toContain('default_transaction_read_only=on');
      expect(childEnvironment().PGPASSWORD).toBeUndefined();
    } finally { vi.unstubAllEnvs(); }
  });
});

describe('backup custom e evidencias (fixtures sinteticas)', () => {
  it('mantem snapshot, cria manifesto exclusivo e nunca valida restauracao pelo hash', async () => {
    const f = await fixture();
    const dump = f.source.execute.mock.calls.find(([cmd]) => cmd.tool === 'pg_dump' && cmd.outputFd !== undefined)![0];
    expect(dump.args).toContain('--format=custom');
    expect(dump.args).toContain('--snapshot=00000003-00000001-1');
    expect(dump.args.join(' ')).not.toContain(secret);
    expect(dump.args.join(' ')).not.toContain(sourceUrl);
    expect(dump.outputFd).toBeTypeOf('number');
    const stored = readFileSync(join(f.directory, 'manifest.json'), 'utf8');
    expect(stored).not.toContain(secret);
    expect(stored).not.toContain('private-role');
    expect(stored).not.toContain('private-source');
    expect(f.manifest.restoration).toBe('not-validated');
    expect(f.manifest.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(f.manifest.counts).toEqual([{ schema: 'public', name: 'Anime', count: '12' }]);
    expect(validatedFiles(f.directory)).toEqual([]);
    const queries = vi.mocked(f.source.session.query).mock.calls.map(([sql]) => sql);
    expect(queries[0]).toContain('REPEATABLE READ READ ONLY');
    expect(queries.at(-1)).toBe('COMMIT');
    expect(f.source.session.end).toHaveBeenCalledOnce();
  });
  it('colisao de UUID nao sobrescreve nem apaga backup anterior', async () => {
    const root = temporary();
    const id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    vi.mocked(randomUUID).mockReturnValueOnce(id).mockReturnValueOnce(id);
    const first = fake(sourceUrl);
    const result = await backup({ connectionUrl: sourceUrl, directory: root }, first.deps);
    const before = readFileSync(join(result.directory, 'archive.dump'));
    const second = fake(sourceUrl);
    await expect(backup({ connectionUrl: sourceUrl, directory: root }, second.deps)).rejects.toMatchObject({ code: 'storage' });
    expect(readFileSync(join(result.directory, 'archive.dump'))).toEqual(before);
    expect(second.execute.mock.calls.filter(([c]) => c.tool === 'pg_dump' && c.args[0] !== '--version')).toEqual([]);
    expect(second.session.end).toHaveBeenCalledOnce();
  });
  it('escapa identificadores de tabela retornados pelo catalogo sem interpolar SQL livre', async () => {
    const root = temporary();
    const f = fake(sourceUrl);
    const original = vi.mocked(f.session.query).getMockImplementation()!;
    vi.mocked(f.session.query).mockImplementation((sql, values) => sql === TABLES_SQL
      ? Promise.resolve({ rows: [{ schema: 'public', name: 'Odd"Table' }] }) : original(sql, values));
    await backup({ connectionUrl: sourceUrl, directory: root }, f.deps);
    expect(f.session.query).toHaveBeenCalledWith('SELECT count(*)::text AS count FROM "public"."Odd""Table"');
  });
  it.each(['pg_dump', 'pg_restore'])('falha %s preserva arquivos e nao publica manifesto', async tool => {
    const root = temporary();
    const f = fake(sourceUrl);
    const original = f.execute.getMockImplementation()!;
    f.execute.mockImplementation(async command => {
      if (command.tool === tool && command.args[0] !== '--version') {
        if (command.outputFd !== undefined) writeSync(command.outputFd, Buffer.from('PGDMPpartial'));
        throw new Error(sourceUrl + secret);
      }
      return original(command);
    });
    await expect(backup({ connectionUrl: sourceUrl, directory: root }, f.deps)).rejects.toMatchObject({ code: 'process' });
    const partial = join(root, readdirSync(root)[0]);
    expect(existsSync(join(partial, 'archive.dump'))).toBe(true);
    expect(existsSync(join(partial, 'manifest.json'))).toBe(false);
    expect(f.session.end).toHaveBeenCalledOnce();
  });
  it.each(['version', 'connect', 'identity', 'snapshot', 'count', 'integrity', 'toc', 'magic'])(
    'falha fechada em %s sem secret nos erros', async stage => {
      const root = temporary();
      const f = fake(sourceUrl);
      const query = vi.mocked(f.session.query).getMockImplementation()!;
      const command = f.execute.getMockImplementation()!;
      if (stage === 'connect') vi.mocked(f.session.connect).mockRejectedValue(new Error(sourceUrl));
      vi.mocked(f.session.query).mockImplementation(async (sql, values) => {
        if (stage === 'identity' && sql === IDENTITY_SQL) return { rows: [{ ...identity(f.connection), address: 'remote' }] };
        if (stage === 'snapshot' && sql.includes('pg_export_snapshot')) return { rows: [{ snapshot: secret }] };
        if (stage === 'count' && sql.startsWith('SELECT count(*)')) return { rows: [{ count: null }] };
        if (stage === 'integrity' && sql === INTEGRITY_SQL) return { rows: [{ invalid: '1' }] };
        return query(sql, values);
      });
      f.execute.mockImplementation(async cmd => {
        if (stage === 'version' && cmd.args[0] === '--version') return 'private invalid version';
        if (stage === 'toc' && cmd.args[0] === '--list') return 'private invalid TOC';
        if (stage === 'magic' && cmd.tool === 'pg_dump') {
          writeSync(cmd.outputFd!, Buffer.from('not-a-dump')); return '';
        }
        return command(cmd);
      });
      let error: unknown;
      try { await backup({ connectionUrl: sourceUrl, directory: root }, f.deps); } catch (caught) { error = caught; }
      expect(error).toBeInstanceOf(BackupError);
      expect(safeError(error)).not.toContain(secret);
      expect(safeError(error)).not.toContain(sourceUrl);
      for (const dir of readdirSync(root)) expect(existsSync(join(root, dir, 'manifest.json'))).toBe(false);
    },
  );
});

describe('restore local exclusivo e verificacao real via interface pg mockada', () => {
  it.each([
    ['centraldeanime', 'RESTORE:centraldeanime'],
    ['centraldeanime_restore_prod', 'RESTORE:centraldeanime_restore_prod'],
    [database, 'yes'], [database, ''], ['centraldeanime_restore_x;DROP', 'yes'],
  ])('recusa nome/confirmacao %s', (name, confirmation) => {
    expect(() => restoreConnection(targetUrl, name, confirmation)).toThrow(BackupError);
  });
  it('sucesso mockado exige preflight, processo, identidade posterior, contagens e integridade', async () => {
    const f = await fixture();
    const before = readFileSync(join(f.directory, 'manifest.json'));
    const report = await restore(f.input, f.destination.deps);
    expect(report.restoration).toBe('validated');
    expect(report.target).toEqual({ database, host: '127.0.0.1', port: 5432 });
    expect(report.validatedAt).toMatch(/^\d{4}-\d\d-\d\dT/);
    expect(report.inspection.counts).toEqual(f.manifest.counts);
    expect(validatedFiles(f.directory)).toEqual([`restore-${database}.validated.json`]);
    expect(readFileSync(join(f.directory, 'manifest.json'))).toEqual(before);
    expect(f.destination.session.end).toHaveBeenCalledOnce();
    const queries = vi.mocked(f.destination.session.query).mock.calls.map(([sql]) => sql);
    expect(queries.filter(sql => sql === IDENTITY_SQL)).toHaveLength(2);
    expect(queries).toContain(EMPTY_SQL);
    expect(queries).toContain(INTEGRITY_SQL);
    const command = f.destination.execute.mock.calls.find(([c]) => c.args.includes('--single-transaction'))![0];
    expect(command.args).toContain('--exit-on-error');
    expect(command.args).toContain(`--dbname=${database}`);
    expect(command.args.join(' ')).not.toMatch(/postgresql:|--clean|--create|--disable-triggers/);
    expect(command.args.join(' ')).not.toContain(secret);
    // --no-password is intentional; it prevents interactive prompts.
    expect(command.args).toContain('--no-password');
    expect(command.env.PGPASSWORD).toBe(secret);
  });
  it.each([
    ['database', 'centraldeanime'], ['role', 'postgres'], ['session_role', 'postgres'],
    ['address', '192.0.2.1'], ['port', 5433], ['version', '170004'],
    ['recovery', true], ['superuser', true], ['createdb', true], ['createrole', true],
    ['replication', true], ['bypassrls', true],
  ])('identidade %s divergente impede restore', async (field, value) => {
    const f = await fixture();
    const original = vi.mocked(f.destination.session.query).getMockImplementation()!;
    vi.mocked(f.destination.session.query).mockImplementation((sql, values) =>
      sql === IDENTITY_SQL ? Promise.resolve({ rows: [{ ...identity(f.destination.connection), [field]: value }] }) : original(sql, values));
    await expect(restore(f.input, f.destination.deps)).rejects.toMatchObject({ code: 'identity' });
    expect(f.destination.execute.mock.calls.some(([c]) => c.args.includes('--single-transaction'))).toBe(false);
    expect(validatedFiles(f.directory)).toEqual([]);
    expect(f.destination.session.end).toHaveBeenCalledOnce();
  });
  it.each([
    { objects: '1', other_sessions: '0', owner: true },
    { objects: '0', other_sessions: '1', owner: true },
    { objects: '0', other_sessions: '0', owner: false },
    { objects: 0, other_sessions: '0', owner: true }, {},
  ])('vazio/ownership/sessoes invalidos impedem restore', async row => {
    const f = await fixture();
    const original = vi.mocked(f.destination.session.query).getMockImplementation()!;
    vi.mocked(f.destination.session.query).mockImplementation((sql, values) =>
      sql === EMPTY_SQL ? Promise.resolve({ rows: [row] }) : original(sql, values));
    await expect(restore(f.input, f.destination.deps)).rejects.toMatchObject({ code: 'empty' });
    expect(f.destination.execute.mock.calls.some(([c]) => c.args.includes('--single-transaction'))).toBe(false);
    expect(validatedFiles(f.directory)).toEqual([]);
  });
  it.each(['process', 'post-identity', 'count', 'integrity', 'inspection-error', 'commit', 'lock'])(
    'nao valida se falhar %s; preserva arquivo e tentativa', async stage => {
      const f = await fixture();
      const originalQuery = vi.mocked(f.destination.session.query).getMockImplementation()!;
      const originalExecute = f.destination.execute.getMockImplementation()!;
      let identities = 0;
      vi.mocked(f.destination.session.query).mockImplementation(async (sql, values) => {
        if (sql === IDENTITY_SQL) identities++;
        if (stage === 'post-identity' && sql === IDENTITY_SQL && identities === 2) return { rows: [] };
        if (stage === 'count' && sql.startsWith('SELECT count(*)')) return { rows: [{ count: '11' }] };
        if (stage === 'integrity' && sql === INTEGRITY_SQL) return { rows: [{ invalid: '1' }] };
        if (stage === 'inspection-error' && sql === TABLES_SQL) throw new Error(secret);
        if (stage === 'commit' && sql === 'COMMIT') throw new Error(targetUrl);
        if (stage === 'lock' && sql.includes('pg_try_advisory_lock')) return { rows: [{ locked: false }] };
        return originalQuery(sql, values);
      });
      f.destination.execute.mockImplementation(async cmd => {
        if (stage === 'process' && cmd.args.includes('--single-transaction')) throw new Error(targetUrl + secret);
        return originalExecute(cmd);
      });
      await expect(restore(f.input, f.destination.deps)).rejects.toBeInstanceOf(BackupError);
      expect(existsSync(join(f.directory, 'archive.dump'))).toBe(true);
      expect(existsSync(join(f.directory, `restore-${database}.attempt`))).toBe(true);
      expect(validatedFiles(f.directory)).toEqual([]);
      expect(f.destination.session.end).toHaveBeenCalledOnce();
    },
  );
  it.each(['hash', 'manifest-json', 'empty-counts', 'fake-validated', 'toc', 'hardlink', 'missing'])(
    'rejeita evidencia invalida %s antes de conectar', async stage => {
      const f = await fixture();
      const manifestPath = join(f.directory, 'manifest.json');
      const archive = join(f.directory, 'archive.dump');
      if (stage === 'hash') writeFileSync(archive, 'PGDMPtampered');
      if (stage === 'manifest-json') writeFileSync(manifestPath, secret);
      if (stage === 'empty-counts') writeFileSync(manifestPath, JSON.stringify({ ...f.manifest, counts: [] }));
      if (stage === 'fake-validated') writeFileSync(manifestPath, JSON.stringify({ ...f.manifest, restoration: 'validated' }));
      if (stage === 'toc') {
        const original = f.destination.execute.getMockImplementation()!;
        f.destination.execute.mockImplementation(cmd => cmd.args[0] === '--list' ? Promise.resolve(toc + '5; 0 0 COMMENT private\n') : original(cmd));
      }
      if (stage === 'hardlink') linkSync(archive, join(f.directory, 'alias.dump'));
      if (stage === 'missing') rmSync(manifestPath);
      await expect(restore(f.input, f.destination.deps)).rejects.toBeInstanceOf(BackupError);
      expect(f.destination.deps.client).not.toHaveBeenCalled();
      expect(validatedFiles(f.directory)).toEqual([]);
    },
  );
  it('arquivo symlink/junction e recusado', async () => {
    const f = await fixture();
    rmSync(join(f.directory, 'archive.dump'));
    const other = join(temporary(), 'archive.dump');
    mkdirSync(other);
    symlinkSync(other, join(f.directory, 'archive.dump'), 'junction');
    await expect(restore(f.input, f.destination.deps)).rejects.toMatchObject({ code: 'path' });
    expect(f.destination.deps.client).not.toHaveBeenCalled();
  });
  it('nao repete tentativa nem sobrescreve relatorio validado', async () => {
    const f = await fixture();
    await restore(f.input, f.destination.deps);
    const file = join(f.directory, `restore-${database}.validated.json`);
    const before = readFileSync(file);
    const again = fake(targetUrl);
    await expect(restore(f.input, again.deps)).rejects.toBeInstanceOf(BackupError);
    expect(again.deps.client).not.toHaveBeenCalled();
    expect(readFileSync(file)).toEqual(before);
  });
});
