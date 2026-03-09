import { prisma } from '../lib/prisma';
import type {
  CriarVerificacaoEmailDTO,
  VerificacaoEmail,
} from '../types/verificacaoEmail';

type RegistroUnico<T> = T | null;

function agora(): Date {
  return new Date();
}

export const verificacoesEmailRepositorio = {
  async criar(dados: CriarVerificacaoEmailDTO): Promise<VerificacaoEmail> {
    const registro = await prisma.verificacao.create({
      data: {
        usuarioId: dados.usuarioId,
        valor: dados.valor,
        criadoEm: agora(),
        tipo: 'email',
        expiraEm: dados.expiraEm,
      },
    });
    return registro;
  },

  async buscarPorToken(
    token: string,
  ): Promise<RegistroUnico<VerificacaoEmail>> {
    return prisma.verificacao.findFirst({
      where: { valor: token },
    });
  },

  async buscarAtivoPorToken(
    token: string,
  ): Promise<RegistroUnico<VerificacaoEmail>> {
    const agoraData = agora();

    return prisma.verificacao.findFirst({
      where: {
        valor: token,
      },
    });
  },

  async buscarUltimoPorUsuarioId(
    usuarioId: number,
  ): Promise<RegistroUnico<VerificacaoEmail>> {
    return prisma.verificacao.findFirst({
      where: { usuarioId },
      orderBy: {
        criadoEm: 'desc',
      },
    });
  },

  async marcarComoUsado(id: number): Promise<VerificacaoEmail> {
    return prisma.verificacao.update({
      where: { id },
      data: {},
    });
  },
};
