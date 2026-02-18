import { pgTable, varchar, serial, integer, index } from 'drizzle-orm/pg-core';
import { estudios } from './estudios';

export const animes = pgTable(
  'animes',
  {
    id: serial('id').primaryKey(),
    anime_id: integer('anime_id').notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    titulo: varchar('titulo', { length: 255 }).notNull(),
    estudio_id: integer('estudio_id')
      .references(() => estudios.id, { onDelete: 'restrict' })
      .notNull(),
    tipo: varchar('tipo', { length: 32 }).notNull(),
    temporada: integer('temporada'),
    status_id: integer('status_id'),
    ano: integer('ano'),
    estacao_id: integer('estacao_id'),
    episodios: integer('episodios'),
    sinopse: varchar('sinopse', { length: 2048 }),
    capaUrl: varchar('capaUrl', { length: 255 }),
  },
  (t) => ({
    estudioIdx: index('animes_estudio_idx').on(t.estudio_id),
    animeIdIdx: index('animes_anime_id_idx').on(t.anime_id),
    statusIdx: index('animes_status_idx').on(t.status_id),
    estacaoIdx: index('animes_estacao_idx').on(t.estacao_id),
  }),
);
