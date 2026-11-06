import {
  InspectionError, record, quoteIdentifier, foreignKeysSql, foreignKeyFields, orphanQuery,
  type InspectionSelect,
} from './controlled-inspection';

const schemaFilter = `ns.nspname <> 'information_schema' AND ns.nspname !~ '^pg_'`;

export const schemasSql = `SELECT ns.nspname AS schema_name FROM pg_catalog.pg_namespace ns
  WHERE ${schemaFilter} ORDER BY ns.nspname`;

export const relationsSql = `SELECT ns.nspname AS table_schema, tab.relname AS table_name,
  tab.relkind::text AS kind, tab.relispartition AS is_partition,
  EXISTS (WITH RECURSIVE descendants AS (
    SELECT inhrelid FROM pg_catalog.pg_inherits WHERE inhparent = tab.oid
    UNION SELECT inh.inhrelid FROM pg_catalog.pg_inherits inh
      JOIN descendants d ON inh.inhparent = d.inhrelid
  ) SELECT 1 FROM descendants d JOIN pg_catalog.pg_class child ON child.oid = d.inhrelid
    WHERE child.relkind = 'f') AS has_foreign_descendants
  FROM pg_catalog.pg_class tab JOIN pg_catalog.pg_namespace ns ON ns.oid = tab.relnamespace
  WHERE ${schemaFilter} AND tab.relkind IN ('r', 'p', 'v', 'm', 'f')
  ORDER BY ns.nspname, tab.relname`;

export const constraintsSql = `SELECT ns.nspname AS table_schema, tab.relname AS table_name,
  con.conname AS constraint_name, con.contype::text AS type, con.convalidated AS validated,
  con.conparentid::text AS parent_constraint_oid,
  pg_catalog.pg_get_constraintdef(con.oid, true) AS definition
  FROM pg_catalog.pg_constraint con JOIN pg_catalog.pg_namespace ns ON ns.oid = con.connamespace
  LEFT JOIN pg_catalog.pg_class tab ON tab.oid = con.conrelid
  WHERE ${schemaFilter} ORDER BY ns.nspname, tab.relname, con.conname`;

export const indexesSql = `SELECT ns.nspname AS table_schema, tab.relname AS table_name,
  idx.relname AS index_name, ind.indisvalid AS valid, ind.indisready AS ready,
  ind.indisunique AS unique_index, pg_catalog.pg_get_indexdef(ind.indexrelid) AS definition
  FROM pg_catalog.pg_index ind JOIN pg_catalog.pg_class tab ON tab.oid = ind.indrelid
  JOIN pg_catalog.pg_namespace ns ON ns.oid = tab.relnamespace
  JOIN pg_catalog.pg_class idx ON idx.oid = ind.indexrelid
  WHERE ${schemaFilter} ORDER BY ns.nspname, tab.relname, idx.relname`;

export const sequencesSql = `SELECT ns.nspname AS sequence_schema, seq.relname AS sequence_name,
  meta.seqstart::text AS start_value, meta.seqincrement::text AS increment_by,
  meta.seqmin::text AS min_value, meta.seqmax::text AS max_value,
  meta.seqcache::text AS cache_size, meta.seqcycle AS cycle,
  tabns.nspname AS table_schema, tab.relname AS table_name, attr.attname AS column_name,
  typ.typname AS column_type, tab.relkind::text AS table_kind,
  pg_catalog.has_sequence_privilege(seq.oid, 'SELECT') AS can_read_state,
  CASE WHEN attr.attnum IS NULL THEN false
    ELSE pg_catalog.has_column_privilege(tab.oid, attr.attnum, 'SELECT') END AS can_read_column
  FROM pg_catalog.pg_class seq JOIN pg_catalog.pg_namespace ns ON ns.oid = seq.relnamespace
  JOIN pg_catalog.pg_sequence meta ON meta.seqrelid = seq.oid
  LEFT JOIN pg_catalog.pg_depend dep ON dep.classid = 'pg_catalog.pg_class'::regclass
    AND dep.objid = seq.oid AND dep.objsubid = 0
    AND dep.refclassid = 'pg_catalog.pg_class'::regclass AND dep.deptype IN ('a', 'i')
  LEFT JOIN pg_catalog.pg_class tab ON tab.oid = dep.refobjid
  LEFT JOIN pg_catalog.pg_namespace tabns ON tabns.oid = tab.relnamespace
  LEFT JOIN pg_catalog.pg_attribute attr ON attr.attrelid = tab.oid
    AND attr.attnum = dep.refobjsubid AND NOT attr.attisdropped
  LEFT JOIN pg_catalog.pg_type typ ON typ.oid = attr.atttypid
  WHERE seq.relkind = 'S' AND ${schemaFilter}
  ORDER BY ns.nspname, seq.relname`;

