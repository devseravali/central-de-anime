import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import net from 'node:net';
import { parseIntoClientConfig } from 'pg-connection-string';
import { resolveEnvironment } from '../../config/environment';
import {
  identityFields, stagingInspectionConfig, validateStagingIdentity, runStagingInspection,
  type InspectionClient, type InspectionSelect,
} from '../../../scripts/controlled-inspection';
import {
  collectStagingInventory, compareSequence, sequencesSql, relationsSql,
} from '../../../scripts/staging-inventory';

const require = createRequire(import.meta.url);
const driverTypes: typeof import('pg').types = require('pg').types;
const values = {
  DATABASE_URL: 'postgresql://offline-role@localhost:5432/centraldeanime_staging',
  DATABASE_URL_UNPOOLED: 'postgresql://offline-role@localhost:5432/centraldeanime_staging',
  JWT_SECRET: 'offline-secret-'.repeat(4), JWT_REFRESH_SECRET: 'offline-refresh-'.repeat(4),
  SESSION_STORE: 'memory', MAIL_MODE: 'disabled', FRONTEND_URL: 'http://localhost:5173',
};
const policy = () => resolveEnvironment('staging', values, {});
const connection = () => parseIntoClientConfig(values.DATABASE_URL);
const identity = () => ({
  database: 'centraldeanime_staging', role: 'offline-role', session_role: 'offline-role',
  address: '127.0.0.1', port: 5432, version: 'PostgreSQL 18.4 offline', server_version: '18.4',
  transaction_read_only: 'on', default_transaction_read_only: 'on',
});
const sequence = () => ({
  sequence_schema: 'catalog', sequence_name: 'Anime_id_seq',
  start_value: '1', increment_by: '1', min_value: '1', max_value: '9223372036854775807',
  cache_size: '1', cycle: false, table_schema: 'catalog', table_name: 'Anime', column_name: 'id',
  column_type: 'int8', table_kind: 'r', can_read_state: true, can_read_column: true,
});
const foreignKey = () => ({
  table_schema: 'catalog', table_name: 'Child', constraint_name: 'composite_fk',
  referenced_schema: 'catalog', referenced_table: 'Parent', match_type: 'f',
  columns: ['tenant', 'parent_id'], referenced_columns: ['tenant', 'id'],
  operator_schemas: ['pg_catalog', 'pg_catalog'], operators: ['=', '='],
  table_kind: 'p', referenced_kind: 'p',
});
const tables = () => [
  { table_schema: 'catalog', table_name: 'Anime', kind: 'r', is_partition: false },
  { table_schema: 'audit', table_name: '_prisma_migrations', kind: 'r', is_partition: false },
  { table_schema: 'catalog', table_name: 'Child', kind: 'p', is_partition: false },
  { table_schema: 'catalog', table_name: 'Parent', kind: 'p', is_partition: false },
  { table_schema: 'catalog', table_name: 'Child_partition', kind: 'r', is_partition: true },
  { table_schema: 'catalog', table_name: 'ViewAnime', kind: 'v', is_partition: false },
  { table_schema: 'catalog', table_name: 'MaterializedAnime', kind: 'm', is_partition: false },
  { table_schema: 'external', table_name: 'Remote', kind: 'f', is_partition: false },
];

function inventorySelect(options: {
  orphanCount?: string; sequences?: Record<string, unknown>[]; relations?: Record<string, unknown>[];
  state?: Record<string, unknown>; extrema?: Record<string, unknown>; failStage?: string;
} = {}) {
  return vi.fn<InspectionSelect>(async (_sql, _fields, stage) => {
    if (stage === options.failStage) throw new Error('private-driver-error');
    const result: Record<string, unknown[]> = {
      'schemas.query': [{ schema_name: 'catalog' }, { schema_name: 'audit' }],
      'relations.query': (options.relations ?? tables()).map(table => ({ has_foreign_descendants: false, ...table })),
      'counts.query': [{ count: '151' }],
      'migrations.query': [{ migration_name: 'restored', applied_steps_count: 1 }],
      'constraints.query': [{ table_schema: 'catalog', constraint_name: 'composite_fk' }],
      'indexes.query': [{ table_schema: 'catalog', index_name: 'anime_pkey' }],
      'integrity.metadata.query': [foreignKey()],
      'integrity.orphans.query': [{ orphan_count: options.orphanCount ?? '0' }],
      'sequences.metadata.query': options.sequences ?? [sequence()],
      'sequences.state.query': [options.state ?? { last_value: '151', is_called: true }],
      'sequences.ids.query': [options.extrema ?? { min_id: '1', max_id: '151' }],
    };
    return { rows: result[stage] ?? [] };
  });
}

