import { prisma } from '../lib/prisma';
import { normalizarTextoComparacao } from '../helpers/textHelpers';
import type { Tag, CriarTagDTO, AtualizarTagDTO } from '../types/tag';
import { criarTag } from '../controllers/tagsControlador';

export const tagsRepositorio = {
  async listar(): Promise<Tag[]> {
    const rows = await prisma.tags.findMany();

    return rows.map((row: Tag) => ({
      ...row,
      nome: normalizarTextoComparacao(row.nome),
    }));
  },

  async porId(id: number): Promise<Tag | null> {
    const tag = await prisma.tags.findUnique({
      where: { id },
    });

    return tag ? { ...tag, nome: normalizarTextoComparacao(tag.nome) } : null;
  },

  async buscarPorNome(nome: string): Promise<Tag[]> {
    const nomeNormalizado = normalizarTextoComparacao(nome);

    const rows = await prisma.tags.findMany({
      where: {
        nome: {
          contains: nomeNormalizado,
          mode: 'insensitive',
        },
      },
    });

    return rows.map((row: Tag) => ({
      ...row,
      nome: normalizarTextoComparacao(row.nome),
    }));
  },

  async criarTag(dados: CriarTagDTO): Promise<Tag> {
    try {
      const nova = await prisma.tags.create({
        data: {
          ...dados,
          nome: dados.nome,
        },
      });
      return {
        ...nova,
        nome: normalizarTextoComparacao(nova.nome),
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Tag já existe');
      }
      throw error;
    }
  },

  async atualizar(id: number, dados: AtualizarTagDTO): Promise<Tag | null> {
    const existente = await prisma.tags.findUnique({
      where: { id },
    });

    if (!existente) return null;

    let nomeNormalizado: string | undefined;

    if (dados.nome !== undefined) {
      nomeNormalizado = normalizarTextoComparacao(dados.nome);
    }

    const atualizada = await prisma.tags.update({
      where: { id },
      data: {
        ...dados,
        ...(nomeNormalizado !== undefined ? { nome: nomeNormalizado } : {}),
      },
    });

    return {
      ...atualizada,
      nome: normalizarTextoComparacao(atualizada.nome),
    };
  },

  async deletar(id: number): Promise<Tag | null> {
    const existente = await prisma.tags.findUnique({
      where: { id },
    });

    if (!existente) return null;

    await prisma.animeTag.deleteMany({
      where: { tag_id: id },
    });

    const removida = await prisma.tags.delete({
      where: { id },
    });

    return {
      ...removida,
      nome: normalizarTextoComparacao(removida.nome),
    };
  },
};
