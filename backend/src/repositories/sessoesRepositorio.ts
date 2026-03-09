import { prisma } from '../lib/prisma';
import type { CriarSessaoInput, Sessao } from '../types/sessoes';

export const sessoesRepositorio = {
  async criarSessao(dados: CriarSessaoInput): Promise<Sessao> {
    const registro = await prisma.sessao.create({
      data: {
        usuarioId: dados.usuarioId,
        refreshTokenHash: dados.refreshTokenHash,
        dispositivo: dados.dispositivo,
        ip: dados.ip,
        userAgent: dados.userAgent,
        expiraEm: dados.expiraEm,
      },
    });

    return registro;
  },

  async buscarPorRefreshTokenHash(hash: string): Promise<Sessao | null> {
    const registro = await prisma.sessao.findFirst({
      where: {
        refreshTokenHash: hash,
        revogadoEm: null,
      },
    });

    return registro;
  },

  async revogarSessao(id: number): Promise<void> {
    await prisma.sessao.update({
      where: { id },
      data: {
        revogadoEm: new Date(),
      },
    });
  },

  async revogarSessoesDoUsuario(usuarioId: number): Promise<void> {
    await prisma.sessao.updateMany({
      where: {
        usuarioId,
        revogadoEm: null,
      },
      data: {
        revogadoEm: new Date(),
      },
    });
  },
};