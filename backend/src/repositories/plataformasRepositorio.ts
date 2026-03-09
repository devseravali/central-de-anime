import { prisma } from '../lib/prisma';
import type { Plataforma } from '../types/plataforma';
import type {
  AtualizarPlataformaDTO,
  PlataformaDTO,
} from '../types/dtos/plataformaDTO';
import { normalizarTextoComparacao } from '../helpers/textHelpers';

function toPlataforma(model: { id: number; nome: string }): Plataforma {
  return {
    id: model.id,
    nome: model.nome ?? '',
  };
}

export const plataformaRepositorio = {
  async listar(): Promise<Plataforma[]> {
    const rows = await prisma.plataforma.findMany();
    return rows.map(toPlataforma);
  },

  async porId(id: number): Promise<Plataforma | undefined> {
    const row = await prisma.plataforma.findUnique({ where: { id } });
    return row ? toPlataforma(row) : undefined;
  },

  async porNome(nome: string): Promise<Plataforma | undefined> {
    const normalizado = normalizarTextoComparacao(nome);

    const all = await prisma.plataforma.findMany();
    const match = all.find(
      (p: { nome: string }) =>
        normalizarTextoComparacao(p.nome) === normalizado,
    );
    return match ? toPlataforma(match) : undefined;
  },

  async animesPorPlataformaId(plataformaId: number) {
    const relacoes = await prisma.animePlataforma.findMany({
      where: { plataforma_id: plataformaId },
      include: { anime: true },
    });
    return relacoes.map((r) => r.anime);
  },

  async criar(dados: { nome: string }): Promise<Plataforma> {
    const nomeNormalizado = normalizarTextoComparacao(dados.nome);
    const row = await prisma.plataforma.create({
      data: { nome: nomeNormalizado },
    });
    return toPlataforma(row);
  },

  async atualizar(
    id: number,
    dados: AtualizarPlataformaDTO,
  ): Promise<Plataforma | undefined> {
    try {
      const updateData: { nome?: string } = {};
      if (dados.nome !== undefined) {
        updateData.nome = normalizarTextoComparacao(dados.nome);
      }

      const row = await prisma.plataforma.update({
        where: { id },
        data: updateData,
      });
      return toPlataforma(row);
    } catch {
      return undefined;
    }
  },

  async deletar(id: number): Promise<Plataforma | undefined> {
    try {
      const row = await prisma.plataforma.delete({ where: { id } });
      return toPlataforma(row);
    } catch {
      return undefined;
    }
  },
};
