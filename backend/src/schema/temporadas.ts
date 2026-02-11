import { pgTable, varchar, serial, text, integer } from 'drizzle-orm/pg-core';
import { animes } from './animes';
import { status } from './status';
import { estacoes } from './estacoes';

export const temporadas = pgTable('temporadas', {
  id: serial('id').primaryKey(),
  anime_id: integer('anime_id').references(() => animes.id),
  slug: varchar('slug', { length: 255 }),
  nome: varchar('nome', { length: 255 }),
  tipo: varchar('tipo', { length: 100 }),
  temporada: integer('temporada'),
  status_id: integer('status_id').references(() => status.id),
  ano: varchar('ano', { length: 4 }),
  estacao_id: integer('estacao_id').references(() => estacoes.id),
  episodios: integer('episodios'),
  sinopse: text('sinopse'),
  capa_url: varchar('capa_url', { length: 255 }).notNull().default('pendente'),
});
