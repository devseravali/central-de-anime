import { pgTable, varchar, serial } from 'drizzle-orm/pg-core';

export const generos = pgTable('generos', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).unique().notNull(),
});
