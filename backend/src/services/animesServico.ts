import { animeRepositorio } from '../repositories/animesRepositorio';
import { ErroApi } from '../errors/ErroApi';
import { AnimeCreateDTO, AnimeUpdateDTO } from '../types/dtos/animeDTO';
import { validarAnimeOuFalhar } from '../utils/validators';

const animeNaoEncontrado = () => ErroApi.notFound('Anime', 'ANIME_NOT_FOUND');

export const animeServico = {
  async listarTodosAnimes(params?: {
    offset: number;
    limit: number;
    filtros?: any;
  }) {
    const animes = await animeRepositorio.listarTodosAnimes(params);
    return animes;
  },
  async listarNomes() {
    const animes = await animeRepositorio.listarNomes();
    return animes.map((a: { titulo: string }) => a.titulo);
  },
  async buscarPorId(id: number) {
    const anime = await animeRepositorio.buscarPorId(id);
    if (!anime) throw animeNaoEncontrado();
    return anime;
  },
  async criar(data: AnimeCreateDTO) {
    const validData = validarAnimeOuFalhar(data) as AnimeCreateDTO;
    return animeRepositorio.criar(validData);
  },
  async atualizar(id: number, data: AnimeUpdateDTO) {
    const validData = validarAnimeOuFalhar(data) as AnimeUpdateDTO;
    try {
      return await animeRepositorio.atualizar(id, validData);
    } catch {
      throw animeNaoEncontrado();
    }
  },
  async deletar(id: number) {
    try {
      await animeRepositorio.deletar(id);
    } catch {
      throw animeNaoEncontrado();
    }
  },
  async buscarComTitulos() {
    return animeRepositorio.listarNomes();
  },
  async listarAnimesPorTemporada() {
    return animeRepositorio.listarPorTemporada();
  },
  async listarQuantidadePorTemporada() {
    return animeRepositorio.listarQuantidadePorTemporada();
  },
  async listarAnosAnimes() {
    return animeRepositorio.listarAnos();
  },
};