function invalid(stage: string, field: string, message: string): never {
  throw new InspectionError(stage, field, 'INSPECTION_VALIDATION_FAILED', message);
}

function text(row: Record<string, unknown>, field: string, stage: string): string {
  const value = row[field];
  if (typeof value !== 'string' || !value.length || value.includes('\0')) invalid(stage, field, 'Identificador obrigatorio.');
  return value;
}

function rows(result: unknown, stage: string): Record<string, unknown>[] {
  const values = record(result, stage, 'result').rows;
  if (!Array.isArray(values)) invalid(stage, 'rows', 'Lista de resultados obrigatoria.');
  return values.map(value => record(value, stage, 'row'));
}

function integer(value: unknown, stage: string, field: string): bigint {
  if (typeof value !== 'string' || !/^-?\d+$/.test(value)) invalid(stage, field, 'Inteiro decimal em texto obrigatorio.');
  return BigInt(value);
}

function count(result: unknown, stage: string, field: string): string {
  const values = rows(result, stage);
  if (values.length !== 1) invalid(stage, 'rows[0]', 'Contagem deve retornar uma linha.');
  const value = values[0][field];
  if (integer(value, stage, field) < 0n) invalid(stage, field, 'Contagem negativa.');
  return String(value);
}

function qualified(row: Record<string, unknown>, prefix: 'table' | 'sequence', stage: string): string {
  return `${quoteIdentifier(text(row, `${prefix}_schema`, stage))}.${quoteIdentifier(text(row, `${prefix}_name`, stage))}`;
}

export function compareSequence(
  sequence: Record<string, unknown>, state: Record<string, unknown>, extrema: Record<string, unknown>,
): Record<string, unknown> {
  const stage = 'sequences.comparison';
  const last = integer(state.last_value, stage, 'last_value');
  const increment = integer(sequence.increment_by, stage, 'increment_by');
  if (increment === 0n || typeof state.is_called !== 'boolean' || typeof sequence.cycle !== 'boolean') {
    invalid(stage, 'state', 'Estado de sequencia invalido.');
  }
  const min = extrema.min_id === null ? null : integer(extrema.min_id, stage, 'min_id');
  const max = extrema.max_id === null ? null : integer(extrema.max_id, stage, 'max_id');
  if ((min === null) !== (max === null)) invalid(stage, 'extrema', 'Limites de IDs inconsistentes.');
  const candidate = state.is_called ? last + increment : last;
  return {
    status: 'observed-only', minId: extrema.min_id, maxId: extrema.max_id,
    lastValueBehindExistingIds: min === null || max === null ? false : increment > 0n ? last < max : last > min,
    uncachedCandidate: candidate.toString(),
    candidateOverlapsIdRange: min === null || max === null ? false : candidate >= min && candidate <= max,
    futureAllocationVerified: false,
    note: 'Comparacao observacional; cache, ciclo e concorrencia impedem garantir a proxima alocacao.',
  };
}

