import net from 'node:net';
import type { ClientConfig, CustomTypesConfig, QueryConfig } from 'pg';
import type { SelectedEnvironment } from '../src/config/environment';
import { collectStagingInventory } from './staging-inventory';

export const identityFields = [
  'database', 'role', 'session_role', 'address', 'port', 'version', 'server_version',
  'transaction_read_only', 'default_transaction_read_only',
] as const;

export const identitySql = `SELECT current_database() AS database, current_user AS role,
  session_user AS session_role,
  host(inet_server_addr()) AS address, inet_server_port() AS port,
  version() AS version, current_setting('server_version') AS server_version,
  current_setting('transaction_read_only') AS transaction_read_only,
  current_setting('default_transaction_read_only') AS default_transaction_read_only`;

export class InspectionError extends Error {
  constructor(
    public readonly stage: string,
    public readonly field: string,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'InspectionError';
  }
}

function fail(stage: string, field: string, message: string): never {
  throw new InspectionError(stage, field, 'INSPECTION_VALIDATION_FAILED', message);
}

export function normalizeLocalHost(host: unknown): '127.0.0.1' | '::1' {
  if (host === '[::1]' || host === '::1') return '::1';
  if (host === 'localhost' || host === '127.0.0.1') return '127.0.0.1';
  return fail('destination', 'host', 'Host deve ser localhost ou loopback autorizado.');
}

export function inspectionConfig(
  policy: SelectedEnvironment,
  connection: ClientConfig,
  args: readonly string[],
): ClientConfig & { host: '127.0.0.1' | '::1' } {
  return configForEnvironment(policy, connection, args, 'local');
}

export function stagingInspectionConfig(
  policy: SelectedEnvironment,
  connection: ClientConfig,
  args: readonly string[],
): ClientConfig & { host: '127.0.0.1' | '::1' } {
  return configForEnvironment(policy, connection, args, 'staging');
}

function configForEnvironment(
  policy: SelectedEnvironment, connection: ClientConfig, args: readonly string[],
  environment: 'local' | 'staging',
): ClientConfig & { host: '127.0.0.1' | '::1' } {
  const database = environment === 'local' ? 'centraldeanime' : 'centraldeanime_staging';
  if (args.length) fail('configuration', 'arguments', 'Argumentos de substituicao nao permitidos.');
  if (policy.environment !== environment) fail('configuration', 'environment', `APP_ENV deve ser ${environment}.`);
  if (environment === 'staging') {
    if (!policy.readOnly) fail('configuration', 'readOnly', 'Staging deve ser somente leitura.');
    if (connection.host !== 'localhost' || connection.connectionString) {
      fail('destination', 'host', 'Driver staging exige localhost, sem connectionString alternativa.');
    }
  }
  for (const url of [policy.urls.application, policy.urls.direct]) {
    if (url.hostname !== 'localhost') fail('destination', 'host', 'Ambas as URLs devem usar localhost.');
    normalizeLocalHost(url.hostname);
    if ((url.port || '5432') !== '5432') fail('destination', 'port', 'Porta deve ser 5432.');
    if (url.pathname !== `/${database}`) fail('destination', 'database', `Database deve ser ${database}.`);
  }
  const host = normalizeLocalHost(connection.host);
  if (host !== normalizeLocalHost(policy.urls.application.hostname)) {
    fail('destination', 'host', 'Host do driver diverge do destino selecionado.');
  }
  if (connection.port !== undefined && connection.port !== 5432) fail('destination', 'port', 'Porta do driver deve ser 5432.');
  if (connection.database !== database) fail('destination', 'database', `Database do driver deve ser ${database}.`);
  if (!connection.user) fail('destination', 'role', 'Usuario de conexao explicito obrigatorio.');
  return {
    ...connection, host, database, port: 5432,
    options: '-c default_transaction_read_only=on -c statement_timeout=10000 -c row_security=off',
    application_name: 'central-de-anime-controlled-readonly-inspection',
    connectionTimeoutMillis: 5000, query_timeout: 12000,
  };
}

export function record(value: unknown, stage: string, field: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(stage, field, 'Objeto de resultado obrigatorio.');
  }
  return value as Record<string, unknown>;
}

