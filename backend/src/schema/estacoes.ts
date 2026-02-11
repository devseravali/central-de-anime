import { pgTable, varchar, serial, uniqueIndex } from 'drizzle-orm/pg-core';

export const estacoes = pgTable(
  'estacoes',
  {
    id: serial('id').primaryKey(),

    nome: varchar('nome', { length: 100 }).notNull(),

    slug: varchar('slug', { length: 100 }).notNull(),
  },
  (t) => ({
    slugUnico: uniqueIndex('estacoes_slug_unico').on(t.slug),
  }),
);