import { describe, expect, it, vi } from 'vitest';
import { createRequire } from 'node:module';
import net from 'node:net';
import { parseIntoClientConfig } from 'pg-connection-string';
import {
  identityFields, identitySql, InspectionError, inspectionConfig,
  normalizeLocalHost, runInspection as executeInspection, validateIdentity as checkIdentity,
  foreignKeysSql, orphanQuery, type InspectionClient,
} from '../../../scripts/controlled-inspection';
import { resolveEnvironment } from '../../config/environment';

const require = createRequire(import.meta.url);
const driverTypes: typeof import('pg').types = require('pg').types;
const validateIdentity = (result: unknown) => checkIdentity(result, 'offline-role');
const runInspection = (
  client: InspectionClient, types: Parameters<typeof executeInspection>[1],
  address: Parameters<typeof executeInspection>[2], log: Parameters<typeof executeInspection>[3],
) => executeInspection(client, types, address, log, 'offline-role');
const identity = () => ({
  database: 'centraldeanime', role: 'offline-role', session_role: 'offline-role', address: '127.0.0.1', port: 5432,
  version: 'PostgreSQL 18.0 offline', server_version: '18.0',
  transaction_read_only: 'on', default_transaction_read_only: 'on',
});
const policy = (host = 'localhost') => resolveEnvironment('local', {
  DATABASE_URL: `postgresql://${host}:5432/centraldeanime`,
  DATABASE_URL_UNPOOLED: `postgresql://${host}:5432/centraldeanime`,
  JWT_SECRET: 'offline-secret-'.repeat(4), JWT_REFRESH_SECRET: 'offline-refresh-'.repeat(4),
  SESSION_STORE: 'memory', MAIL_MODE: 'disabled', FRONTEND_URL: 'http://localhost:5173',
}, {});
const client = (): InspectionClient => ({
  connect: vi.fn().mockResolvedValue(undefined),
  query: vi.fn().mockResolvedValue({ rows: [identity()] }),
  end: vi.fn().mockResolvedValue(undefined),
});

