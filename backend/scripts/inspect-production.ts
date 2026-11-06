import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { MigrationRow } from '../src/config/productionAdmin';
import { assertCleanInvocation, openReadOnlyClient, safeMessage } from './prod-admin-common';

// Inspecao somente leitura: sessao read-only, consultas fixas, sem parametros externos.
const COUNT_QUERY = `select
  (select count(*) from "Anime") as anime, (select count(*) from "Personagem") as personagem,
  (select count(*) from "Episodio") as episodio, (select count(*) from "Genero") as genero,
  (select count(*) from "Estudio") as estudio, (select count(*) from "Plataforma") as plataforma,
  (select count(*) from "Franquia") as franquia, (select count(*) from "Status") as status,
  (select count(*) from "AnimeTag") as anime_tag, (select count(*) from "Capas") as capas,
  (select count(*) from "Usuario") as usuario`;

try {
  assertCleanInvocation();
  if (process.env.APP_ENV !== 'production') throw new Error('Inspecao exige APP_ENV=production.');
  const { client } = await openReadOnlyClient('DATABASE_URL_UNPOOLED');
  try {
    const migrations = await client.query<MigrationRow>(
      'select migration_name, finished_at, rolled_back_at from _prisma_migrations order by migration_name',
    );
    const counts = await client.query(COUNT_QUERY);
    const schema = await client.query(
      `select
        exists(select 1 from information_schema.tables where table_schema = 'public' and table_name = 'Estacao') as estacao_table,
        exists(select 1 from information_schema.columns where table_schema = 'public' and table_name = 'Anime' and column_name = 'estacaoId') as anime_estacao_id`,
    );
    const local = readdirSync(resolve(import.meta.dirname, '..', 'prisma', 'migrations'), { withFileTypes: true })
      .filter(entry => entry.isDirectory()).map(entry => entry.name).sort();
    const applied = new Set(migrations.rows.filter(row => row.finished_at != null).map(row => row.migration_name));
    console.log(JSON.stringify({
      database: 'neondb', readOnly: true,
      appliedMigrations: [...applied], pendingMigrations: local.filter(name => !applied.has(name)),
      counts: counts.rows[0], schema: schema.rows[0],
    }, (_key, value) => (typeof value === 'bigint' ? Number(value) : value), 2));
  } finally {
    await client.end();
  }
} catch (error) {
  console.error(JSON.stringify({ result: 'falhou', message: safeMessage(error) }));
  process.exitCode = 1;
}
