import { index, integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import { usuarios } from './usuario';

export const sessoes = pgTable(
  'sessoes',
  {
    id: serial('id').primaryKey(),
    usuarioId: integer('usuario_id')
      .references(() => usuarios.id)
      .notNull(),

    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }).notNull(),

    dispositivo: varchar('dispositivo', { length: 120 }),
    ip: varchar('ip', { length: 45 }),
    userAgent: text('user_agent'),

    criadoEm: timestamp('criado_em').notNull().defaultNow(),
    expiraEm: timestamp('expira_em').notNull(),
    revogadoEm: timestamp('revogado_em'),
  },
  (t) => ({
    usuarioIdx: index('sessoes_usuario_idx').on(t.usuarioId),
    expiraIdx: index('sessoes_expira_idx').on(t.expiraEm),
  }),
);
