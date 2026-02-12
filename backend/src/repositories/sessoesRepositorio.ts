import { db } from '../db';
import { sessoesUsuario } from '../schema/usuario';
import { eq } from 'drizzle-orm';
import type { CriarSessaoInput, Sessao } from '../types/sessoes';

export const sessoesRepositorio = {
  async criarSessao(dados: CriarSessaoInput): Promise<Sessao> {
    const [registro] = await db
      .insert(sessoesUsuario)
      .values({
        usuarioId: dados.usuarioId,
        token: dados.token,
        expiraEm: dados.expiraEm,
      })
      .returning();

    return {
      id: Number(registro.id),
      usuarioId: Number(registro.usuarioId),
      token: String(registro.token),
      expiraEm: new Date(registro.expiraEm),
      criadoEm: registro.criadoEm ? new Date(registro.criadoEm) : undefined,
    };
  },

  async obterSessao(token: string): Promise<Sessao | null> {
    const [registro] = await db
      .select()
      .from(sessoesUsuario)
      .where(eq(sessoesUsuario.token, token))
      .limit(1);

    if (!registro) return null;

    return {
      id: Number(registro.id),
      usuarioId: Number(registro.usuarioId),
      token: String(registro.token),
      expiraEm: new Date(registro.expiraEm),
      criadoEm: registro.criadoEm ? new Date(registro.criadoEm) : undefined,
    };
  },

  async deletarSessao(id: number): Promise<void> {
    await db.delete(sessoesUsuario).where(eq(sessoesUsuario.id, id));
  },

  async deletarSessoesPorUsuario(usuarioId: number): Promise<void> {
    await db
      .delete(sessoesUsuario)
      .where(eq(sessoesUsuario.usuarioId, usuarioId));
  },
};