export const validationDatabases = Object.freeze({
  replay: 'centraldeanime_migrate_validation_20261112',
  'migrate-import': 'centraldeanime_import_validation_20261112',
  import: 'centraldeanime_import_validation_20261112',
  backup: 'centraldeanime_import_validation_20261112',
  restore: 'centraldeanime_restore_20261112',
});
export const validationHost = '127.0.0.1';
export const validationPort = '55432';
export const validationRole = 'centraldeanime_validation';

/** @typedef {keyof typeof validationDatabases} ValidationOperation */

/**
 * Administrative only. Never reads dotenv, returns a default or logs a URL.
 * @param {ValidationOperation} operation
 * @param {NodeJS.ProcessEnv} env
 */
export function loadValidationEnvironment(operation, env) {
  const denied = () => new Error('Configuracao de validation recusada: confira operacao, destino e credenciais explicitas.');
  if (!Object.hasOwn(validationDatabases, operation) || env.APP_ENV !== 'validation' ||
      env.VALIDATION_OPERATION !== operation || Object.keys(env).some(key =>
        /^(?:PG|RENDER|SUPABASE_|NEON_|PROD_ADMIN_|PRISMA_SCHEMA_ENGINE)|^(?:APP_RUNTIME|NODE_OPTIONS|NODE_DEBUG(?:_NATIVE)?|DEBUG|DIRECT_URL|PRISMA_ACCELERATE_URL)$/i.test(key))) {
    throw denied();
  }
  const database = validationDatabases[operation];
  /** @param {string | undefined} value */
  function validate(value) {
    if (!value || /[\s\\?#]/u.test(value)) throw denied();
    let url;
    try { url = new URL(value); } catch { throw denied(); }
    if (!['postgresql:', 'postgres:'].includes(url.protocol) ||
        url.hostname !== validationHost || url.port !== validationPort ||
        url.pathname !== `/${database}` || url.username !== validationRole ||
        !/^[0-9a-f]{96}$/i.test(url.password) ||
        value !== `${url.protocol}//${validationRole}:${url.password}@${validationHost}:${validationPort}/${database}`) {
      throw denied();
    }
    return url.password;
  }
  const password = validate(env.DATABASE_URL);
  if (password !== validate(env.DATABASE_URL_UNPOOLED)) throw denied();
  const connectionUrl = `postgresql://${validationRole}:${password}@${validationHost}:${validationPort}/${database}`;
  return { database, connectionUrl };
}

/** @param {readonly string[]} args */
export function assertValidationReplayArguments(args) {
  if (args.length !== 2 || args[0] !== 'migrate' || args[1] !== 'deploy') {
    throw new Error('Validation permite apenas prisma migrate deploy sem argumentos adicionais.');
  }
}

/** @param {NodeJS.ProcessEnv} env */
export function loadValidationMigrationEnvironment(env) {
  if (env.VALIDATION_OPERATION !== 'replay' && env.VALIDATION_OPERATION !== 'migrate-import') {
    throw new Error('Operacao de migration de validacao nao autorizada.');
  }
  return loadValidationEnvironment(env.VALIDATION_OPERATION, env);
}
