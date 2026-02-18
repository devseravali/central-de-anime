import { animesRepositorio } from '../repositories/animesRepositorio';
import type { Anime, AnimeInput, AnimePatch } from '../types/anime';

function normalizarAnimeInput(data: AnimeInput): Omit<
  {
    temporada: number | null;
    ano: number | null;
    id: number;
    anime_id: number;
    slug: string;
    titulo: string;
    estudio_id: number;
    tipo: string;
    status_id: number | null;
    estacao_id: number | null;
    episodios: number | null;
    sinopse: string | null;
    capaUrl: string | null;
  },
  'id'
> {
  return {
    anime_id: data.anime_id,
    estudio_id: data.estudio_id,
    slug: data.slug,
    titulo: data.titulo,
    tipo: data.tipo ?? '',
    temporada: data.temporada !== undefined ? data.temporada : null,
    status_id: data.status_id !== undefined ? data.status_id : null,
    ano: data.ano !== undefined ? data.ano : null,
    estacao_id: data.estacao_id !== undefined ? data.estacao_id : null,
    episodios: data.episodios !== undefined ? data.episodios : null,
    sinopse: data.sinopse ?? null,
    capaUrl: data.capaUrl ?? null,
  };
}

export const animesServico = {
  async buscarTodos({
    pagina = 1,
    limite = 20,
  }: { pagina?: number; limite?: number } = {}): Promise<Anime[]> {
    return animesRepositorio.animes({ pagina, limite }) as Promise<Anime[]>;
  },

  async buscarComTitulos(): Promise<Anime[]> {
    return animesRepositorio.animesTitulos() as Promise<Anime[]>;
  },

  async buscarNomes(): Promise<string[]> {
    return animesRepositorio.animesNomes() as Promise<string[]>;
  },

  async buscarPorId(id: string): Promise<Anime | null> {
    return animesRepositorio.animesPorId(id) as Promise<Anime | null>;
  },

  async adicionarAnime(data: AnimeInput): Promise<Anime> {
    const payload = normalizarAnimeInput(data);
    console.log('Dados normalizados no serviço:', payload);
    const anime = await animesRepositorio.adicionarAnime(payload);
    if (!anime) {
      throw new Error('Não foi possível adicionar o anime.');
    }
    return anime as Anime;
  },

  async atualizarAnime(id: string, dados: AnimePatch): Promise<Anime | null> {
    const patch: AnimePatch = {};

    if (dados.anime_id !== undefined) patch.anime_id = dados.anime_id;
    if (dados.estudio_id !== undefined) patch.estudio_id = dados.estudio_id;
    if (dados.slug !== undefined) patch.slug = dados.slug;
    if (dados.titulo !== undefined) patch.titulo = dados.titulo;
    if (dados.tipo !== undefined) patch.tipo = dados.tipo;
    if (dados.temporada !== undefined) patch.temporada = dados.temporada;
    if (dados.status_id !== undefined) patch.status_id = dados.status_id;
    if (dados.ano !== undefined) patch.ano = dados.ano;
    if (dados.estacao_id !== undefined) patch.estacao_id = dados.estacao_id;
    if (dados.episodios !== undefined) patch.episodios = dados.episodios;
    if (dados.sinopse !== undefined) patch.sinopse = dados.sinopse;
    if (dados.capaUrl !== undefined) patch.capaUrl = dados.capaUrl;

    if (Object.keys(patch).length === 0) return null;

    const updated = await animesRepositorio.atualizarAnime(id, patch);
    return updated as Anime | null;
  },

  async deletarAnime(id: string): Promise<boolean> {
    const result = await animesRepositorio.deletarAnime(id);
    return result !== null;
  },

  async buscarTemporadas(): Promise<string[]> {
    return animesRepositorio.listarTemporadas() as Promise<string[]>;
  },

  async buscarTemporadasQuantidade(): Promise<
    { temporada: string; quantidade: number }[]
  > {
    const temporadas = await animesRepositorio.listarTemporadas();
    const animes = (await animesRepositorio.animes({
      pagina: 1,
      limite: 9999,
    })) as Anime[];
    return temporadas.map((temporada) => ({
      temporada,
      quantidade: animes.filter(
        (anime) => String(anime.temporada) === temporada,
      ).length,
    }));
  },

  async buscarTemporadasAnos(): Promise<number[]> {
    const animes = (await animesRepositorio.animes({
      pagina: 1,
      limite: 9999,
    })) as Anime[];
    return Array.from(
      new Set(
        animes
          .map((anime) => anime.ano)
          .filter((ano): ano is number => typeof ano === 'number'),
      ),
    );
  },
};