async function collectSequences(
  select: InspectionSelect, log: (message: string) => void, unsafeTables: Set<string>,
): Promise<void> {
  const sequences = rows(await select(sequencesSql, [
    'sequence_schema', 'sequence_name', 'start_value', 'increment_by', 'min_value', 'max_value',
    'cache_size', 'cycle', 'table_schema', 'table_name', 'column_name', 'column_type', 'table_kind',
    'can_read_state', 'can_read_column',
  ], 'sequences.metadata.query'), 'sequences.metadata');
  for (const sequence of sequences) {
    const name = qualified(sequence, 'sequence', 'sequences.metadata');
    for (const field of ['start_value', 'increment_by', 'min_value', 'max_value', 'cache_size']) {
      integer(sequence[field], 'sequences.metadata', field);
    }
    for (const field of ['cycle', 'can_read_state', 'can_read_column']) {
      if (typeof sequence[field] !== 'boolean') invalid('sequences.metadata', field, 'Booleano obrigatorio.');
    }
    const report: Record<string, unknown> = { metadata: sequence, state: { status: 'not-verified', reason: 'Sem privilegio SELECT na sequencia.' } };
    if (sequence.can_read_state) {
      const states = rows(await select(`SELECT last_value::text AS last_value, is_called FROM ${name}`,
        ['last_value', 'is_called'], 'sequences.state.query'), 'sequences.state');
      if (states.length !== 1) invalid('sequences.state', 'rows[0]', 'Estado deve retornar uma linha.');
      integer(states[0].last_value, 'sequences.state', 'last_value');
      if (typeof states[0].is_called !== 'boolean') invalid('sequences.state', 'is_called', 'Booleano obrigatorio.');
      report.state = states[0];
      if (sequence.table_name === null || sequence.column_name === null) {
        report.comparison = { status: 'not-verified', reason: 'Sem associacao de ownership a tabela/coluna.' };
      } else if (!['int2', 'int4', 'int8'].includes(String(sequence.column_type)) ||
          !['r', 'p'].includes(String(sequence.table_kind)) || !sequence.can_read_column ||
          unsafeTables.has(`${sequence.table_schema}.${sequence.table_name}`)) {
        report.comparison = { status: 'not-verified', reason: 'Associacao sem coluna inteira local legivel.' };
      } else {
        const table = qualified(sequence, 'table', 'sequences.metadata');
        const column = quoteIdentifier(text(sequence, 'column_name', 'sequences.metadata'));
        const extrema = rows(await select(`SELECT min(${column})::text AS min_id, max(${column})::text AS max_id FROM ${table}`,
          ['min_id', 'max_id'], 'sequences.ids.query'), 'sequences.ids');
        if (extrema.length !== 1) invalid('sequences.ids', 'rows[0]', 'Limites de IDs devem retornar uma linha.');
        report.comparison = compareSequence(sequence, states[0], extrema[0]);
      }
    } else {
      report.comparison = { status: 'not-verified', reason: 'Estado da sequencia nao verificado.' };
    }
    log('SEQUENCE=' + JSON.stringify(report));
  }
  log('SEQUENCES_SUMMARY=' + JSON.stringify({ sequencesIdentified: sequences.length }));
}

