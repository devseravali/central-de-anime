import {
  pgTable,
  varchar,
  serial,
  text,
  integer,
  timestamp,
} from 'drizzle-orm/pg-core';

export const capas = pgTable('capas', {
  id: serial('id').primaryKey(),
  nome_original: varchar('nome_original', { length: 255 }).notNull(),
  nome_salvo: varchar('nome_salvo', { length: 255 }).notNull(),
  caminho: varchar('caminho', { length: 255 }).notNull(),
  mimetype: varchar('mimetype', { length: 100 }).notNull(),
  tamanho: integer('tamanho').notNull(),
  usuario_id: integer('usuario_id'),
  data_upload: timestamp('data_upload', { withTimezone: true }).notNull(),
});
