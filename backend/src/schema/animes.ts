import { pgTable, varchar, serial, integer, index } from 'drizzle-orm/pg-core';
import { estudios } from './estudios';

export const animes = pgTable(
  'animes',
  {
    id: serial('id').primaryKey(),

    anime_id: serial('anime_id').notNull().unique(),

    nome: varchar('nome', { length: 255 }).notNull(),

    titulo_portugues: varchar('titulo_portugues', { length: 255 })
      .notNull()
      .default(''),

    titulo_ingles: varchar('titulo_ingles', { length: 255 })
      .notNull()
      .default(''),

    titulo_japones: varchar('titulo_japones', { length: 255 })
      .notNull()
      .default(''),

    estudio_id: integer('estudio_id')
      .references(() => estudios.id, { onDelete: 'restrict' })
      .notNull(),
  },
  (t) => ({
    estudioIdx: index('animes_estudio_idx').on(t.estudio_id),
    animeIdIdx: index('animes_anime_id_idx').on(t.anime_id),
  }),
);