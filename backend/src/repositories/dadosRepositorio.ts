import { prisma } from '../lib/prisma';
import { BuscaPorNomeResultado } from '../types/dados';

export const dadosRepositorio = {
  listarGeneros() {
    return prisma.genero.findMany();
  },

  listarPlataformas() {
    return prisma.plataforma.findMany();
  },

  listarStatus() {
    return prisma.status.findMany();
  },

  listarTags() {
    return prisma.tags.findMany();
  },

  listarEstudios() {
    return prisma.estudio.findMany();
  },

  listarEstacoes() {
    return prisma.estacao.findMany();
  },

  listarAnimes() {
    return prisma.anime.findMany();
  },

  listarPersonagens() {
    return prisma.personagem.findMany();
  },

  async listarTemporadas(): Promise<Array<{ ano: number; temporada: number }>> {
    const agrupado = await prisma.anime.groupBy({
      by: ['ano', 'temporada'],
      _count: { id: true },
    });

    return agrupado
      .filter((row: { ano: number | null; temporada: number | null }) => row.ano !== null && row.temporada !== null)
      .map((row: { ano: number | null; temporada: number | null }) => ({
        ano: row.ano as number,
        temporada: row.temporada as number,
      }));
  },

  async buscarPorNomeRepositorio(
    entidade: keyof BuscaPorNomeResultado,
    nome: string,
  ): Promise<BuscaPorNomeResultado> {
    switch (entidade) {
      case 'estacoes':
        return {
          estacoes: await prisma.estacao.findMany({
            where: { nome: { contains: nome } },
          }),
        };
      case 'status':
        return {
          status: await prisma.status.findMany({
            where: { nome: { contains: nome } },
          }),
        };
      case 'estudios':
        const estudiosResult = await prisma.estudio.findMany({
          where: { nome: { contains: nome } },
        });
        return {
          estudios: estudiosResult.map((estudio: typeof estudiosResult[number]) => ({
            id: estudio.id,
            nome: estudio.nome ?? "",
          })),
        };
      case 'plataformas':
        return {
          plataformas: await prisma.plataforma.findMany({
            where: { nome: { contains: nome } },
          }),
        };
      case 'tags':
        return {
          tags: await prisma.tags.findMany({
            where: { nome: { contains: nome } },
          }),
        };
      case 'animes':
        return {
          animes: await prisma.anime.findMany({
            where: { titulo: { contains: nome } },
          }),
        };
      case 'personagens':
        return {
          personagens: await prisma.personagem.findMany({
            where: { nome: { contains: nome } },
          }),
        };
      default:
        return {};
    }
  },
};

export { BuscaPorNomeResultado };
