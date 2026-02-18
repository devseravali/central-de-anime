import type { ApiItemResponse, ApiListResponse } from './api';

export interface AnimeJSON {
  id: number;
  anime_id: number;
  estudio_id: number;
  slug: string;
  titulo: string;
  tipo: string;
  temporada?: number;
  status_id?: number;
  ano?: number;
  estacao_id?: number;
  episodios?: number;
  sinopse?: string;
  capaUrl?: string;
}

export type AnimeInput = {
  anime_id: number;
  estudio_id: number;
  slug: string;
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

export type AnimePatch = Partial<AnimeInput>;

export interface AnimeApi {
  id: number;
  anime_id: number;
  estudio_id: number;
  slug: string;
  titulo: string;
  tipo?: string;
  temporada?: number;
  status_id?: number;
  ano?: number;
  estacao_id?: number;
  episodios?: number;
  sinopse?: string;
  capaUrl?: string;
}

export type AnimeResponse = ApiItemResponse<AnimeApi>;

export type AnimesListResponse = ApiListResponse<AnimeApi>;

export type Anime = {
  id: number;
  anime_id: number;
  estudio_id: number;
  slug: string;
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