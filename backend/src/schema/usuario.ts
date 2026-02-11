import {
  pgTable,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  integer,
  pgEnum,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

export const usuarioStatusEnum = pgEnum('usuario_status', [
  'ativo',
  'pendente',
  'suspenso',
  'banido',
]);

export const usuarios = pgTable(
  'usuarios',
  {
    id: serial('id').primaryKey(),

    nome: varchar('nome', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),

    senhaHash: varchar('senha_hash', { length: 255 }).notNull(),

    status: usuarioStatusEnum('status').notNull().default('pendente'),
    emailVerificado: boolean('email_verificado').notNull().default(false),

    username: varchar('username', { length: 40 }), // opcional, mas ótimo pra produto
    avatarUrl: text('avatar_url'),
    bio: varchar('bio', { length: 160 }),

    criadoEm: timestamp('criado_em').notNull().defaultNow(),
    atualizadoEm: timestamp('atualizado_em').notNull().defaultNow(),
  },
  (t) => ({
    emailUnico: uniqueIndex('usuarios_email_unico').on(t.email),
    usernameUnico: uniqueIndex('usuarios_username_unico').on(t.username),
    statusIdx: index('usuarios_status_idx').on(t.status),
  }),
);

export const sessoesUsuario = pgTable(
  'sessoes_usuario',
  {
    id: serial('id').primaryKey(),
    usuarioId: integer('usuario_id')
      .references(() => usuarios.id)
      .notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expiraEm: timestamp('expira_em').notNull(),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
  },
  (t) => ({
    tokenUnico: uniqueIndex('sessoes_usuario_token_unico').on(t.token),
    usuarioIdx: index('sessoes_usuario_usuario_idx').on(t.usuarioId),
  }),
);

export const verificacoesEmail = pgTable(
  'verificacoes_email',
  {
    id: serial('id').primaryKey(),
    usuarioId: integer('usuario_id')
      .references(() => usuarios.id)
      .notNull(),

    token: varchar('token', { length: 255 }).notNull(),
    expiraEm: timestamp('expira_em').notNull(),
    usadoEm: timestamp('usado_em'),

    criadoEm: timestamp('criado_em').notNull().defaultNow(),
  },
  (t) => ({
    tokenUnico: uniqueIndex('verificacoes_email_token_unico').on(t.token),
    usuarioIdx: index('verificacoes_email_usuario_idx').on(t.usuarioId),
  }),
);