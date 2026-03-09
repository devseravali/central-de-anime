import { Estacao } from '../../generated/prisma/client';
import { normalizarTextoComparacao } from '../helpers/textHelpers';
import { prisma } from '../lib/prisma';

export const estacoesRepositorio = {
  listarTodos: async (): Promise<Estacao[]> => {
    return prisma.estacao.findMany({ orderBy: { id: 'asc' } });
  },

  buscarPorId: async (id: number): Promise<Estacao | null> => {
    return prisma.estacao.findUnique({ where: { id } });
  },

  buscarPorNome: async (nome: string): Promise<Estacao | null> => {
    const todas = await prisma.estacao.findMany();
    const termo = normalizarTextoComparacao(nome);
    const estacao = todas.find(
      (e: Estacao) => normalizarTextoComparacao(e.nome) === termo,
    );
    return estacao ?? null;
  },

  criar: async (dados: { nome: string; slug: string }): Promise<Estacao> => {
    return prisma.estacao.create({ data: dados });
  },

  atualizar: async (
    id: number,
    dados: { nome: string; slug?: string },
  ): Promise<Estacao | null> => {
    try {
      return await prisma.estacao.update({ where: { id }, data: dados });
    } catch {
      return null;
    }
  },

  remover: async (id: number): Promise<void> => {
    await prisma.estacao.delete({ where: { id } });
  },
};