export async function collectStagingInventory(select: InspectionSelect, log: (message: string) => void): Promise<void> {
  log('SCHEMAS=' + JSON.stringify(rows(await select(schemasSql, ['schema_name'], 'schemas.query'), 'schemas')));
  const relations = rows(await select(relationsSql,
    ['table_schema', 'table_name', 'kind', 'is_partition', 'has_foreign_descendants'], 'relations.query'), 'relations');
  const tables: Record<string, unknown>[] = [];
  const views: Record<string, unknown>[] = [];
  const unverified: Record<string, unknown>[] = [];
  const unsafeTables = new Set<string>();
  for (const relation of relations) {
    text(relation, 'table_schema', 'relations');
    text(relation, 'table_name', 'relations');
    if (typeof relation.has_foreign_descendants !== 'boolean' || typeof relation.is_partition !== 'boolean') {
      invalid('relations', 'partition_metadata', 'Metadados de particao obrigatorios.');
    }
    if (relation.kind === 'r' || relation.kind === 'p') {
      tables.push(relation);
      if (relation.has_foreign_descendants) {
        unsafeTables.add(`${relation.table_schema}.${relation.table_name}`);
        unverified.push({ ...relation, reason: 'Descendentes estrangeiros; contagem nao executada para evitar acesso remoto.' });
      }
    }
    else if (relation.kind === 'v' || relation.kind === 'm') views.push(relation);
    else if (relation.kind === 'f') unverified.push({ ...relation, reason: 'Tabela estrangeira nao consultada para evitar acesso remoto.' });
    else invalid('relations', 'kind', 'Tipo de relacao nao autorizado.');
  }
  log('TABLES=' + JSON.stringify(tables));
  log('VIEWS=' + JSON.stringify(views));
  log('UNVERIFIED_RELATIONS=' + JSON.stringify(unverified));
  const counts: Record<string, string> = Object.create(null);
  for (const table of tables) {
    const name = qualified(table, 'table', 'tables');
    if (unsafeTables.has(`${table.table_schema}.${table.table_name}`)) continue;
    counts[name] = count(await select(`SELECT count(*)::text AS count FROM ${name}`, ['count'], 'counts.query'), 'counts', 'count');
    if (table.table_name === '_prisma_migrations') {
      const migrations = rows(await select(
        `SELECT migration_name, started_at, finished_at, rolled_back_at, applied_steps_count FROM ${name} ORDER BY started_at, migration_name`,
        ['migration_name', 'started_at', 'finished_at', 'rolled_back_at', 'applied_steps_count'], 'migrations.query'), 'migrations');
      log('MIGRATIONS=' + JSON.stringify({ table: name, rows: migrations }));
    }
  }
  log('TABLE_COUNTS=' + JSON.stringify(counts));
  if (!tables.some(table => table.table_name === '_prisma_migrations')) {
    log('MIGRATIONS=' + JSON.stringify({ status: 'not-verified', reason: 'Tabela _prisma_migrations nao encontrada.' }));
  }
  log('CONSTRAINTS=' + JSON.stringify(rows(await select(constraintsSql,
    ['table_schema', 'table_name', 'constraint_name', 'type', 'validated', 'parent_constraint_oid', 'definition'],
    'constraints.query'), 'constraints')));
  log('INDEXES=' + JSON.stringify(rows(await select(indexesSql,
    ['table_schema', 'table_name', 'index_name', 'valid', 'ready', 'unique_index', 'definition'],
    'indexes.query'), 'indexes')));
  const keys = rows(await select(foreignKeysSql.replace(" AND fk.conparentid = 0", ''), foreignKeyFields,
    'integrity.metadata.query'), 'integrity.metadata');
  let consistent = true;
  let constraintsChecked = 0;
  let constraintsNotVerified = 0;
  for (const key of keys) {
    if ((key.table_kind === 'p' && unsafeTables.has(`${key.table_schema}.${key.table_name}`)) ||
        (key.referenced_kind === 'p' && unsafeTables.has(`${key.referenced_schema}.${key.referenced_table}`)) ||
        key.table_kind === 'f' || key.referenced_kind === 'f') {
      constraintsNotVerified++;
      log('FOREIGN_KEY_INTEGRITY=' + JSON.stringify({
        table: `${key.table_schema}.${key.table_name}`, constraint: key.constraint_name,
        status: 'not-verified', reason: 'Relacionamento com tabela estrangeira; leitura remota bloqueada.',
      }));
      continue;
    }
    const query = orphanQuery(key);
    const orphanCount = count(await select(query.sql, ['orphan_count'], 'integrity.orphans.query'), 'integrity.orphans', 'orphan_count');
    consistent = consistent && BigInt(orphanCount) === 0n;
    constraintsChecked++;
    log('FOREIGN_KEY_INTEGRITY=' + JSON.stringify({ table: query.table, constraint: query.constraint, orphanCount }));
  }
  log('REFERENTIAL_INTEGRITY=' + JSON.stringify({
    constraintsChecked, constraintsNotVerified, consistent: constraintsNotVerified ? null : consistent,
    checkedConstraintsConsistent: consistent, partitionConstraintCountsMayOverlap: true,
  }));
  await collectSequences(select, log, unsafeTables);
  log('STAGING_INVENTORY_COMPLETE=' + JSON.stringify({ tables: tables.length, views: views.length, foreignTablesNotVerified: unverified.length }));
}
