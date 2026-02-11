import {
  index,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { usuarios } from './usuario';

export const sancoesEnum = pgEnum('sancao_tipo', ['suspensao', 'banimento']);

export const sancoesUsuarios = pgTable(
  'sancoes_usuarios',
  {
    id: serial('id').primaryKey(),
    usuarioId: integer('usuario_id')
      .references(() => usuarios.id)
      .notNull(),

    tipo: sancoesEnum('tipo').notNull(),
    motivo: varchar('motivo', { length: 255 }).notNull(),

    expiraEm: timestamp('expira_em'),

    aplicadoPorUsuarioId: integer('aplicado_por_usuario_id').references(
      () => usuarios.id,
    ),

    criadoEm: timestamp('criado_em').notNull().defaultNow(),
    revogadoEm: timestamp('revogado_em'),
    revogadoPorUsuarioId: integer('revogado_por_usuario_id').references(
      () => usuarios.id,
    ),
  },
  (t) => ({
    usuarioIdx: index('sancoes_usuarios_usuario_idx').on(t.usuarioId),
    tipoIdx: index('sancoes_usuarios_tipo_idx').on(t.tipo),
  }),
);
