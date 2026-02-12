import { and, eq, gt, isNull } from 'drizzle-orm';
import { db } from '../db';
import { verificacoesEmail } from '../schema/usuario';

import type {
  CriarVerificacaoEmailDTO,
  VerificacaoEmail,
} from '../types/verificacaoEmail';

type RegistroUnico<T> = T | null;

async function firstOrNull<T>(
  promise: Promise<T[]>,
): Promise<RegistroUnico<T>> {
  const [row] = await promise;
  return row ?? null;
}

function agora(): Date {
  return new Date();
}

export const verificacoesEmailRepositorio = {
  async criar(dados: CriarVerificacaoEmailDTO): Promise<VerificacaoEmail> {
    const registro = await firstOrNull(
      db
        .insert(verificacoesEmail)
        .values({
          usuarioId: dados.usuarioId,
          token: dados.token,
          expiraEm: dados.expiraEm,
        })
        .returning(),
    );

    if (!registro) {
      throw new Error('Falha ao criar verificação de e-mail.');
    }

    return registro;
  },

  async buscarPorToken(
    token: string,
  ): Promise<RegistroUnico<VerificacaoEmail>> {
    return firstOrNull(
      db
        .select()
        .from(verificacoesEmail)
        .where(eq(verificacoesEmail.token, token))
        .limit(1),
    );
  },

  async buscarAtivoPorToken(
    token: string,
  ): Promise<RegistroUnico<VerificacaoEmail>> {
    return firstOrNull(
      db
        .select()
        .from(verificacoesEmail)
        .where(
          and(
            eq(verificacoesEmail.token, token),
            isNull(verificacoesEmail.usadoEm),
            gt(verificacoesEmail.expiraEm, agora()),
          ),
        )
        .limit(1),
    );
  },

  async buscarPorUsuarioId(
    usuarioId: number,
  ): Promise<RegistroUnico<VerificacaoEmail>> {
    return firstOrNull(
      db
        .select()
        .from(verificacoesEmail)
        .where(eq(verificacoesEmail.usuarioId, usuarioId))
        .limit(1),
    );
  },

  async marcarComoUsado(id: number): Promise<RegistroUnico<VerificacaoEmail>> {
    return firstOrNull(
      db
        .update(verificacoesEmail)
        .set({ usadoEm: agora() })
        .where(eq(verificacoesEmail.id, id))
        .returning(),
    );
  },
};