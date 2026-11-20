import { describe, expect, it, vi } from 'vitest';
import { ChildProcess, spawn } from 'node:child_process';
import { PassThrough } from 'node:stream';
import { runBackup, runRestore, isMain } from '../../../scripts/backup/runners';
import {
  BackupError, ERROR_MESSAGES, safeError, execute, childEnvironment, TOOL_DIRECTORY,
  type Dependencies,
} from '../../../scripts/backup/library';
import { join } from 'node:path';

vi.mock('node:child_process', async importOriginal => {
  const actual = await importOriginal<typeof import('node:child_process')>();
  return {
    ...actual,
    spawn: vi.fn(() => { throw new Error('Unexpected spawn blocked by offline test'); }),
  };
});

describe('runners import-safe e saida fixa', () => {
  it('importar entradas nao chama processos, pg ou loadEnvironment adicional', async () => {
    await import('../../../scripts/backup/backup');
    await import('../../../scripts/backup/restore');
    expect(spawn).not.toHaveBeenCalled();
    expect(isMain(new URL('../../../scripts/backup/backup.ts', import.meta.url).href)).toBe(false);
  });
  it.each(['production', 'local', 'staging', 'test', undefined])('APP_ENV=%s nao autoriza backup/restore', async appEnv => {
    const deps: Dependencies = { execute: vi.fn(), client: vi.fn() };
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runBackup({ APP_ENV: appEnv }, [], deps, output)).toBe(1);
    expect(await runRestore({ APP_ENV: appEnv }, [], deps, output)).toBe(1);
    expect(deps.execute).not.toHaveBeenCalled();
    expect(deps.client).not.toHaveBeenCalled();
    expect(output.info).not.toHaveBeenCalled();
    expect(output.error.mock.calls.flat()).toEqual([ERROR_MESSAGES.configuration, ERROR_MESSAGES.configuration]);
  });
  it.each([
    { APP_ENV: 'backup' },
    { APP_ENV: 'backup', BACKUP_RESTORE_EXECUTION: 'remote' },
    { APP_ENV: 'backup', BACKUP_RESTORE_EXECUTION: 'local-only', APP_RUNTIME: 'production-deploy' },
    { APP_ENV: 'backup', BACKUP_RESTORE_EXECUTION: 'local-only', BACKUP_DATABASE_URL: 'postgresql://secret:secret@remote.example/db' },
  ])('backup recusa ambiente incompleto/override remoto sem efeitos', async env => {
    const deps: Dependencies = { execute: vi.fn(), client: vi.fn() };
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runBackup(env, [], deps, output)).toBe(1);
    expect(deps.execute).not.toHaveBeenCalled();
    expect(deps.client).not.toHaveBeenCalled();
    expect(output.error.mock.calls.flat().join()).not.toContain('secret');
  });
  it('recusa quaisquer argumentos, inclusive URL, sem ecoar segredo', async () => {
    const deps: Dependencies = { execute: vi.fn(), client: vi.fn() };
    const output = { info: vi.fn(), error: vi.fn() };
    expect(await runBackup({
      APP_ENV: 'backup', BACKUP_RESTORE_EXECUTION: 'local-only',
    }, ['postgresql://reader:private@localhost/db'], deps, output)).toBe(1);
    expect(output.error).toHaveBeenCalledWith(ERROR_MESSAGES.configuration);
    expect(deps.client).not.toHaveBeenCalled();
  });
  it('erro externo e BackupError.message adulterada nunca chegam a saida', () => {
    expect(safeError(new Error('postgresql://user:secret@host/db'))).toBe(ERROR_MESSAGES.process);
    const error = new BackupError('archive');
    error.message = 'secret';
    expect(safeError(error)).toBe(ERROR_MESSAGES.archive);
    expect(safeError({ message: 'secret', code: 'archive' })).toBe(ERROR_MESSAGES.process);
  });
  it('pg real continua bloqueado pelo setup', async () => {
    const { Client } = await import('pg');
    expect(() => new Client()).toThrow(/conexoes PostgreSQL reais estao bloqueadas/);
  });
});

describe('executor nativo inteiramente mockado (nenhum binario chamado)', () => {
  const command = () => ({
    tool: 'pg_restore' as const, args: ['--list', 'archive.dump'],
    env: childEnvironment(), cwd: process.cwd(),
  });
  function child() {
    const process = new ChildProcess();
    const stdout = new PassThrough();
    Object.defineProperty(process, 'stdout', { value: stdout });
    vi.mocked(spawn).mockReturnValueOnce(process);
    return { process, stdout };
  }
  it('usa executavel absoluto, sem shell, stdin/stderr descartados e ambiente allowlist', async () => {
    const c = child();
    const result = execute(command());
    c.stdout.emit('data', Buffer.from('offline structural output'));
    c.process.emit('close', 0);
    await expect(result).resolves.toBe('offline structural output');
    expect(spawn).toHaveBeenLastCalledWith(join(TOOL_DIRECTORY, 'pg_restore.exe'),
      ['--list', 'archive.dump'], expect.objectContaining({
        shell: false, windowsHide: true, stdio: ['ignore', 'pipe', 'ignore'],
        env: childEnvironment(),
      }));
  });
  it.each(['nonzero', 'signal', 'error', 'throw', 'overflow', 'stream-error'])('falha %s retorna erro fixo', async failure => {
    if (failure === 'throw') {
      vi.mocked(spawn).mockImplementationOnce(() => { throw new Error('credential-secret'); });
      await expect(execute(command())).rejects.toEqual(new BackupError('process'));
      return;
    }
    const c = child();
    const kill = vi.spyOn(c.process, 'kill').mockImplementation(() => {
      c.process.emit('close', null); return true;
    });
    const result = execute(command());
    const assertion = expect(result).rejects.toEqual(new BackupError('process'));
    if (failure === 'nonzero') c.process.emit('close', 1);
    if (failure === 'signal') c.process.emit('close', null);
    if (failure === 'error') c.process.emit('error', new Error('credential-secret'));
    if (failure === 'stream-error') c.stdout.emit('error', new Error('credential-secret'));
    if (failure === 'overflow') c.stdout.emit('data', Buffer.alloc(8 * 1024 * 1024 + 1));
    await assertion;
    if (failure === 'overflow') expect(kill).toHaveBeenCalledOnce();
  });
  it('timeout aborta e nao retorna sucesso', async () => {
    vi.useFakeTimers();
    try {
      const c = child();
      const kill = vi.spyOn(c.process, 'kill').mockImplementation(() => {
        c.process.emit('close', null); return true;
      });
      const assertion = expect(execute(command())).rejects.toEqual(new BackupError('process'));
      await vi.advanceTimersByTimeAsync(15 * 60_000);
      await assertion;
      expect(kill).toHaveBeenCalledOnce();
    } finally { vi.useRealTimers(); }
  });
});
