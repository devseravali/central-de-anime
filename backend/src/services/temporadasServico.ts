import { temporadasRepositorio } from '../repositories/temporadasRepositorio';
import type {
  TemporadaAtualizacaoDTO,
  TemporadaCriacaoDTO,
} from '../types/dtos/temporadaDTO';

export const temporadaServico = {
  listarTemporadas({ pagina = 1, limite = 20 } = {}) {
    return temporadasRepositorio.listarTemporadas({ pagina, limite });
  },

  listarTemporadasPorAnime(animeId: number) {
    return temporadasRepositorio.listarTemporadasPorAnime(animeId);
  },

  listarTemporadasPorAnimeETemporada(animeId: number, temporada: number) {
    return temporadasRepositorio.listarTemporadasPorAnimeETemporada(
      animeId,
      temporada,
    );
  },

  buscarTemporadasPorId(id: number) {
    return temporadasRepositorio.buscarTemporadaPorId(id);
  },

  buscarTemporadasPorNumero(numero: number) {
    return temporadasRepositorio.buscarTemporadasPorNumero(numero);
  },

  criarTemporada(data: TemporadaCriacaoDTO) {
    return temporadasRepositorio.criarTemporada(data);
  },

  atualizarTemporada(id: number, data: TemporadaAtualizacaoDTO) {
    return temporadasRepositorio.atualizarTemporada(id, data);
  },

  deletarTemporada(id: number) {
    return temporadasRepositorio.deletarTemporada(id);
  },
};
