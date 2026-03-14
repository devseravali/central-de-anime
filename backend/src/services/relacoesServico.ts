import { relacoesRepositorio } from '../repositories/relacoesRepositorio';
import type { AnimesDaEntidadeMap } from '../types/relacoes';
import { prisma } from '../lib/prisma';

function toNumber(value: string | number): number {
  return typeof value === 'string' ? Number(value) : value;
}

export const relacoesServico = {
  listarPersonagensdeUmAnime(animeId: number) {
    return relacoesRepositorio.listarPersonagensDeUmAnime(animeId);
  },

  buscarTodasTags() {
    return relacoesRepositorio.buscarTodasTags();
  },

  listarAnimesdeUmPersonagem(personagemId: number) {
    return relacoesRepositorio.listarAnimesDeUmPersonagem(personagemId);
  },

  listarGenerosdeUmAnime(animeId: number) {
    return relacoesRepositorio.listarGenerosDeUmAnime(animeId);
  },

  buscarEstudiodeUmAnime(animeId: number) {
    return relacoesRepositorio.buscarEstudioDeUmAnime(animeId);
  },

  listarAnimesdeUmEstudio(estudioId: number) {
    return relacoesRepositorio.listarAnimesDeUmEstudio(estudioId);
  },

  listarPlataformasdeUmAnime(animeId: number) {
    return relacoesRepositorio.listarPlataformasDeUmAnime(animeId);
  },

  buscarStatusdeUmAnime(animeId: number) {
    return relacoesRepositorio.buscarStatusDeUmAnime(animeId);
  },

  listarTagsdeUmAnime(animeId: number) {
    return relacoesRepositorio.listarTagsDeUmAnime(animeId);
  },

  listarTemporadas() {
    return relacoesRepositorio.listarTemporadas();
  },

  listarAnimesdeUmaTemporada(temporadaId: number) {
    return relacoesRepositorio.listarAnimesDeUmaTemporada(temporadaId);
  },

  buscarEstacaodeUmAnime(animeId: number) {
    return relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'estacoes');
  },

  buscarTemporadadeUmAnime(animeId: number) {
    return relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'temporadas');
  },

  buscarTagsPorNome(nome?: string) {
    return relacoesRepositorio.buscarTagsPorNome(nome);
  },

  buscarStatusPorNome(nome: string) {
    return relacoesRepositorio.buscarStatusPorNome(nome);
  },

  buscarGeneroPorNome(nome: string) {
    return relacoesRepositorio.buscarGenerosPorNome(nome);
  },

  buscarEstacoesPorNome(nome: string) {
    return relacoesRepositorio.buscarEstacoesPorNome(nome);
  },

  buscarEstudiosPorNome(nome: string) {
    return relacoesRepositorio.buscarEstudiosPorNome(nome);
  },

  buscarPlataformasPorNome(nome: string) {
    return relacoesRepositorio.buscarPlataformasPorNome(nome);
  },

  buscarPersonagensPorNome(nome: string) {
    return relacoesRepositorio.buscarPersonagensPorNome(nome);
  },

  buscarAnimesPorTitulo(titulo: string) {
    return relacoesRepositorio.buscarAnimesPorTitulo(titulo);
  },

  buscarAnimePorId(id: number) {
    return relacoesRepositorio.buscarAnimePorId(id);
  },

  buscarAnimesRelacionadosComUmaEntidade(
    entidadeType: keyof AnimesDaEntidadeMap,
    entidadeId: number,
  ) {
    return relacoesRepositorio.buscarAnimesDeUmaEntidade(
      entidadeId,
      entidadeType,
    );
  },

  buscarAnimesDeUmaEntidade(
    entidadeType: keyof AnimesDaEntidadeMap,
    entidadeId: string | number,
  ) {
    return relacoesRepositorio.buscarAnimesDeUmaEntidade(
      toNumber(entidadeId),
      entidadeType,
    );
  },

  async buscarTemporadasPorNome(nome?: string) {
    return await prisma.anime.findMany({
      distinct: ['temporada'],
      select: { temporada: true },
      where: nome
        ? { temporada: { equals: Number(nome) } }
        : { temporada: { not: undefined } },
    });
  },

  listarAnimesPorAno(ano: number) {
    return relacoesRepositorio.listarAnimesPorAno(ano);
  },

  listarAnimesdeUmaTag(tagId: number) {
    return relacoesRepositorio.listarAnimesDeUmaTag(tagId);
  },

  listarAnimesdeUmStatus(statusId: number) {
    return relacoesRepositorio.listarAnimesDeUmStatus(statusId);
  },

  listarAnimesdeUmGenero(generoId: number) {
    return relacoesRepositorio.listarAnimesDeUmGenero(generoId);
  },

  listarAnimesdeUmaEstacao(estacaoId: number) {
    return relacoesRepositorio.listarAnimesDeUmaEstacao(estacaoId);
  },

  listarAnimesdeUmaPlataforma(plataformaId: number) {
    return relacoesRepositorio.listarAnimesDeUmaPlataforma(plataformaId);
  },
};
