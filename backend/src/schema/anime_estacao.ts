import {
  pgTable,
  serial,
  integer,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { animes } from './animes';
import { estacoes } from './estacoes';

export const anime_estacao = pgTable(
  'anime_estacao',
  {
    id: serial('id').primaryKey(),

    anime_id: integer('anime_id')
      .references(() => animes.id, { onDelete: 'cascade' })
      .notNull(),

    estacao_id: integer('estacao_id')
      .references(() => estacoes.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    unico: uniqueIndex('anime_estacao_unico').on(t.anime_id, t.estacao_id),
    animeIdx: index('anime_estacao_anime_idx').on(t.anime_id),
    estacaoIdx: index('anime_estacao_estacao_idx').on(t.estacao_id),
  }),
);
