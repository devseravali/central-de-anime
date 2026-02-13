import { animesRepositorio } from '../repositories/animesRepositorio';
import type { AnimeInput, AnimePatch, Anime } from '../types/anime';

function normalizarAnimeInput(data: AnimeInput): Omit<Anime, 'id'> {
  return {
    nome: data.nome,
    titulo_portugues: data.titulo_portugues ?? '',
    titulo_ingles: data.titulo_ingles ?? '',
    titulo_japones: data.titulo_japones ?? '',
    slug: data.slug,
    estudio_id: data.estudio_id,
  };
}

export const animesServico = {
  async buscarTodos({
    pagina = 1,
    limite = 20,
  }: { pagina?: number; limite?: number } = {}) {
    return animesRepositorio.animes({ pagina, limite });
  },

  async buscarComTitulos() {
    return animesRepositorio.animesTitulos();
  },

  async buscarNomes() {
    return animesRepositorio.animesNomes();
  },

  async buscarPorId(id: string) {
    return animesRepositorio.animesPorId(id);
  },

  async adicionarAnime(data: AnimeInput) {
    const payload = normalizarAnimeInput(data);
    return animesRepositorio.adicionarAnime(payload);
  },

  async atualizarAnime(id: string, dados: AnimePatch) {
    const patch: Partial<Omit<Anime, 'id'>> = {};

    if (dados.nome !== undefined) patch.nome = dados.nome;

    if (dados.titulo_portugues !== undefined)
      patch.titulo_portugues = dados.titulo_portugues ?? '';

    if (dados.titulo_ingles !== undefined)
      patch.titulo_ingles = dados.titulo_ingles ?? '';

    if (dados.titulo_japones !== undefined)
      patch.titulo_japones = dados.titulo_japones ?? '';

    if (dados.slug !== undefined) patch.slug = dados.slug;

    if (Object.keys(patch).length === 0) return null;

    return animesRepositorio.atualizarAnime(id, patch);
  },

  async deletarAnime(id: string) {
    return animesRepositorio.deletarAnime(id);
  },
};