describe('Preparacao offline de inspecao staging', () => {
  it('comando independente fixa staging e preserva comando local', () => {
    const scripts = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')).scripts;
    expect(scripts['db:inspect:staging']).toBe('cross-env APP_ENV=staging tsx scripts/inspect-staging.ts');
    expect(scripts['db:inspect:local']).toBe('cross-env APP_ENV=local tsx scripts/inspect-local.ts');
    const entrypoint = readFileSync(new URL('../../../scripts/inspect-staging.ts', import.meta.url), 'utf8');
    expect(entrypoint).toContain('process.argv.slice(2).length');
    expect(entrypoint).toContain('stagingInspectionConfig(policy, connection, [])');
    expect(entrypoint).not.toContain('inspect-local');
  });
  it('configura destino fixo e somente leitura sem construir cliente', () => {
    const config = stagingInspectionConfig(policy(), connection(), []);
    expect(config).toMatchObject({ host: '127.0.0.1', database: 'centraldeanime_staging', port: 5432 });
    expect(config.options).toContain('default_transaction_read_only=on');
    expect(config.options).toContain('row_security=off');
    expect(policy().readOnly).toBe(true);
  });
  it('preparacao nao abre sockets e faltas de URL nao possuem fallback', () => {
    const transport = vi.spyOn(net.Socket.prototype, 'connect');
    try {
      stagingInspectionConfig(policy(), connection(), []);
      expect(() => resolveEnvironment('staging', { ...values, DATABASE_URL: undefined }, {})).toThrow();
      expect(() => resolveEnvironment('staging', { ...values, DATABASE_URL_UNPOOLED: undefined }, {})).toThrow();
      expect(transport).not.toHaveBeenCalled();
    } finally {
      transport.mockRestore();
    }
  });
  it.each(['centraldeanime', 'centraldeanimetest', 'neondb'])('rejeita database %s no driver e nas duas URLs', database => {
    expect(() => stagingInspectionConfig(policy(), { ...connection(), database }, [])).toThrow();
    for (const key of ['application', 'direct'] as const) {
      const selected = policy();
      expect(() => stagingInspectionConfig({
        ...selected, urls: { ...selected.urls, [key]: { ...selected.urls[key], pathname: `/${database}` } },
      }, connection(), [])).toThrow();
    }
  });
  it.each(['127.0.0.1', '[::1]', '::1', 'ep-example.neon.tech'])('rejeita host alternativo %s', host => {
    const selected = policy();
    for (const key of ['application', 'direct'] as const) {
      expect(() => stagingInspectionConfig({
        ...selected, urls: { ...selected.urls, [key]: { ...selected.urls[key], hostname: host } },
      }, connection(), [])).toThrow();
    }
    expect(() => stagingInspectionConfig(selected, { ...connection(), host }, [])).toThrow();
  });
  it.each(['--url', '--config', '--schema', '--from-url', '--to-url', '--write', 'local'])('rejeita argumento %s', argument => {
    expect(() => stagingInspectionConfig(policy(), connection(), [argument])).toThrow();
  });
  it('rejeita ambiente, porta, escrita e connectionString alternativa', () => {
    expect(() => stagingInspectionConfig({ ...policy(), environment: 'local' }, connection(), [])).toThrow();
    expect(() => stagingInspectionConfig({ ...policy(), readOnly: false }, connection(), [])).toThrow();
    expect(() => stagingInspectionConfig(policy(), { ...connection(), port: 5433 }, [])).toThrow();
    expect(() => stagingInspectionConfig(policy(), { ...connection(), connectionString: values.DATABASE_URL }, [])).toThrow();
  });
  it.each(identityFields)('valida ausencia de %s antes de inventario e fecha cliente', async field => {
    const row: Record<string, unknown> = identity();
    delete row[field];
    const client: InspectionClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      query: vi.fn().mockResolvedValue({ rows: [row] }),
      end: vi.fn().mockResolvedValue(undefined),
    };
    const original = net.Socket.prototype.connect;
    await expect(runStagingInspection(client, driverTypes, vi.fn(), 'offline-role')).rejects.toMatchObject({ field });
    expect(client.query).toHaveBeenCalledOnce();
    expect(client.end).toHaveBeenCalledOnce();
    expect(net.Socket.prototype.connect).toBe(original);
  });
  it.each([
    ['database', 'centraldeanime'], ['role', 'other'], ['session_role', 'other'],
    ['address', '192.0.2.1'], ['port', 5433], ['version', 'invalid'], ['server_version', 'invalid'],
    ['transaction_read_only', 'off'], ['default_transaction_read_only', 'off'],
  ])('rejeita divergencia de %s', (field, value) => {
    expect(() => validateStagingIdentity({ rows: [{ ...identity(), [field]: value }] }, 'offline-role')).toThrow();
  });
  it('coleta schemas, views, contagens e migrations fora de public', async () => {
    const select = inventorySelect();
    const log = vi.fn();
    await collectStagingInventory(select, log);
    expect(relationsSql).toContain("ns.nspname !~ '^pg_'");
    expect(select.mock.calls.some(([sql]) => sql.includes('FROM "catalog"."Anime"'))).toBe(true);
    expect(select.mock.calls.some(([sql]) => sql.includes('FROM "audit"."_prisma_migrations"'))).toBe(true);
    expect(select.mock.calls.some(([sql]) => /FROM.*"(ViewAnime|MaterializedAnime|Remote)"/.test(sql))).toBe(false);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('VIEWS='));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('CONSTRAINTS='));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('INDEXES='));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('UNVERIFIED_RELATIONS='));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('STAGING_INVENTORY_COMPLETE='));
  });
  it.each(['0', '2'])('reporta FKs compostas com orfaos=%s', async orphanCount => {
    const select = inventorySelect({ orphanCount });
    const log = vi.fn();
    await collectStagingInventory(select, log);
    const fkSql = select.mock.calls.find(([, , stage]) => stage === 'integrity.metadata.query')![0];
    expect(fkSql).not.toContain('fk.conparentid = 0');
    const orphanSql = select.mock.calls.find(([, , stage]) => stage === 'integrity.orphans.query')![0];
    expect(orphanSql).toContain('child."tenant" IS NULL');
    expect(orphanSql).toContain('parent."id" OPERATOR("pg_catalog".=) child."parent_id"');
    expect(log).toHaveBeenCalledWith(expect.stringContaining(`"consistent":${orphanCount === '0'}`));
  });
  it('le sequencias e IDs somente com SELECT, sem avancar estado', async () => {
    const select = inventorySelect();
    const log = vi.fn();
    await collectStagingInventory(select, log);
    expect(sequencesSql).toContain('pg_catalog.pg_sequence');
    expect(sequencesSql).toContain("dep.deptype IN ('a', 'i')");
    expect(select.mock.calls).toContainEqual([
      'SELECT last_value::text AS last_value, is_called FROM "catalog"."Anime_id_seq"',
      ['last_value', 'is_called'], 'sequences.state.query',
    ]);
    expect(select.mock.calls.some(([sql]) => sql.includes('min("id")::text AS min_id'))).toBe(true);
    for (const [sql] of select.mock.calls) {
      expect(sql.trim()).toMatch(/^SELECT /);
      expect(sql).not.toMatch(/\b(nextval|setval|INSERT|UPDATE|DELETE|TRUNCATE|ALTER|CREATE|DROP)\b/i);
    }
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"futureAllocationVerified":false'));
  });
  it('nao consulta raizes com descendentes estrangeiros nem a sequencia associada por IDs', async () => {
    const select = inventorySelect({ relations: tables().map(table => ({
      ...table, has_foreign_descendants: table.table_name === 'Child' || table.table_name === 'Anime',
    })) });
    const log = vi.fn();
    await collectStagingInventory(select, log);
    expect(select.mock.calls.some(([, , stage]) => stage === 'integrity.orphans.query')).toBe(false);
    expect(select.mock.calls.some(([, , stage]) => stage === 'sequences.ids.query')).toBe(false);
    expect(select.mock.calls.some(([sql, , stage]) => stage === 'counts.query' && /"(Child|Anime)"/.test(sql))).toBe(false);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"constraintsNotVerified":1'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"consistent":null'));
  });
  it.each([
    { can_read_state: false }, { table_name: null, column_name: null },
    { column_type: 'uuid' }, { can_read_column: false }, { table_kind: 'f' },
  ])('marca informacao indisponivel como nao verificada', async patch => {
    const select = inventorySelect({ sequences: [{ ...sequence(), ...patch }] });
    const log = vi.fn();
    await collectStagingInventory(select, log);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"status":"not-verified"'));
    expect(select.mock.calls.some(([, , stage]) => stage === 'sequences.ids.query')).toBe(false);
    if ('can_read_state' in patch) expect(select.mock.calls.some(([, , stage]) => stage === 'sequences.state.query')).toBe(false);
  });
  it.each([
    ['150', true, true, true], ['151', true, false, false], ['151', false, false, true],
  ] as const)('compara ultimo valor=%s sem alegar proximo ID garantido', (last, called, behind, overlap) => {
    expect(compareSequence(sequence(), { last_value: last, is_called: called }, { min_id: '1', max_id: '151' }))
      .toMatchObject({ lastValueBehindExistingIds: behind, candidateOverlapsIdRange: overlap, futureAllocationVerified: false });
  });
  it('compara sequencia decrescente, IDs grandes e tabela vazia', () => {
    expect(compareSequence({ ...sequence(), increment_by: '-1' }, { last_value: '12', is_called: true },
      { min_id: '10', max_id: '20' })).toMatchObject({ lastValueBehindExistingIds: true, uncachedCandidate: '11' });
    expect(compareSequence(sequence(), { last_value: '9007199254740993', is_called: true },
      { min_id: '1', max_id: '9007199254740993' }).uncachedCandidate).toBe('9007199254740994');
    expect(compareSequence(sequence(), { last_value: '1', is_called: false },
      { min_id: null, max_id: null }).candidateOverlapsIdRange).toBe(false);
  });
  it('reporta falta de migrations sem inventar historico', async () => {
    const select = inventorySelect({ relations: tables().filter(table => table.table_name !== '_prisma_migrations') });
    const log = vi.fn();
    await collectStagingInventory(select, log);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('MIGRATIONS={"status":"not-verified"'));
    expect(select.mock.calls.some(([, , stage]) => stage === 'migrations.query')).toBe(false);
  });
  it('escapa nomes de sequencias, tabelas e colunas em schemas nao public', async () => {
    const select = inventorySelect({ sequences: [{ ...sequence(), sequence_name: 'seq"name', table_name: 'Anime"table', column_name: 'id"value' }] });
    await collectStagingInventory(select, vi.fn());
    expect(select.mock.calls.some(([sql]) => sql.includes('"catalog"."seq""name"'))).toBe(true);
    expect(select.mock.calls.some(([sql]) => sql.includes('min("id""value")') && sql.includes('"Anime""table"'))).toBe(true);
  });
  it('encerra em estado de sequencia invalido', async () => {
    await expect(collectStagingInventory(inventorySelect({ state: { last_value: null, is_called: true } }), vi.fn()))
      .rejects.toMatchObject({ stage: 'sequences.state', field: 'last_value' });
  });
  it('bloqueia segunda conexao com transporte inteiramente simulado', async () => {
    const transport = vi.spyOn(net.Socket.prototype, 'connect').mockImplementation(function (this: net.Socket) { return this; });
    try {
      const client: InspectionClient = {
        connect: vi.fn(async () => {
          new net.Socket().connect(5432, '127.0.0.1');
          new net.Socket().connect(5432, '127.0.0.1');
        }),
        query: vi.fn().mockResolvedValue({ rows: [] }),
        end: vi.fn().mockResolvedValue(undefined),
      };
      await expect(runStagingInspection(client, driverTypes, vi.fn(), 'offline-role')).rejects.toMatchObject({
        stage: 'connection', field: 'destination',
      });
      expect(transport).toHaveBeenCalledOnce();
      expect(client.query).not.toHaveBeenCalled();
      expect(client.end).toHaveBeenCalledOnce();
    } finally {
      transport.mockRestore();
    }
  });
  it.each(['relations.query', 'integrity.orphans.query', 'sequences.state.query', 'sequences.ids.query'])('fecha cliente em falha de %s sem expor erro externo', async failStage => {
    const select = inventorySelect({ failStage });
    let identityPending = true;
    const client: InspectionClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      query: vi.fn(async config => {
        if (identityPending) { identityPending = false; return { rows: [identity()] }; }
        // The SQL determines the simulated stage; no real driver client is constructed.
        const stage = config.text.includes('last_value::text') ? 'sequences.state.query'
          : config.text.includes('min("id")') ? 'sequences.ids.query'
          : config.text.includes('AS orphan_count') ? 'integrity.orphans.query'
          : config.text === relationsSql ? 'relations.query'
          : config.text.includes('pg_catalog.pg_namespace ns') && config.text.includes('AS schema_name') ? 'schemas.query'
          : config.text === sequencesSql ? 'sequences.metadata.query'
          : config.text.includes('pg_catalog.pg_constraint fk') ? 'integrity.metadata.query'
          : config.text.includes('pg_catalog.pg_constraint con') ? 'constraints.query'
          : config.text.includes('pg_catalog.pg_index') ? 'indexes.query'
          : config.text.includes('migration_name, started_at') ? 'migrations.query' : 'counts.query';
        return select(config.text, [], stage);
      }),
      end: vi.fn().mockResolvedValue(undefined),
    };
    const log = vi.fn();
    await expect(runStagingInspection(client, driverTypes, log, 'offline-role')).rejects.toMatchObject({ stage: failStage });
    expect(client.end).toHaveBeenCalledOnce();
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-driver-error');
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining('STAGING_INVENTORY_COMPLETE='));
  });
});