describe('Inspecao controlada offline', () => {
  it('usa host() sem cast inet para text', () => {
    expect(identitySql).toContain('host(inet_server_addr()) AS address');
    expect(identitySql).not.toContain('inet_server_addr()::text');
  });
  it.each(['127.0.0.1', '::1'])('aceita resposta sem mascara %s', address => {
    expect(validateIdentity({ rows: [{ ...identity(), address }] }).address).toBe(address);
  });
  it.each(['18.0', '16.4 (Debian 16.4-1)', '19beta1', '19rc1', '19devel'])('aceita server_version valido %s', server_version => {
    expect(validateIdentity({ rows: [{ ...identity(), server_version }] }).server_version).toBe(server_version);
  });
  it.each(['127.0.0.1/32', '::1/128', '[::1]', 'localhost', '192.0.2.1'])('rejeita resposta original ou nao autorizada %s', address => {
    expect(() => validateIdentity({ rows: [{ ...identity(), address }] })).toThrow(expect.objectContaining({ stage: 'identity', field: 'address' }));
  });
  it.each([
    ['localhost', '127.0.0.1'], ['127.0.0.1', '127.0.0.1'], ['[::1]', '::1'], ['::1', '::1'],
  ])('normaliza host %s', (host, expected) => {
    expect(normalizeLocalHost(host)).toBe(expected);
  });
  it.each([null, undefined, '', 'remote.example', '127.0.0.2', '[::2]', '::ffff:127.0.0.1'])('rejeita host invalido', host => {
    expect(() => normalizeLocalHost(host)).toThrow(expect.objectContaining({ field: 'host' }));
  });
  it('restringe URLs a localhost e preserva seguranca de inicializacao', () => {
    const connection = parseIntoClientConfig('postgresql://offline-role@localhost:5432/centraldeanime');
    const config = inspectionConfig(policy(), connection, []);
    expect(config).toMatchObject({ host: '127.0.0.1', database: 'centraldeanime', port: 5432 });
    expect(config.options).toBe('-c default_transaction_read_only=on -c statement_timeout=10000 -c row_security=off');
    expect(() => inspectionConfig(policy('[::1]'), connection, [])).toThrow(expect.objectContaining({ field: 'host' }));
    expect(() => inspectionConfig(policy('127.0.0.1'), connection, [])).toThrow(expect.objectContaining({ field: 'host' }));
    expect(() => inspectionConfig(policy(), { ...connection, user: undefined }, [])).toThrow(expect.objectContaining({ field: 'role' }));
  });
  it.each([
    { host: 'remote.example', database: 'centraldeanime', port: 5432 },
    { host: 'localhost', database: 'other', port: 5432 },
    { host: 'localhost', database: 'centraldeanime', port: 5433 },
    { host: 'localhost', database: 'centraldeanime', port: 0 },
    { host: 'localhost', database: 'centraldeanime', port: NaN },
    { host: '::1', database: 'centraldeanime', port: 5432 },
  ])('rejeita destino do driver divergente', connection => {
    expect(() => inspectionConfig(policy(), connection, [])).toThrow(InspectionError);
  });
  it('rejeita argumentos e ambiente nao local', () => {
    const connection = { host: 'localhost', database: 'centraldeanime', port: 5432 };
    expect(() => inspectionConfig(policy(), connection, ['--url'])).toThrow(expect.objectContaining({ field: 'arguments' }));
    expect(() => inspectionConfig({ ...policy(), environment: 'staging' }, connection, [])).toThrow(expect.objectContaining({ field: 'environment' }));
  });
  it.each(identityFields)('rejeita null individual em %s', field => {
    expect(() => validateIdentity({ rows: [{ ...identity(), [field]: null }] })).toThrow(expect.objectContaining({ stage: 'identity', field }));
  });
  it.each(identityFields)('identifica tipo incorreto em %s', field => {
    expect(() => validateIdentity({ rows: [{ ...identity(), [field]: field === 'port' ? '5432' : 1 }] })).toThrow(expect.objectContaining({ stage: 'conversion', field }));
  });
  it.each([
    ['database', 'other'], ['port', 5433], ['address', '192.0.2.1'],
    ['transaction_read_only', 'off'], ['default_transaction_read_only', 'off'],
    ['role', ''], ['session_role', ''], ['role', 'other-role'], ['session_role', 'other-role'],
    ['version', ''], ['server_version', ''], ['version', 'invalid'], ['server_version', 'invalid'],
  ])('identifica divergencia individual em %s', (field, value) => {
    expect(() => validateIdentity({ rows: [{ ...identity(), [field]: value }] })).toThrow(expect.objectContaining({ stage: 'identity', field }));
  });
  it.each([{ rows: [] }, { rows: [null] }, { rows: [identity(), identity()] }, {}])('rejeita ausencia ou cardinalidade invalida', result => {
    expect(() => validateIdentity(result)).toThrow(expect.objectContaining({ field: 'rows[0]' }));
  });
  it.each(identityFields)('rejeita ausencia individual em %s', field => {
    const row: Record<string, unknown> = identity();
    delete row[field];
    expect(() => validateIdentity({ rows: [row] })).toThrow(expect.objectContaining({ field }));
  });
  it.each(identityFields)('nao consulta inventario se %s invalido', async field => {
    const fake = client();
    vi.mocked(fake.query).mockResolvedValue({ rows: [{ ...identity(), [field]: null }] });
    await expect(runInspection(fake, driverTypes, '127.0.0.1', vi.fn())).rejects.toMatchObject({ field });
    expect(fake.query).toHaveBeenCalledOnce();
    expect(fake.end).toHaveBeenCalledOnce();
  });
  it('identifica falha de consulta, fecha cliente e nao revela erro externo', async () => {
    const fake = client();
    vi.mocked(fake.query).mockRejectedValue(new Error('postgresql://user:secret@localhost/database'));
    const log = vi.fn();
    const original = net.Socket.prototype.connect;
    await expect(runInspection(fake, driverTypes, '127.0.0.1', log)).rejects.toMatchObject({ stage: 'identity.query', field: 'operation' });
    expect(fake.end).toHaveBeenCalledOnce();
    expect(net.Socket.prototype.connect).toBe(original);
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret');
    expect(fake.query).toHaveBeenCalledOnce();
  });
  it('identifica falha real do parser por campo', async () => {
    const fake = client();
    const log = vi.fn();
    vi.mocked(fake.query).mockImplementation(async config => {
      const parser = config.types!.getTypeParser(25, 'text');
      parser('private-value');
      return { rows: [] };
    });
    const failingTypes = { getTypeParser: () => () => { throw new Error('private-value'); } };
    await expect(runInspection(fake, failingTypes, '127.0.0.1', log)).rejects.toMatchObject({
      stage: 'identity.query.conversion', field: 'database',
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain('private-value');
    expect(fake.end).toHaveBeenCalledOnce();
  });
  it('preserva conversao da porta do driver', () => {
    expect(driverTypes.getTypeParser(23, 'text')('5432')).toBe(5432);
  });
  it('nao avanca para inventario apos divergencia', async () => {
    const fake = client();
    vi.mocked(fake.query).mockResolvedValue({ rows: [{ ...identity(), address: '127.0.0.1/32' }] });
    await expect(runInspection(fake, driverTypes, '127.0.0.1', vi.fn())).rejects.toMatchObject({ field: 'address' });
    expect(fake.query).toHaveBeenCalledOnce();
    expect(fake.end).toHaveBeenCalledOnce();
  });
  it('preserva inventario e encerra no sucesso usando somente mocks', async () => {
    const fake = client();
    vi.mocked(fake.query)
      .mockResolvedValueOnce({ rows: [identity()] })
      .mockResolvedValueOnce({ rows: [{ table_name: '_prisma_migrations' }] })
      .mockResolvedValueOnce({ rows: [{ count: '12' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });
    const log = vi.fn();
    await runInspection(fake, driverTypes, '127.0.0.1', log);
    expect(fake.end).toHaveBeenCalledOnce();
    expect(fake.query).toHaveBeenCalledTimes(5);
    expect(log).toHaveBeenCalledWith(expect.stringContaining('INVENTORY_COMPARISON='));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"session_role":"offline-role"'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('"constraintsChecked":0'));
  });
  it('bloqueia qualquer socket nao autorizado antes do transporte', async () => {
    const fake = client();
    vi.mocked(fake.connect).mockImplementation(async () => {
      new net.Socket().connect(5433, '127.0.0.1');
    });
    await expect(runInspection(fake, driverTypes, '127.0.0.1', vi.fn())).rejects.toMatchObject({ stage: 'connection', field: 'destination' });
    expect(fake.query).not.toHaveBeenCalled();
    expect(fake.end).toHaveBeenCalledOnce();
  });
  it('bloqueia segunda conexao mesmo ao destino autorizado, com transporte simulado', async () => {
    const transport = vi.spyOn(net.Socket.prototype, 'connect').mockImplementation(function (this: net.Socket) { return this; });
    try {
      const fake = client();
      vi.mocked(fake.connect).mockImplementation(async () => {
        new net.Socket().connect(5432, '127.0.0.1');
        new net.Socket().connect(5432, '127.0.0.1');
      });
      await expect(runInspection(fake, driverTypes, '127.0.0.1', vi.fn())).rejects.toMatchObject({ field: 'destination' });
      expect(transport).toHaveBeenCalledOnce();
      expect(fake.query).not.toHaveBeenCalled();
    } finally {
      transport.mockRestore();
    }
  });
  it('registra falha de fechamento sem ocultar divergencia original', async () => {
    const fake = client();
    vi.mocked(fake.query).mockResolvedValue({ rows: [] });
    vi.mocked(fake.end).mockRejectedValue(new Error('secret-close'));
    const log = vi.fn();
    await expect(runInspection(fake, driverTypes, '127.0.0.1', log)).rejects.toMatchObject({ field: 'rows[0]' });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('CONNECTION_CLOSE_FAILED='));
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret-close');
  });

  const foreignKey = () => ({
    table_schema: 'public', table_name: 'Child', constraint_name: 'actual_fk',
    referenced_schema: 'public', referenced_table: 'Parent', match_type: 's',
    columns: ['parent_id'], referenced_columns: ['id'], operator_schemas: ['pg_catalog'], operators: ['='],
    table_kind: 'r', referenced_kind: 'r',
  });
  const inventoryClient = (keys: unknown[]) => {
    const fake = client();
    vi.mocked(fake.query)
      .mockResolvedValueOnce({ rows: [identity()] })
      .mockResolvedValueOnce({ rows: [{ table_name: '_prisma_migrations' }] })
      .mockResolvedValueOnce({ rows: [{ count: '12' }] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: keys });
    return fake;
  };
  it('descobre FKs e operadores pelos catalogos, sem nomes presumidos', () => {
    expect(foreignKeysSql).toContain('pg_catalog.pg_constraint');
    expect(foreignKeysSql).toContain('fk.conpfeqop');
    expect(foreignKeysSql).toContain('WITH ORDINALITY');
    expect(foreignKeysSql).toContain('fk.conparentid = 0');
    expect(foreignKeysSql.trim()).toMatch(/^SELECT /);
  });
  it.each(['0', '3'])('reporta orfaos=%s sem alterar dados', async orphanCount => {
    const fake = inventoryClient([foreignKey()]);
    vi.mocked(fake.query).mockResolvedValueOnce({ rows: [{ orphan_count: orphanCount }] });
    const log = vi.fn();
    await runInspection(fake, driverTypes, '127.0.0.1', log);
    expect(log).toHaveBeenCalledWith('FOREIGN_KEY_INTEGRITY=' + JSON.stringify({
      table: 'public.Child', constraint: 'actual_fk', orphanCount,
    }));
    expect(log).toHaveBeenCalledWith(expect.stringContaining(`"consistent":${orphanCount === '0'}`));
    expect(fake.end).toHaveBeenCalledOnce();
    for (const [config] of vi.mocked(fake.query).mock.calls) {
      expect(config.text.trim()).toMatch(/^SELECT /);
      expect(config.text).not.toMatch(/\b(INSERT|UPDATE|DELETE|TRUNCATE|ALTER|CREATE|DROP|nextval|setval)\b/i);
    }
  });
  it.each(['metadata', 'orphans'])('encerra apos falha de integridade na etapa %s', async step => {
    const fake = inventoryClient([foreignKey()]);
    if (step === 'metadata') {
      vi.mocked(fake.query).mockReset()
        .mockResolvedValueOnce({ rows: [identity()] })
        .mockResolvedValueOnce({ rows: [{ table_name: '_prisma_migrations' }] })
        .mockResolvedValueOnce({ rows: [{ count: '12' }] })
        .mockResolvedValueOnce({ rows: [] });
    }
    vi.mocked(fake.query).mockRejectedValueOnce(new Error('secret-query'));
    const log = vi.fn();
    await expect(runInspection(fake, driverTypes, '127.0.0.1', log)).rejects.toMatchObject({ stage: `integrity.${step}.query` });
    expect(fake.end).toHaveBeenCalledOnce();
    expect(JSON.stringify(log.mock.calls)).not.toContain('secret-query');
    expect(log).not.toHaveBeenCalledWith(expect.stringContaining('SAFETY='));
  });
  it('respeita MATCH SIMPLE e chave composta com operador registrado', () => {
    const query = orphanQuery({
      ...foreignKey(), columns: ['tenant', 'parent_id'], referenced_columns: ['tenant', 'id'],
      operator_schemas: ['pg_catalog', 'pg_catalog'], operators: ['=', '='],
    });
    expect(query.sql).toContain('child."tenant" IS NOT NULL AND child."parent_id" IS NOT NULL');
    expect(query.sql).toContain('parent."tenant" OPERATOR("pg_catalog".=) child."tenant" AND parent."id" OPERATOR("pg_catalog".=) child."parent_id"');
    expect(query.sql).toContain('NOT EXISTS (SELECT 1');
  });
  it('MATCH FULL conta NULL parcial mas nao chave totalmente nula', () => {
    const query = orphanQuery({
      ...foreignKey(), match_type: 'f', columns: ['a', 'b'], referenced_columns: ['a', 'b'],
      operator_schemas: ['pg_catalog', 'pg_catalog'], operators: ['=', '='],
    });
    expect(query.sql).toContain('(child."a" IS NULL OR child."b" IS NULL) AND (child."a" IS NOT NULL OR child."b" IS NOT NULL)');
  });
  it('distingue heranca comum de particionamento em ambos os lados', () => {
    const ordinary = orphanQuery(foreignKey()).sql;
    expect(ordinary).toContain('FROM ONLY "public"."Child"');
    expect(ordinary).toContain('FROM ONLY "public"."Parent"');
    const partitioned = orphanQuery({ ...foreignKey(), table_kind: 'p', referenced_kind: 'p' }).sql;
    expect(partitioned).not.toContain('ONLY');
    expect(partitioned).toContain('FROM "public"."Child"');
    expect(partitioned).toContain('FROM "public"."Parent"');
  });
  it('escapa nomes reais de schemas, tabelas e colunas', () => {
    const query = orphanQuery({ ...foreignKey(), table_name: 'Child"table', columns: ['parent"id'] });
    expect(query.sql).toContain('"Child""table"');
    expect(query.sql).toContain('child."parent""id"');
  });
  it.each([
    { columns: [] }, { referenced_columns: ['a', 'b'] }, { operators: ['=); DROP TABLE x; --'] },
    { match_type: 'p' }, { table_name: null }, { table_kind: 'v' }, { referenced_kind: null },
  ])('rejeita metadados invalidos', patch => {
    expect(() => orphanQuery({ ...foreignKey(), ...patch })).toThrow(expect.objectContaining({ stage: 'integrity.metadata' }));
  });
  it.each([null, '-1', 1])('rejeita contagem de orfaos invalida', async orphan_count => {
    const fake = inventoryClient([foreignKey()]);
    vi.mocked(fake.query).mockResolvedValueOnce({ rows: [{ orphan_count }] });
    await expect(runInspection(fake, driverTypes, '127.0.0.1', vi.fn())).rejects.toMatchObject({ field: 'orphan_count' });
    expect(fake.end).toHaveBeenCalledOnce();
  });
});
