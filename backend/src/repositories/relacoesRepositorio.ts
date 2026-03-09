import { prisma } from '../lib/prisma';
import type {
  Anime,
  Personagem,
  Genero,
  Estudio,
  Plataforma,
  Status,
  Tag,
  Estacao,
  EntidadesDoAnimeMap,
  AnimesDaEntidadeMap,
} from '../types/relacoes';

export const relacoesRepositorio = {
  listarAnimesdeUmGenero(_generoId: number) {
    throw new Error('Não implementado');
  },

async buscarTodasTags() {
    return prisma.tags.findMany();
  },

  async listarTemporadas() {
    const temporadas = await prisma.anime.findMany({
      distinct: ['temporada'],
      select: { temporada: true },
      where: { temporada: { not: undefined } },
    });
    return temporadas.map((t: { temporada: number | null }) => t.temporada);
  },

  async listarAnimesDeUmaTemporada(temporada: number) {
    return prisma.anime.findMany({
      where: { temporada },
    });
  },
  listarPersonagensDeUmAnime(animeId: number) {
    return prisma.personagem.findMany({
      where: { animePersonagens: { some: { anime_id: animeId } } },
    });
  },

  listarAnimesDeUmPersonagem(personagemId: number) {
    return prisma.anime.findMany({
      where: { animePersonagems: { some: { personagem_id: personagemId } } },
    });
  },

  listarGenerosDeUmAnime(animeId: number) {
    return prisma.genero.findMany({
      where: { animeGeneros: { some: { anime_id: animeId } } },
    });
  },

  listarAnimesDeUmGenero(generoId: number) {
    return prisma.anime.findMany({
      where: { animeGeneros: { some: { genero_id: generoId } } },
    });
  },

  buscarEstudioDeUmAnime(animeId: number) {
    return prisma.estudio.findMany({
      where: { animeEstudios: { some: { anime_id: animeId } } },
    });
  },

  listarAnimesDeUmEstudio(estudioId: number) {
    return prisma.anime.findMany({
      where: { animeEstudios: { some: { estudio_id: estudioId } } },
    });
  },

  listarPlataformasDeUmAnime(animeId: number) {
    return prisma.plataforma.findMany({
      where: { animePlataformas: { some: { anime_id: animeId } } },
    });
  },

  listarAnimesDeUmaPlataforma(plataformaId: number) {
    return prisma.anime.findMany({
      where: { animePlataformas: { some: { plataforma_id: plataformaId } } },
    });
  },

  buscarStatusDeUmAnime(animeId: number) {
    return prisma.status.findMany({
      where: { animeStatuses: { some: { anime_id: animeId } } },
    });
  },

  listarAnimesDeUmStatus(statusId: number) {
    return prisma.anime.findMany({
      where: { animeStatuses: { some: { status_id: statusId } } },
    });
  },

  listarTagsDeUmAnime(animeId: number) {
    return prisma.tags.findMany({
      where: { animeTags: { some: { anime_id: animeId } } },
    });
  },

  listarAnimesDeUmaTag(tagId: number) {
    return prisma.anime.findMany({
      where: { animeTags: { some: { tag_id: tagId } } },
    });
  },

  buscarAnimesPorTitulo(titulo: string) {
    return prisma.anime.findMany({
      where: { titulo: { contains: titulo, mode: 'insensitive' } },
    });
  },

  buscarPersonagensPorNome(nome: string) {
    return prisma.personagem.findMany({
      where: { nome: { contains: nome, mode: 'insensitive' } },
    });
  },

  buscarGenerosPorNome(nome: string) {
    return prisma.genero.findMany({
      where: { nome: { contains: nome, mode: 'insensitive' } },
    });
  },

  buscarEstudiosPorNome(nome: string) {
    return prisma.estudio.findMany({
      where: { nome: { contains: nome, mode: 'insensitive' } },
    });
  },

  buscarPlataformasPorNome(nome: string) {
    return prisma.plataforma.findMany({
      where: { nome: { contains: nome, mode: 'insensitive' } },
    });
  },

  buscarTagsPorNome(nome?: string) {
    if (!nome) return prisma.tags.findMany();
    return prisma.tags.findMany({
      where: { nome: { contains: nome, mode: 'insensitive' } },
    });
  },

  listarAnimesDeUmaEstacao(estacaoId: number) {
    return prisma.anime.findMany({ where: { estacao_id: estacaoId } });
  },

  buscarEstacoesPorNome(nome: string) {
    return prisma.estacao.findMany({
      where: { nome: { contains: nome, mode: 'insensitive' } },
    });
  },

  buscarStatusPorNome(nome: string) {
    return prisma.status.findMany({
      where: { nome: { contains: nome, mode: 'insensitive' } },
    });
  },

  buscarAnimePorId(id: number) {
    return prisma.anime.findUnique({ where: { id } });
  },

  buscarEntidadesDeUmAnime(
    animeId: number,
    entidade: keyof EntidadesDoAnimeMap,
  ) {
    const map: Record<keyof EntidadesDoAnimeMap, () => Promise<any>> = {
      personagens: () => this.listarPersonagensDeUmAnime(animeId),
      generos: () => this.listarGenerosDeUmAnime(animeId),
      estudios: () => this.buscarEstudioDeUmAnime(animeId),
      plataformas: () => this.listarPlataformasDeUmAnime(animeId),
      status: () => this.buscarStatusDeUmAnime(animeId),
      tags: () => this.listarTagsDeUmAnime(animeId),
      estacoes: async () => {
        const anime = await prisma.anime.findUnique({
          where: { id: animeId },
          select: { estacao_id: true },
        });
        if (!anime?.estacao_id) return [];
        return prisma.estacao.findMany({ where: { id: anime.estacao_id } });
      },
      temporadas: async () => {
        return prisma.anime.findMany({
          where: { id: animeId, temporada: { not: undefined } },
          select: { temporada: true },
        });
      },
    };
    return map[entidade]();
  },

  buscarAnimesDeUmaEntidade(
    entidadeId: number,
    entidade: keyof AnimesDaEntidadeMap,
  ) {
    const map: Record<string, () => Promise<any>> = {
      personagens: () => this.listarAnimesDeUmPersonagem(entidadeId),
      generos: () => this.listarAnimesDeUmGenero(entidadeId),
      estudios: () => this.listarAnimesDeUmEstudio(entidadeId),
      plataformas: () => this.listarAnimesDeUmaPlataforma(entidadeId),
      status: () => this.listarAnimesDeUmStatus(entidadeId),
      tags: () => this.listarAnimesDeUmaTag(entidadeId),
      estacoes: () => this.listarAnimesDeUmaEstacao(entidadeId),
      temporadas: async () => {
        const temporadaNum = Number(entidadeId);
        if (isNaN(temporadaNum) || temporadaNum <= 0) return [];
        return prisma.anime.findMany({
          where: { temporada: temporadaNum },
        });
      },
      temporada: async () => {
        const temporadaNum = Number(entidadeId);
        if (isNaN(temporadaNum) || temporadaNum <= 0) return [];
        return prisma.anime.findMany({
          where: { temporada: temporadaNum },
        });
      },
    };
    if (!map[entidade]) return [];
    return map[entidade]();
  },

  listarAnimesPorAno(ano: number) {
    return prisma.anime.findMany({
      where: { ano },
    });
  },
};
