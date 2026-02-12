import { and, eq, or, sql } from 'drizzle-orm';
import { db } from '../db';
import {
  roles,
  usuarioRoles,
  permissoes,
  rolePermissoes,
} from '../schema/admin';

async function exists<T>(query: Promise<T[]>): Promise<boolean> {
  const [row] = await query;
  return !!row;
}

function selectOne() {
  return db.select({ one: sql<number>`1` });
}

async function garantirRole(
  nome: string,
  descricao?: string | null,
): Promise<number> {
  await db
    .insert(roles)
    .values({ nome, ...(descricao ? { descricao } : {}) })
    .onConflictDoNothing();

  const [row] = await db
    .select({ id: roles.id })
    .from(roles)
    .where(eq(roles.nome, nome))
    .limit(1);

  if (!row) {
    throw new Error('ROLE_NOT_FOUND');
  }

  return row.id;
}

async function garantirPermissao(
  chave: string,
  descricao?: string | null,
): Promise<number> {
  await db
    .insert(permissoes)
    .values({ chave, ...(descricao ? { descricao } : {}) })
    .onConflictDoNothing();

  const [row] = await db
    .select({ id: permissoes.id })
    .from(permissoes)
    .where(eq(permissoes.chave, chave))
    .limit(1);

  if (!row) {
    throw new Error('PERMISSION_NOT_FOUND');
  }

  return row.id;
}

async function garantirRolePermissao(
  roleId: number,
  permissaoId: number,
): Promise<void> {
  await db
    .insert(rolePermissoes)
    .values({ roleId, permissaoId })
    .onConflictDoNothing();
}

async function garantirUsuarioRole(
  usuarioId: number,
  roleId: number,
): Promise<void> {
  await db
    .insert(usuarioRoles)
    .values({ usuarioId, roleId })
    .onConflictDoNothing();
}

export const adminAuthRepositorio = {
  async garantirAdmin(usuarioId: number): Promise<void> {
    const roleId = await garantirRole('admin', 'Administrador do sistema');
    const permissaoId = await garantirPermissao(
      'admin:acesso',
      'Acesso ao painel admin',
    );

    await garantirRolePermissao(roleId, permissaoId);
    await garantirUsuarioRole(usuarioId, roleId);
  },

  async usuarioTemRole(usuarioId: number, roleNome: string): Promise<boolean> {
    return exists(
      selectOne()
        .from(usuarioRoles)
        .innerJoin(roles, eq(usuarioRoles.roleId, roles.id))
        .where(
          and(eq(usuarioRoles.usuarioId, usuarioId), eq(roles.nome, roleNome)),
        )
        .limit(1),
    );
  },

  async usuarioTemPermissao(
    usuarioId: number,
    permissaoChave: string,
  ): Promise<boolean> {
    return exists(
      selectOne()
        .from(usuarioRoles)
        .innerJoin(roles, eq(usuarioRoles.roleId, roles.id))
        .innerJoin(rolePermissoes, eq(rolePermissoes.roleId, roles.id))
        .innerJoin(permissoes, eq(permissoes.id, rolePermissoes.permissaoId))
        .where(
          and(
            eq(usuarioRoles.usuarioId, usuarioId),
            eq(permissoes.chave, permissaoChave),
          ),
        )
        .limit(1),
    );
  },

  async usuarioEhAdminOuTemPermissoes(
    usuarioId: number,
    permissoesChave: string[],
  ): Promise<boolean> {
    const filtrosPermissao =
      permissoesChave.length > 0
        ? permissoesChave.map((chave) => eq(permissoes.chave, chave))
        : [];

    return exists(
      selectOne()
        .from(usuarioRoles)
        .innerJoin(roles, eq(usuarioRoles.roleId, roles.id))
        .leftJoin(rolePermissoes, eq(rolePermissoes.roleId, roles.id))
        .leftJoin(permissoes, eq(permissoes.id, rolePermissoes.permissaoId))
        .where(
          and(
            eq(usuarioRoles.usuarioId, usuarioId),
            or(
              eq(roles.nome, 'admin'),
              ...(filtrosPermissao.length ? [or(...filtrosPermissao)] : []),
            ),
          ),
        )
        .limit(1),
    );
  },
};
