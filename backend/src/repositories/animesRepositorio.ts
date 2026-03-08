import { prisma } from '../lib/prisma';
import { AnimeCreateDTO, AnimeUpdateDTO } from '../types/dtos/animeDTO';

export const animeRepositorio = {
  async listarTodosAnimes(params?: { offset: number; limit: number }) {
    const animes = await prisma.anime.findMany({
      skip: params?.offset,
      take: params?.limit,
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
