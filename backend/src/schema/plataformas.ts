import { pgTable, varchar, serial } from 'drizzle-orm/pg-core';

export const plataformas = pgTable('plataformas', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull().default('pendente'),
});