export function validateIdentity(result: unknown, expectedRole: string): Record<string, unknown> {
  return validateDatabaseIdentity(result, expectedRole, 'centraldeanime');
}

export function validateStagingIdentity(result: unknown, expectedRole: string): Record<string, unknown> {
  return validateDatabaseIdentity(result, expectedRole, 'centraldeanime_staging');
}

function validateDatabaseIdentity(result: unknown, expectedRole: string, database: string): Record<string, unknown> {
  if (!expectedRole) fail('configuration', 'role', 'Usuario esperado obrigatorio.');
  const rows = record(result, 'identity', 'result').rows;
  if (!Array.isArray(rows) || rows.length !== 1 || rows[0] == null) {
    fail('identity', 'rows[0]', 'Consulta de identidade deve retornar exatamente uma linha.');
  }
  const identity = record(rows[0], 'identity', 'rows[0]');
  const expected: Partial<Record<(typeof identityFields)[number], string | number>> = {
    database, port: 5432,
    transaction_read_only: 'on', default_transaction_read_only: 'on',
  };
  for (const field of identityFields) {
    const value = identity[field];
    if (value == null) fail('identity', field, 'Campo de identidade obrigatorio e nao nulo.');
    if (typeof value !== (field === 'port' ? 'number' : 'string')) {
      fail('conversion', field, field === 'port' ? 'Porta deve ser number.' : 'Campo deve ser string.');
    }
    if (typeof value === 'string' && !value.length) fail('identity', field, 'Campo de identidade nao pode ser vazio.');
    if ((field === 'role' || field === 'session_role') && value !== expectedRole) {
      fail('identity', field, 'Usuario diverge do papel de conexao autorizado.');
    }
    if (field === 'version' && (typeof value !== 'string' || !value.startsWith('PostgreSQL '))) {
      fail('identity', field, 'Versao PostgreSQL invalida.');
    }
    if (field === 'server_version' && (typeof value !== 'string' || !/^\d+(?:\.\d+)*(?:(?:beta|rc)\d+|devel)?(?: \([^)]+\))?$/.test(value))) {
      fail('identity', field, 'Formato de server_version invalido.');
    }
    if (expected[field] !== undefined && value !== expected[field]) {
      fail('identity', field, `Campo deve corresponder a ${expected[field]}.`);
    }
    if (field === 'address' && value !== '127.0.0.1' && value !== '::1') {
      fail('identity', field, 'Endereco deve ser loopback autorizado, sem mascara.');
    }
  }
  return Object.fromEntries(identityFields.map(field => [field, identity[field]]));
}

export const foreignKeyFields = [
  'table_schema', 'table_name', 'constraint_name', 'referenced_schema', 'referenced_table',
  'match_type', 'columns', 'referenced_columns', 'operator_schemas', 'operators',
  'table_kind', 'referenced_kind',
] as const;

export const foreignKeysSql = `SELECT ns.nspname AS table_schema, tab.relname AS table_name,
  fk.conname AS constraint_name, refns.nspname AS referenced_schema,
  ref.relname AS referenced_table, fk.confmatchtype::text AS match_type,
  array_agg(src.attname::text ORDER BY keys.ordinality) AS columns,
  array_agg(dst.attname::text ORDER BY keys.ordinality) AS referenced_columns,
  array_agg(opns.nspname::text ORDER BY keys.ordinality) AS operator_schemas,
  array_agg(op.oprname::text ORDER BY keys.ordinality) AS operators,
  tab.relkind::text AS table_kind, ref.relkind::text AS referenced_kind
  FROM pg_catalog.pg_constraint fk
  JOIN pg_catalog.pg_class tab ON tab.oid = fk.conrelid
  JOIN pg_catalog.pg_namespace ns ON ns.oid = tab.relnamespace
  JOIN pg_catalog.pg_class ref ON ref.oid = fk.confrelid
  JOIN pg_catalog.pg_namespace refns ON refns.oid = ref.relnamespace
  CROSS JOIN LATERAL unnest(fk.conkey, fk.confkey, fk.conpfeqop)
    WITH ORDINALITY AS keys(srcnum, dstnum, opoid, ordinality)
  JOIN pg_catalog.pg_attribute src ON src.attrelid = tab.oid AND src.attnum = keys.srcnum
  JOIN pg_catalog.pg_attribute dst ON dst.attrelid = ref.oid AND dst.attnum = keys.dstnum
  JOIN pg_catalog.pg_operator op ON op.oid = keys.opoid
  JOIN pg_catalog.pg_namespace opns ON opns.oid = op.oprnamespace
  WHERE fk.contype = 'f' AND fk.conparentid = 0
    AND ns.nspname <> 'information_schema' AND ns.nspname !~ '^pg_'
  GROUP BY fk.oid, ns.nspname, tab.relname, fk.conname, refns.nspname, ref.relname,
    fk.confmatchtype, tab.relkind, ref.relkind
  ORDER BY ns.nspname, tab.relname, fk.conname`;

