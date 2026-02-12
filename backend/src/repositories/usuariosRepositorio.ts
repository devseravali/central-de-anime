import { db } from '../db';
import { usuarios } from '../schema/usuario';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

import type {
  AtualizarUsuarioDTO,
  CriarUsuarioDTO,
  Usuario,
  UsuarioPublico,
} from '../types/usuario';

const SALT_ROUNDS = 10;

function toPublico(u: Usuario): UsuarioPublico {
  const { senhaHash: _senhaHash, ...publico } = u;
  return publico;
}

export const usuariosRepositorio = {
  async listarTodos({ pagina = 1, limite = 20 } = {}): Promise<
    UsuarioPublico[]
  > {
    const offset = (pagina - 1) * limite;
    const rows = await db.select().from(usuarios).limit(limite).offset(offset);
    return rows.map((u) => toPublico(u as Usuario));
  },

  async buscarPorId(id: number): Promise<UsuarioPublico | null> {
    const [row] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, id))
      .limit(1);
    if (!row) return null;
    return toPublico(row as Usuario);
  },

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    const [row] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);
    if (!row) return null;
    return row as Usuario;
  },

  async criar(dados: CriarUsuarioDTO): Promise<UsuarioPublico> {
    const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);

    const [novo] = await db
      .insert(usuarios)
      .values({
        nome: dados.nome,
        email: dados.email,
        senhaHash,
      })
      .returning();

    return toPublico(novo as Usuario);
  },

  async atualizar(
    id: number,
    dados: AtualizarUsuarioDTO,
  ): Promise<UsuarioPublico> {
    const [atualizado] = await db
      .update(usuarios)
      .set({
        ...(dados.nome !== undefined ? { nome: dados.nome } : {}),
        ...(dados.email !== undefined ? { email: dados.email } : {}),
      })
      .where(eq(usuarios.id, id))
      .returning();

    if (!atualizado) {
      throw new Error('USUARIO_NOT_FOUND');
    }

    return toPublico(atualizado as Usuario);
  },

  async marcarEmailVerificado(id: number): Promise<void> {
    await db
      .update(usuarios)
      .set({ emailVerificado: true, status: 'ativo' })
      .where(eq(usuarios.id, id));
  },

  async remover(id: number): Promise<void> {
    await db.delete(usuarios).where(eq(usuarios.id, id));
  },
};
