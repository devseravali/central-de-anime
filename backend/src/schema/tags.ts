import { pgTable, varchar, serial } from 'drizzle-orm/pg-core';

export const tags = pgTable('tags', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull().default('pendente'),
});
