import { prisma } from '../lib/prisma';
import { ErroApi } from '../errors/ErroApi';
import type {
  Estudio,
  CriarEstudioDTO,
  AtualizarEstudioDTO,
} from '../types/estudio';

export const estudiosRepositorio = {
  async listarEstudios(): Promise<Estudio[]> {
    return prisma.estudio.findMany({
      orderBy: { id: 'asc' },
    });
  },

  async estudioPorId(id: number): Promise<Estudio | null> {
    return prisma.estudio.findUnique({
      where: { id },
      include: { animes: true },
    });
  },

  async estudioPorNome(nome: string): Promise<Estudio | null> {
    return prisma.estudio.findFirst({
      where: {
        nome: {
          contains: nome,
          mode: 'insensitive',
        },
      },
      include: { animes: true },
    });
  },

  async animesPorEstudios(id: number) {
    const estudio = await prisma.estudio.findUnique({
      where: { id },
      include: { animes: true },
    });

    if (!estudio) {
      throw ErroApi.notFound(
        'Estúdio não encontrado.',
        'ESTUDIO_NAO_ENCONTRADO',
      );
    }

    return estudio.animes;
  },

  async adicionarEstudio(dados: CriarEstudioDTO): Promise<Estudio> {
    if (!dados.nome || !dados.principaisObras) {
      throw ErroApi.badRequest(
        'Nome e principaisObras são obrigatórios.',
        'ESTUDIO_CAMPOS_OBRIGATORIOS',
      );
    }

    try {
      return await prisma.estudio.create({
        data: dados,
      });
    } catch (error: any) {
      console.error(error);

      if (
        (error.code && error.code === 'P2002') ||
        (error.message && error.message.includes('Unique constraint')) ||
        (error.message && error.message.includes('unique constraint failed'))
      ) {
        throw ErroApi.conflict(
          'Já existe um estúdio com esse nome.',
          'ESTUDIO_DUPLICADO',
        );
      }

      throw ErroApi.internalServerError(
        'Erro ao criar estúdio.',
        'ERRO_CRIAR_ESTUDIO',
      );
    }
  },

  async atualizarEstudio(
    id: number,
    dados: AtualizarEstudioDTO,
  ): Promise<Estudio> {
    try {
      const estudio = await prisma.estudio.update({
        where: { id },
        data: dados,
      });

      return estudio;
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        if (error.message.includes('Record to update not found')) {
          throw ErroApi.notFound(
            'Estúdio não encontrado.',
            'ESTUDIO_NAO_ENCONTRADO',
          );
        }
      }

      throw ErroApi.internalServerError(
        'Erro ao atualizar estúdio.',
        'ERRO_ATUALIZAR_ESTUDIO',
      );
    }
  },

  async deletarEstudio(id: number): Promise<void> {
    try {
      await prisma.estudio.delete({
        where: { id },
      });
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        if (error.message.includes('Record to delete does not exist')) {
          throw ErroApi.notFound(
            'Estúdio não encontrado.',
            'ESTUDIO_NAO_ENCONTRADO',
          );
        }
      }

      throw ErroApi.internalServerError(
        'Erro ao deletar estúdio.',
        'ERRO_DELETAR_ESTUDIO',
      );
    }
  },
};
