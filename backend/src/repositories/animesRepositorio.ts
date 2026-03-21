import { prisma } from '../lib/prisma';
import { AnimeCreateDTO, AnimeUpdateDTO } from '../types/dtos/animeDTO';
import type { AnimeFiltros } from '../types/anime';

export const animeRepositorio = {
  async listarTodosAnimes(params?: {
    offset: number;
    limit: number;
    filtros?: AnimeFiltros;
  }) {
    const where: any = {};
    if (params?.filtros) {
      if (params.filtros.status)
        where.status_id = Number(params.filtros.status);
      if (params.filtros.genero)
        where.generos = { some: { id: Number(params.filtros.genero) } };
      if (params.filtros.estudio)
        where.estudio_id = Number(params.filtros.estudio);
      if (params.filtros.estacao)
        where.estacao_id = Number(params.filtros.estacao);
      if (params.filtros.ano) where.ano = Number(params.filtros.ano);
    }
    const animes = await prisma.anime.findMany({
      skip: params?.offset,
      take: params?.limit,
      where,
      orderBy: { id: 'asc' },
      include: {
        generos: true,
        estudio: true,
      },
    });
    return animes;
  },

  listarNomes() {
    return prisma.anime.findMany({
      select: { titulo: true },
    });
  },

  buscarPorId(id: number) {
    return prisma.anime.findUnique({
      where: { id },
      include: { estudio: true },
    });
  },

  criar(data: AnimeCreateDTO) {
    return prisma.anime.create({ data });
  },

  atualizar(id: number, data: AnimeUpdateDTO) {
    return prisma.anime.update({
      where: { id },
      data,
    });
  },

  deletar(id: number) {
    return prisma.anime.delete({ where: { id } });
  },

  listarPorTemporada() {
    return prisma.anime.findMany();
  },

  listarQuantidadePorTemporada() {
    return prisma.anime.groupBy({
      by: ['temporada'],
      _count: { temporada: true },
    });
  },

  listarAnos() {
    return prisma.anime.groupBy({ by: ['ano'] });
  },
};