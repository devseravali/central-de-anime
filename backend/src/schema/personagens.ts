import { pgTable, varchar, serial, text } from 'drizzle-orm/pg-core';

export const personagens = pgTable('personagens', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 255 }).notNull(),
  idade_inicial: varchar('idade_inicial', { length: 50 }),
  sexo: varchar('sexo', { length: 20 }),
  papel: varchar('papel', { length: 100 }),
  imagem: varchar('imagem', { length: 255 }),
  aniversario: varchar('aniversario', { length: 50 }),
  altura_inicial: varchar('altura_inicial', { length: 50 }),
  afiliacao: varchar('afiliacao', { length: 100 }),
  sobre: text('sobre').notNull().default('pendente'),
});
