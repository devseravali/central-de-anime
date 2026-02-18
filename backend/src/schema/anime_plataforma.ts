import { pgTable, serial, integer } from 'drizzle-orm/pg-core';
import { animes } from './animes';
import { plataformas } from './plataformas';

export const anime_plataforma = pgTable('anime_plataforma', {
  id: serial('id').primaryKey(),
  anime_id: integer('anime_id').references(() => animes.id),
  plataforma_id: integer('plataforma_id').references(() => plataformas.id),
});
