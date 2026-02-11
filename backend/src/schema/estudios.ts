import { pgTable, varchar, serial } from 'drizzle-orm/pg-core';

export const estudios = pgTable('estudios', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }),
  principaisObras: varchar('principais_obras', { length: 1000 })
    .notNull()
    .default('pendente'),
});