export function quoteIdentifier(value: string): string {
  return '"' + value.replaceAll('"', '""') + '"';
}

export function orphanQuery(value: unknown): { sql: string; table: string; constraint: string } {
  const fk = record(value, 'integrity.metadata', 'constraint');
  const text = (field: string): string => {
    const value = fk[field];
    if (typeof value !== 'string' || !value.length || value.includes('\0')) {
      fail('integrity.metadata', field, 'Identificador PostgreSQL obrigatorio.');
    }
    return value;
  };
  const strings = (field: string): string[] => {
    const value = fk[field];
    if (!Array.isArray(value) || !value.length || !value.every(item => typeof item === 'string' && item.length && !item.includes('\0'))) {
      fail('integrity.metadata', field, 'Lista de identificadores obrigatoria.');
    }
    return value;
  };
  const schema = text('table_schema');
  const table = text('table_name');
  const constraint = text('constraint_name');
  const referencedSchema = text('referenced_schema');
  const referencedTable = text('referenced_table');
  const columns = strings('columns');
  const referenced = strings('referenced_columns');
  const operatorSchemas = strings('operator_schemas');
  const operators = strings('operators');
  if ([referenced, operatorSchemas, operators].some(items => items.length !== columns.length)) {
    fail('integrity.metadata', 'columns', 'Cardinalidade de chave estrangeira divergente.');
  }
  if (!operators.every(operator => /^[+\-*/<>=~!@#%^&|`?]+$/.test(operator) && !operator.includes('--') && !operator.includes('/*'))) {
    fail('integrity.metadata', 'operators', 'Operador PostgreSQL invalido.');
  }
  if (fk.match_type !== 's' && fk.match_type !== 'f') fail('integrity.metadata', 'match_type', 'MATCH nao suportado.');
  for (const field of ['table_kind', 'referenced_kind']) {
    if (fk[field] !== 'r' && fk[field] !== 'p') fail('integrity.metadata', field, 'Tipo de relacao FK nao suportado.');
  }
  // Ordinary inheritance does not propagate FKs; partition roots do.
  const childOnly = fk.table_kind === 'p' ? '' : 'ONLY ';
  const parentOnly = fk.referenced_kind === 'p' ? '' : 'ONLY ';
  const childColumns = columns.map(column => `child.${quoteIdentifier(column)}`);
  const nonnull = childColumns.map(column => `${column} IS NOT NULL`).join(' AND ');
  const missing = `NOT EXISTS (SELECT 1 FROM ${parentOnly}${quoteIdentifier(referencedSchema)}.${quoteIdentifier(referencedTable)} AS parent WHERE ${
    columns.map((column, index) =>
      `parent.${quoteIdentifier(referenced[index])} OPERATOR(${quoteIdentifier(operatorSchemas[index])}.${operators[index]}) child.${quoteIdentifier(column)}`,
    ).join(' AND ')
  })`;
  const partialNull = `(${childColumns.map(column => `${column} IS NULL`).join(' OR ')}) AND (${childColumns.map(column => `${column} IS NOT NULL`).join(' OR ')})`;
  const predicate = fk.match_type === 'f' ? `((${partialNull}) OR ((${nonnull}) AND ${missing}))` : `((${nonnull}) AND ${missing})`;
  return {
    sql: `SELECT count(*)::text AS orphan_count FROM ${childOnly}${quoteIdentifier(schema)}.${quoteIdentifier(table)} AS child WHERE ${predicate}`,
    table: `${schema}.${table}`, constraint,
  };
}

export interface InspectionClient {
  connect(): Promise<unknown>;
  query(config: QueryConfig): Promise<unknown>;
  end(): Promise<void>;
}

function diagnostic(error: unknown, stage: string): InspectionError {
  if (error instanceof InspectionError) return error;
  // Never forward driver messages: they may contain connection credentials.
  return new InspectionError(stage, 'operation', 'INSPECTION_OPERATION_FAILED', `Falha na etapa ${stage}; detalhes externos omitidos.`);
}

export async function runInspection(
  client: InspectionClient,
  driverTypes: CustomTypesConfig,
  address: '127.0.0.1' | '::1',
  log: (message: string) => void,
  expectedRole: string,
): Promise<void> {
  return runControlledInspection(client, driverTypes, address, log, expectedRole, 'local');
}

export async function runStagingInspection(
  client: InspectionClient, driverTypes: CustomTypesConfig,
  log: (message: string) => void, expectedRole: string,
): Promise<void> {
  return runControlledInspection(client, driverTypes, '127.0.0.1', log, expectedRole, 'staging');
}

export type InspectionSelect = (sql: string, fields: readonly string[], stage: string) => Promise<unknown>;

async function runControlledInspection(
  client: InspectionClient, driverTypes: CustomTypesConfig, address: '127.0.0.1' | '::1',
  log: (message: string) => void, expectedRole: string, environment: 'local' | 'staging',
): Promise<void> {
  let connections = 0;
  let statements = 0;
  let stage = 'connection';
  let failure: InspectionError | undefined;
  const originalConnect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args: unknown[]) {
    const options = typeof args[0] === 'object' && args[0] !== null
      ? record(args[0], 'connection', 'destination') : { port: args[0], host: args[1] };
    if (options.host !== address || Number(options.port) !== 5432 || connections !== 0) {
      fail('connection', 'destination', 'Somente uma conexao TCP ao destino autorizado e permitida.');
    }
    connections++;
    return Reflect.apply(originalConnect, this, args);
  };
  async function select(sql: string, fields: readonly string[]): Promise<unknown> {
    if (!/^SELECT\s/i.test(sql.trim()) || sql.includes(';')) fail(stage, 'sql', 'Somente SELECT unico permitido.');
    let column = 0;
    const types: CustomTypesConfig = {
      getTypeParser: (oid, format) => {
        const field = fields[column++] ?? 'column';
        return (value: string) => {
          try {
            return driverTypes.getTypeParser(oid, format)(value);
          } catch {
            throw new InspectionError(`${stage}.conversion`, field, 'INSPECTION_CONVERSION_FAILED', 'Falha ao converter campo PostgreSQL.');
          }
        };
      },
    };
    statements++;
    return client.query({ text: sql, types });
  }
  try {
    if (!expectedRole) fail('configuration', 'role', 'Usuario esperado obrigatorio.');
    await client.connect();
    stage = 'identity.query';
    const result = await select(identitySql, identityFields);
    log('IDENTITY=' + JSON.stringify(environment === 'local'
      ? validateIdentity(result, expectedRole) : validateStagingIdentity(result, expectedRole)));
    if (environment === 'staging') {
      await collectStagingInventory((sql, fields, queryStage) => {
        stage = queryStage;
        return select(sql, fields);
      }, log);
    } else {
      stage = 'tables.query';
      const tablesResult = record(await select(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name`,
        ['table_name'],
      ), stage, 'result');
      if (!Array.isArray(tablesResult.rows)) fail(stage, 'rows', 'Lista de tabelas obrigatoria.');
      const counts: Record<string, string> = Object.create(null);
      for (const row of tablesResult.rows) {
        const table = record(row, 'tables', 'row').table_name;
        if (typeof table !== 'string' || !table.length) fail('tables', 'table_name', 'Nome de tabela obrigatorio.');
        stage = 'counts.query';
        const quoted = '"' + table.replaceAll('"', '""') + '"';
        const countResult = record(await select(`SELECT count(*)::text AS count FROM public.${quoted}`, ['count']), stage, 'result');
        const rows = countResult.rows;
        if (!Array.isArray(rows) || rows.length !== 1) fail('counts', 'rows[0]', 'Contagem deve retornar uma linha.');
        const count = record(rows[0], 'counts', 'rows[0]').count;
        if (typeof count !== 'string' || !/^\d+$/.test(count)) fail('counts', 'count', 'Contagem deve ser texto decimal.');
        counts[table] = count;
      }
      log('TABLE_COUNTS=' + JSON.stringify(counts));
      if (!Object.hasOwn(counts, '_prisma_migrations')) fail('migrations', '_prisma_migrations', 'Historico de migrations ausente.');
      stage = 'migrations.query';
      const migrations = record(await select(
        `SELECT migration_name, started_at, finished_at, rolled_back_at, applied_steps_count FROM public."_prisma_migrations" ORDER BY started_at, migration_name`,
        ['migration_name', 'started_at', 'finished_at', 'rolled_back_at', 'applied_steps_count'],
      ), stage, 'result').rows;
      if (!Array.isArray(migrations)) fail('migrations', 'rows', 'Lista de migrations obrigatoria.');
      log('MIGRATIONS=' + JSON.stringify(migrations));
      log('INVENTORY_COMPARISON=' + JSON.stringify({
        tables: { expected: 24, actual: tablesResult.rows.length },
        migrations: { expected: 12, actual: migrations.length },
        Anime: { expected: '151', actual: counts.Anime },
        Personagem: { expected: '304', actual: counts.Personagem },
        Episodio: { expected: '4172', actual: counts.Episodio },
      }));
      stage = 'integrity.metadata.query';
      const foreignKeys = record(await select(foreignKeysSql, foreignKeyFields), stage, 'result').rows;
      if (!Array.isArray(foreignKeys)) fail('integrity.metadata', 'rows', 'Lista de FKs obrigatoria.');
      const integrity: { table: string; constraint: string; orphanCount: string }[] = [];
      for (const fk of foreignKeys) {
        const query = orphanQuery(fk);
        stage = 'integrity.orphans.query';
        const rows = record(await select(query.sql, ['orphan_count']), stage, 'result').rows;
        if (!Array.isArray(rows) || rows.length !== 1) fail('integrity.orphans', 'rows[0]', 'Contagem de orfaos deve retornar uma linha.');
        const orphanCount = record(rows[0], 'integrity.orphans', 'rows[0]').orphan_count;
        if (typeof orphanCount !== 'string' || !/^\d+$/.test(orphanCount)) fail('integrity.orphans', 'orphan_count', 'Contagem deve ser texto decimal nao negativo.');
        const entry = { table: query.table, constraint: query.constraint, orphanCount };
        integrity.push(entry);
        log('FOREIGN_KEY_INTEGRITY=' + JSON.stringify(entry));
      }
      log('REFERENTIAL_INTEGRITY=' + JSON.stringify({
        constraintsChecked: integrity.length, consistent: integrity.every(entry => BigInt(entry.orphanCount) === 0n),
      }));
    }
  } catch (error) {
    failure = diagnostic(error, stage);
  } finally {
    try {
      await client.end();
    } catch {
      const closeFailure = diagnostic(undefined, 'connection.close');
      log('CONNECTION_CLOSE_FAILED=' + JSON.stringify(closeFailure));
      failure ??= closeFailure;
    } finally {
      net.Socket.prototype.connect = originalConnect;
    }
  }
  if (failure) {
    log('INSPECTION_STOPPED=' + JSON.stringify({
      stage: failure.stage, field: failure.field, code: failure.code,
      message: failure.message, connections, selectStatements: statements,
    }));
    throw failure;
  }
  log('SAFETY=' + JSON.stringify({
    connections, selectStatements: statements, connectionClosed: true,
    serverStarted: false, otherDatabasesAccessed: false, readonlyEnforcedAtConnectionStartup: true,
  }));
}
