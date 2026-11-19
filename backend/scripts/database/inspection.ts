import type pg from 'pg';

const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;

export async function inspectSchema(client: Pick<pg.Client, 'query'>) {
  const { rows: tables } = await client.query<{ table_name: string }>(
    "select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name",
  );
  const counts: Record<string, string> = {};
  for (const { table_name } of tables) {
    const { rows } = await client.query<{ count: string }>(`select count(*)::text as count from public.${quote(table_name)}`);
    counts[table_name] = rows[0].count;
  }
  const { rows: foreignKeys } = await client.query<{
    name: string; table_name: string; referenced_table: string;
    columns: string[]; referenced_columns: string[]; validated: boolean;
  }>(`select c.conname as name, t.relname as table_name, r.relname as referenced_table,
      c.convalidated as validated,
      array(select a.attname from unnest(c.conkey) with ordinality k(n,pos)
        join pg_attribute a on a.attrelid=c.conrelid and a.attnum=k.n order by k.pos) as columns,
      array(select a.attname from unnest(c.confkey) with ordinality k(n,pos)
        join pg_attribute a on a.attrelid=c.confrelid and a.attnum=k.n order by k.pos) as referenced_columns
    from pg_constraint c join pg_class t on t.oid=c.conrelid join pg_class r on r.oid=c.confrelid
    join pg_namespace n on n.oid=t.relnamespace join pg_namespace rn on rn.oid=r.relnamespace
    where c.contype='f' and n.nspname='public' and rn.nspname='public' order by c.conname`);
  const integrity = [];
  for (const fk of foreignKeys) {
    const present = fk.columns.map(column => `s.${quote(column)} is not null`).join(' and ');
    const match = fk.columns.map((column, i) => `s.${quote(column)}=r.${quote(fk.referenced_columns[i])}`).join(' and ');
    const { rows } = await client.query<{ count: string }>(
      `select count(*)::text as count from public.${quote(fk.table_name)} s where ${present}
       and not exists(select 1 from public.${quote(fk.referenced_table)} r where ${match})`,
    );
    integrity.push({ ...fk, constraint: fk.name, orphans: rows[0].count });
  }
  const { rows: objects } = await client.query<{
    table_name: string; column_name: string; data_type: string; is_nullable: string; column_default: string | null;
  }>(
    `select table_name,column_name,data_type,is_nullable,column_default
     from information_schema.columns where table_schema='public'
     and (table_name='Estacao' or (table_name='Anime' and column_name='estacaoId'))
     order by table_name,ordinal_position`,
  );
  const { rows: indexes } = await client.query<{ tablename: string; indexname: string; indexdef: string }>(
    "select tablename,indexname,indexdef from pg_indexes where schemaname='public' order by tablename,indexname",
  );
  const { rows: policies } = await client.query(
    `select relname as table_name,relrowsecurity as rls_enabled,relforcerowsecurity as rls_forced
     from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='public' and relkind='r'`,
  );
  const column = (table: string, name: string) => objects.find(row => row.table_name === table && row.column_name === name);
  const id = column('Estacao', 'id');
  const name = column('Estacao', 'nome');
  const reference = column('Anime', 'estacaoId');
  const absent = !tables.some(row => row.table_name === 'Estacao') && !reference;
  const expected = id?.data_type === 'integer' && id.is_nullable === 'NO' && Boolean(id.column_default?.startsWith('nextval(')) &&
    name?.data_type === 'text' && name.is_nullable === 'NO' &&
    reference?.data_type === 'integer' && reference.is_nullable === 'YES' &&
    indexes.some(index => index.indexname === 'Estacao_nome_key' && /UNIQUE/.test(index.indexdef)) &&
    indexes.some(index => index.indexname === 'Estacao_pkey' && /UNIQUE/.test(index.indexdef)) &&
    foreignKeys.some(fk => fk.name === 'Anime_estacaoId_fkey' && fk.table_name === 'Anime' &&
      fk.referenced_table === 'Estacao' && fk.validated && fk.columns.join() === 'estacaoId' && fk.referenced_columns.join() === 'id');
  return { counts, integrity, estacaoObjects: objects,
    estacaoAssessment: absent ? 'ausente: comparar com migrations pendentes' : expected ? 'estrutura basica esperada presente; revisar definicoes completas' : 'divergencia: bloquear escrita',
    indexes, policies,
    visibility: 'Contagens refletem a role conectada e suas politicas RLS; nao comprovam visibilidade global.' };
}
