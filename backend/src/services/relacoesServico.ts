import { relacoesRepositorio } from '../repositories/relacoesRepositorio';
import type { EntidadesDoAnime, EntidadesDoAnimeMap } from '../types/relacoes';

function toNumber(value: string | number): number {
  return typeof value === 'string' ? Number(value) : value;
}

export const relacoesServico = {
  listarPersonagensdeUmAnime(animeId: number) {
    return relacoesRepositorio.listarPersonagensDeUmAnime(animeId);
  },

  listarAnimesdeUmPersonagem(personagemId: number) {
    return relacoesRepositorio.listarAnimesDeUmPersonagem(personagemId);
  },

  listarGenerosdeUmAnime(animeId: number) {
    return relacoesRepositorio.listarGenerosDeUmAnime(animeId);
  },

  listarAnimesdeUmGenero(generoId: number) {
    return relacoesRepositorio.listarAnimesDeUmGenero(generoId);
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

  listarAnimesdeUmaPlataforma(plataformaId: number) {
    return relacoesRepositorio.listarAnimesDeUmaPlataforma(plataformaId);
  },

  buscarTemporadadeUmAnime(animeId: number) {
    return relacoesRepositorio.buscarTemporadasDeUmAnime(animeId);
  },

  listarAnimesdeUmaTemporada(temporadaId: number) {
    return relacoesRepositorio.listarAnimesDeUmaTemporada(temporadaId);
  },

  buscarEstacaodeUmAnime(animeId: number) {
    return relacoesRepositorio.buscarEstacaoDeUmAnime(animeId);
  },

  listarAnimesdeUmaEstacao(estacaoId: number) {
    return relacoesRepositorio.listarAnimesDeUmaEstacao(estacaoId);
  },

  buscarAnimesPorTitulo(titulo: string) {
    return relacoesRepositorio.buscarAnimesPorTitulo(titulo);
  },

  buscarPersonagensPorNome(nome: string) {
    return relacoesRepositorio.buscarPersonagensPorNome(nome);
  },

  buscarStatusdeUmAnime(animeId: number) {
    return relacoesRepositorio.buscarStatusDeUmAnime(animeId);
  },

  listarAnimesdeUmStatus(statusId: number) {
    return relacoesRepositorio.listarAnimesDeUmStatus(statusId);
  },

  listarTagsdeUmAnime(animeId: number) {
    return relacoesRepositorio.listarTagsDeUmAnime(animeId);
  },

  listarAnimesdeUmaTag(tagId: number) {
    return relacoesRepositorio.listarAnimesDeUmaTag(tagId);
  },

  buscarTagsPorNome(nome: string) {
    return relacoesRepositorio.buscarTagsPorNome(nome);
  },

  buscarTemporadasPorNome(nome: string) {
    return relacoesRepositorio.buscarTemporadasPorNome(nome);
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

  async buscaEntidadesRelacionadasComAnime(
    animeId: number,
  ): Promise<EntidadesDoAnime> {
    const [
      personagens,
      generos,
      estudios,
      plataformas,
      temporadas,
      estacoes,
      status,
      tags,
    ] = (await Promise.all([
      relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'personagens'),
      relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'generos'),
      relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'estudios'),
      relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'plataformas'),
      relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'temporadas'),
      relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'estacoes'),
      relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'status'),
      relacoesRepositorio.buscarEntidadesDeUmAnime(animeId, 'tags'),
    ])) as [
      EntidadesDoAnimeMap['personagens'] | null,
      EntidadesDoAnimeMap['generos'] | null,
      EntidadesDoAnimeMap['estudios'] | null,
      EntidadesDoAnimeMap['plataformas'] | null,
      EntidadesDoAnimeMap['temporadas'] | null,
      EntidadesDoAnimeMap['estacoes'] | null,
      EntidadesDoAnimeMap['status'] | null,
      EntidadesDoAnimeMap['tags'] | null,
    ];

    return {
      personagens: personagens ?? [],
      generos: generos ?? [],
      estudios: estudios ?? [],
      plataformas: plataformas ?? [],
      temporadas: temporadas ?? [],
      estacoes: estacoes ?? null,
      status: status ?? [],
      tags: tags ?? [],
    };
  },

  buscarAnimesRelacionadosComUmaEntidade(
    entidadeType: string,
    entidadeId: number,
  ) {
    return relacoesRepositorio.buscarAnimesDeUmaEntidade(
      entidadeId,
      entidadeType,
    );
  },

  buscarAnimesDeUmaEntidade(entidadeType: string, entidadeId: string | number) {
    return relacoesRepositorio.buscarAnimesDeUmaEntidade(
      toNumber(entidadeId),
      entidadeType as
        | 'estudios'
        | 'generos'
        | 'personagens'
        | 'plataformas'
        | 'temporadas'
        | 'estacoes'
        | 'status'
        | 'tags',
    );
  },
};
