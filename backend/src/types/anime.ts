export type Anime = {
  id: number;
  estudio_id: number;
  titulo: string;
  tipo?: string;
  temporada?: number;
  status_id?: number;
  ano?: number;
  estacao_id?: number;
  episodios?: number;
  sinopse?: string;
  capaUrl?: string;
};

export interface AnimeFiltros {
  status?: number;
  genero?: number;
  estudio?: number;
  estacao?: number;
  ano?: number;
}

export type Temporada = {
  id: number;
  numero: number;
  ano: number;
  animeId: number;
};

export type AnimeListagem = {
  id: number;
  titulo: string;
  ano: number;
  temporada: number;
  capaUrl: string;
  estudio: {
    nome: string;
  };
  generos: {
    nome: string;
  }[];
};