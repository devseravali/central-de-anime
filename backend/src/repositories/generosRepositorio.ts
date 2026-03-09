import { prisma } from '../lib/prisma';
import type {
  Genero,
  CriarGeneroDTO,
  AtualizarGeneroDTO,
} from '../types/genero';
import { Anime } from '../../src/types/anime';

export const generosRepositorio = {
  listar({ pagina = 1, limite = 20 } = {}): Promise<Genero[]> {
    return prisma.genero.findMany({
      skip: (pagina - 1) * limite,
      take: limite,
      orderBy: { id: 'asc' },
    });
  },

  async porId(id: number): Promise<Genero | null> {
    return prisma.genero.findUnique({ where: { id } });
  },

  async porNome(nome: string): Promise<Genero | null> {
    return prisma.genero.findFirst({ where: { nome } });
  },

  async criar(dados: CriarGeneroDTO): Promise<Genero> {
    console.log('[generosRepositorio.criar] Dados recebidos:', dados);
    const result = await prisma.genero.create({ data: { nome: dados.nome } });
    console.log('[generosRepositorio.criar] Resultado do create:', result);
    return result;
  },

  async atualizar(
    id: number,
    dados: AtualizarGeneroDTO,
  ): Promise<Genero | null> {
    return prisma.genero.update({
      where: { id },
      data: { nome: dados.nome },
    });
  },

  async deletar(id: number): Promise<Genero | null> {
    await prisma.animeGenero.deleteMany({ where: { genero_id: id } });
    return prisma.genero.delete({ where: { id } });
  },

  listarAnimesPorGeneroId(id: number) {
    return prisma.animeGenero
      .findMany({
        where: { genero_id: id },
        include: { animes: true },
      })
      .then((res: { animes: Anime }[]) => res.map((r) => r.animes));
  },

  async listarAnimesPorNomeGenero(nome: string) {
    const genero = await prisma.genero.findFirst({ where: { nome } });
    if (!genero) return [];
    return this.listarAnimesPorGeneroId(genero.id);
  },
};
