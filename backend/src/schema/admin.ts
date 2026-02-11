import {
  index,
  integer,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { usuarios } from './usuario';

export const roles = pgTable(
  'roles',
  {
    id: serial('id').primaryKey(),
    nome: varchar('nome', { length: 60 }).notNull(),
    descricao: varchar('descricao', { length: 255 }),
    criadoEm: timestamp('criado_em').notNull().defaultNow(),
  },
  (t) => ({
    nomeUnico: uniqueIndex('roles_nome_unico').on(t.nome),
  }),
);

export const permissoes = pgTable(
  'permissoes',
  {
    id: serial('id').primaryKey(),
    chave: varchar('chave', { length: 80 }).notNull(),
    descricao: varchar('descricao', { length: 255 }),
  },
  (t) => ({
    chaveUnica: uniqueIndex('permissoes_chave_unica').on(t.chave),
  }),
);

export const rolePermissoes = pgTable(
  'role_permissoes',
  {
    roleId: integer('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
    permissaoId: integer('permissao_id')
      .references(() => permissoes.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (t) => ({
    rolePermissaoUnico: uniqueIndex('role_permissoes_unico').on(
      t.roleId,
      t.permissaoId,
    ),
    roleIdx: index('role_permissoes_role_idx').on(t.roleId),
    permissaoIdx: index('role_permissoes_permissao_idx').on(t.permissaoId),
  }),
);

export const usuarioRoles = pgTable(
  'usuario_roles',
  {
    usuarioId: integer('usuario_id')
      .references(() => usuarios.id, { onDelete: 'cascade' })
      .notNull(),
    roleId: integer('role_id')
      .references(() => roles.id, { onDelete: 'cascade' })
      .notNull(),
    atribuidoEm: timestamp('atribuido_em').notNull().defaultNow(),
  },
  (t) => ({
    usuarioRoleUnico: uniqueIndex('usuario_roles_unico').on(
      t.usuarioId,
      t.roleId,
    ),
    usuarioIdx: index('usuario_roles_usuario_idx').on(t.usuarioId),
    roleIdx: index('usuario_roles_role_idx').on(t.roleId),
  }),
);
