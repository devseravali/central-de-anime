import { filtrosRepositorio } from '../repositories/filtrosRepositorio';
import { normalizarTextoComparacao } from '../helpers/textHelpers';
import type { AnimeResponse } from '../types/filtros';

export const filtrosServico = {
  async buscarFiltros(
    filtroGeneros?: string[],
    filtroAno?: number,
    filtroEstacao?: string,
  ) {
    const dados = await filtrosRepositorio.buscarTodosFiltros(
      filtroGeneros,
      filtroAno,
      filtroEstacao,
    );

    const animes: AnimeResponse[] = dados.animes.map(
      (anime: {
        id: number;
        titulo: string;
        animeGeneros?: { genero: { nome: string } }[];
        estudio?: { nome: string };
        ano?: number;
        capaUrl?: string;
      }) => ({
        id: anime.id,
        titulo: anime.titulo,
        generos:
          anime.animeGeneros
            ?.map((g: { genero: { nome: string } }) => g.genero.nome)
            .join(', ') ?? '',
        status: '',
        estudio: anime.estudio?.nome ?? '',
        ano: typeof anime.ano === 'number' ? anime.ano : null,
        capaUrl: anime.capaUrl ?? '',
      }),
    );

    return {
      anos: dados.anos,
      generos: dados.generos,
      status: dados.status,
      estudios: dados.estudios,
      estacoes: dados.estacoes,
      animes,
    };
  },
  async buscarPersonagens(nome?: string) {
    return await filtrosRepositorio.buscarPersonagens(nome);
  },
};
