import { Estacao as EstacaoModel } from '../../generated/prisma/client';
import { ErroApi } from '../errors/ErroApi';
import { normalizarTextoComparacao } from '../helpers/textHelpers';
import { prisma } from '../lib/prisma';

export const estacoesServico = {
  listarTodos: async (): Promise<EstacaoModel[]> => {
    return prisma.estacao.findMany({ orderBy: { id: 'asc' } });
  },

  buscarPorId: async (id: number): Promise<EstacaoModel | null> => {
    return prisma.estacao.findUnique({ where: { id } });
  },

  buscarPorNome: async (nome: string): Promise<EstacaoModel | null> => {
    const todas = await prisma.estacao.findMany();
    const termo = normalizarTextoComparacao(nome);
    const estacao = todas.find(
      (e: EstacaoModel) => normalizarTextoComparacao(e.nome) === termo,
    );
    return estacao ?? null;
  },

  criar: async (dados: { nome: string }): Promise<EstacaoModel> => {
    try {
      return await prisma.estacao.create({ data: dados });
    } catch (err: any) {
      if (err.code === 'P2002') {
        throw ErroApi.badRequest(
          'Nome de estação já cadastrado',
          'ESTACAO_DUPLICADA',
        );
      }
      throw err;
    }
  },

  atualizar: async (
    id: number,
    dados: { nome: string },
  ): Promise<EstacaoModel | null> => {
    try {
      return await prisma.estacao.update({ where: { id }, data: dados });
    } catch {
      return null;
    }
  },

  remover: async (id: number): Promise<void> => {
    const existe = await prisma.estacao.findUnique({ where: { id } });
    if (!existe) throw ErroApi.notFound('Estação', 'ESTACAO_NOT_FOUND');
    await prisma.estacao.delete({ where: { id } });
  },
};
