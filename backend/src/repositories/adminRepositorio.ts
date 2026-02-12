import { db } from '../db';
import { usuarios } from '../schema/usuario';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

import {
  CriarUsuarioDTO,
  AtualizarUsuarioDTO,
  Usuario,
} from '../types/usuario';

const SALT_ROUNDS = 10;

export const adminRepositorio = {
  async listarTodosUsuarios(): Promise<Usuario[]> {
    return db
      .select({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        senhaHash: usuarios.senhaHash,
        criadoEm: usuarios.criadoEm,
      })
      .from(usuarios);
  },

  async buscarUsuarioPorId(id: number): Promise<Usuario | null> {
    const rows = await db
      .select({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        senhaHash: usuarios.senhaHash,
        criadoEm: usuarios.criadoEm,
      })
      .from(usuarios)
      .where(eq(usuarios.id, id))
      .limit(1);

    return rows[0] ?? null;
  },

  async buscarUsuarioPorEmail(email: string) {
    const rows = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    return rows[0] ?? null;
  },

  async criarUsuario(dados: CriarUsuarioDTO): Promise<Usuario | null> {
    const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);

    const rows = await db
      .insert(usuarios)
      .values({
        nome: dados.nome,
        email: dados.email,
        senhaHash,
      })
      .returning({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        senhaHash: usuarios.senhaHash,
        criadoEm: usuarios.criadoEm,
      });

    return rows[0] ?? null;
  },

  async atualizarUsuario(
    id: number,
    dados: AtualizarUsuarioDTO,
  ): Promise<Usuario | null> {
    const patch: AtualizarUsuarioDTO = {};
    if (dados.nome !== undefined) patch.nome = dados.nome;
    if (dados.email !== undefined) patch.email = dados.email;

    if (Object.keys(patch).length === 0) return null;

    const rows = await db
      .update(usuarios)
      .set(patch)
      .where(eq(usuarios.id, id))
      .returning({
        id: usuarios.id,
        nome: usuarios.nome,
        email: usuarios.email,
        senhaHash: usuarios.senhaHash,
        criadoEm: usuarios.criadoEm,
      });

    return rows[0] ?? null;
  },

  async removerUsuario(id: number): Promise<boolean> {
    const rows = await db
      .delete(usuarios)
      .where(eq(usuarios.id, id))
      .returning({ id: usuarios.id });

    return rows.length > 0;
  },
};
