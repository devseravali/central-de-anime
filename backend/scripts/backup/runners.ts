import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadValidationEnvironment } from '../../src/config/validationEnvironment.mjs';
import {
  backup, restore, BackupError, externalDirectory, restoreConnection,
  supabaseConnectionFromUrl, execute, safeError, type Dependencies, type BackupInput,
} from './library';

export function isMain(url: string): boolean {
  return Boolean(process.argv[1]) && resolve(process.argv[1]) === fileURLToPath(url);
}
async function dependencies(): Promise<Dependencies> {
  const { Client } = await import('pg');
  return { execute, client: config => new Client(config) };
}
export interface Output { info(message: string): void; error(message: string): void }
const consoleOutput: Output = {
  info: message => console.log(message),
  error: message => console.error(message),
};
function validationArchiveKey(env: NodeJS.ProcessEnv): string {
  const key = env.VALIDATION_ARCHIVE_KEY;
  if (!key || !/^[0-9a-f]{64}$/i.test(key)) throw new BackupError('configuration');
  return key;
}
export interface BackupEnvironment {
  environment: string;
  values: Readonly<Record<string, string | undefined>>;
}
export type EnvironmentLoader = () => BackupEnvironment | Promise<BackupEnvironment>;
async function selectedEnvironment(): Promise<BackupEnvironment> {
  const { loadEnvironment } = await import('../../src/config/environment');
  return loadEnvironment();
}
/**
 * Preparation only: reads selected environment and checks paths, never imports pg,
 * opens a connection, creates files or invokes an executable.
 * Returned input includes credentials: do not log, serialize or persist it.
 */
export async function prepareBackup(
  env: NodeJS.ProcessEnv = process.env, args: readonly string[] = [],
  loader: EnvironmentLoader = selectedEnvironment,
): Promise<BackupInput> {
  try {
    if (env.APP_ENV === 'validation') {
      if (args.length || env.BACKUP_RESTORE_EXECUTION !== 'local-only' || env.BACKUP_DATABASE_URL) {
        throw new BackupError('configuration');
      }
      const { database, connectionUrl } = loadValidationEnvironment('backup', env);
      if (env.BACKUP_CONFIRMATION !== `BACKUP:${database}`) throw new BackupError('configuration');
      return { connectionUrl, validationArchiveKey: validationArchiveKey(env), directory: externalDirectory(env.BACKUP_DIRECTORY || '') };
    }
    if (env.APP_ENV !== 'production' || args.length || (env.APP_RUNTIME && env.APP_RUNTIME !== 'readonly') ||
        env.BACKUP_RESTORE_EXECUTION !== 'supabase-readonly' || env.BACKUP_DATABASE_URL ||
        !env.SUPABASE_PROJECT_REF ||
        env.BACKUP_CONFIRMATION !== `BACKUP:SUPABASE:${env.SUPABASE_PROJECT_REF}`) {
      throw new BackupError('configuration');
    }
    const selected = await loader();
    if (selected.environment !== 'production' ||
        selected.values.SUPABASE_PROJECT_REF !== env.SUPABASE_PROJECT_REF) {
      throw new BackupError('configuration');
    }
    const connectionUrl = selected.values.DATABASE_URL_UNPOOLED || '';
    const supabase = {
      SUPABASE_PROJECT_REF: selected.values.SUPABASE_PROJECT_REF,
      SUPABASE_POOLER_HOST: selected.values.SUPABASE_POOLER_HOST,
    };
    supabaseConnectionFromUrl(connectionUrl, supabase);
    return { connectionUrl, supabase, directory: externalDirectory(env.BACKUP_DIRECTORY || '') };
  } catch { throw new BackupError('configuration'); }
}
export async function runBackup(
  env: NodeJS.ProcessEnv = process.env, args: readonly string[] = process.argv.slice(2),
  injected?: Dependencies, output: Output = consoleOutput, loader: EnvironmentLoader = selectedEnvironment,
): Promise<0 | 1> {
  try {
    const input = await prepareBackup(env, args, loader);
    const result = await backup(input, injected || await dependencies());
    if (input.validationArchiveKey) output.info(`Backup de validacao: SHA-256 ${result.manifest.sha256}.`);
    output.info('Backup custom criado; estrutura e SHA256 registrados. Restauracao NAO validada.');
    return 0;
  } catch (error) {
    output.error(safeError(error));
    return 1;
  }
}
export async function runRestore(
  env: NodeJS.ProcessEnv = process.env, args: readonly string[] = process.argv.slice(2),
  injected?: Dependencies, output: Output = consoleOutput,
): Promise<0 | 1> {
  try {
    if (args.length || env.BACKUP_RESTORE_EXECUTION !== 'local-only' || env.RESTORE_DATABASE_URL || env.RESTORE_DATABASE_NAME) {
      throw new BackupError('configuration');
    }
    let target: ReturnType<typeof loadValidationEnvironment>;
    try { target = loadValidationEnvironment('restore', env); }
    catch { throw new BackupError('configuration'); }
    const confirmation = env.RESTORE_CONFIRMATION || '';
    restoreConnection(target.connectionUrl, target.database, confirmation);
    const key = validationArchiveKey(env);
    externalDirectory(env.RESTORE_BACKUP_DIRECTORY || '');
    await restore({
      connectionUrl: target.connectionUrl,
      directory: env.RESTORE_BACKUP_DIRECTORY || '',
      database: target.database,
      confirmation,
      validationArchiveKey: key,
    }, injected || await dependencies());
    output.info('Restauracao local validada: contagens conferidas e constraints/indices inspecionados.');
    return 0;
  } catch (error) {
    output.error(safeError(error));
    return 1;
  }
}
