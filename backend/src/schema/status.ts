import { pgTable, varchar, serial } from 'drizzle-orm/pg-core';

export const status = pgTable('status', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 100 }).notNull().default('pendente'),
});
