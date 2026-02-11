import { index, integer, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { usuarios } from "./usuario";

export const resetsSenha = pgTable(
  'resets_senha',
  {
    id: serial('id').primaryKey(),
    usuarioId: integer('usuario_id')
      .references(() => usuarios.id)
      .notNull(),

    token: varchar('token', { length: 255 }).notNull(),
    expiraEm: timestamp('expira_em').notNull(),
    usadoEm: timestamp('usado_em'),

    ipSolicitacao: varchar('ip_solicitacao', { length: 45 }),
    userAgent: text('user_agent'),

    criadoEm: timestamp('criado_em').notNull().defaultNow(),
  },
  (t) => ({
    tokenUnico: uniqueIndex('resets_senha_token_unico').on(t.token),
    usuarioIdx: index('resets_senha_usuario_idx').on(t.usuarioId),
  }),
);