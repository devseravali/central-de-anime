import { prisma } from '../lib/prisma';

export const estatisticasRepositorio = {
  contarUsuarios: () => prisma.usuario.count(),
  contarAnimes: () => prisma.anime.count(),
  contarEstudios: () => prisma.estudio.count(),
  contarGeneros: () => prisma.genero.count(),
  contarPlataformas: () => prisma.plataforma.count(),
  contarStatus: () => prisma.status.count(),
  contarTags: () => prisma.tags.count(),
  contarEstacoes: () => prisma.estacao.count(),
  contarPersonagens: () => prisma.personagem.count(),

  listarPlataformasPopulares: async (limit = 5) => {
    return prisma.plataforma.findMany({
      take: limit,
      orderBy: {
        animePlataformas: {
          _count: 'desc',
        },
      },
      include: {
        animePlataformas: true,
      },
    });
  },

  listarEstudiosPopulares: async (limit = 5) => {
    return prisma.estudio.findMany({
      take: limit,
      orderBy: {
        animes: { _count: 'desc' },
      },
      include: {
        animes: true,
      },
    });
  },

  listarGenerosPopulares: async (limit = 5) => {
    return prisma.genero.findMany({
      take: limit,
      orderBy: {
        animeGeneros: { _count: 'desc' },
      },
      include: { animeGeneros: true },
    });
  },

  listarStatusPopulares: async (limit = 5) => {
    return prisma.status.findMany({
      take: limit,
      orderBy: {
        id: 'desc',
      },
      include: { animeStatuses: true },
    });
  },

  listarTagsPopulares: async (limit = 5) => {
    return prisma.tags.findMany({
      take: limit,
      orderBy: {
        animeTags: { _count: 'desc' },
      },
      include: { animeTags: true },
    });
  },

  listarEstacoesPopulares: async (limit = 5) => {
    return prisma.estacao.findMany({
      take: limit,
      orderBy: {
        animeEstacaos: { _count: 'desc' },
      },
      include: { animeEstacaos: true },
    });
  },

  listarTemporadasPorAnime: async (ano?: number) => {
    const whereClause = ano ? { ano } : undefined;
    return prisma.animes.groupBy({
      by: ['ano', 'temporada'],
      _count: { temporada: true },
      where: whereClause,
      orderBy: { _count: { temporada: 'desc' } },
    });
  },
};
