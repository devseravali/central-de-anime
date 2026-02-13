import type { ApiItemResponse, ApiListResponse } from './api';

export interface Anime {
  id: number;
  nome: string;
  titulo_portugues: string;
  titulo_ingles: string;
  titulo_japones: string;
  slug?: string;
  estudio_id: number;
}

export type AnimeInput = {
  nome: string;
  estudio_id: number;
  titulo_portugues?: string;
  titulo_ingles?: string;
  titulo_japones?: string;
  slug?: string;
};

export type AnimePatch = Partial<AnimeInput>;

export interface AnimeApi {
  id: number;
  titulo: string;
  slug: string;
  descricao: string;
}

export type AnimeResponse = ApiItemResponse<AnimeApi>;
export type AnimesListResponse = ApiListResponse<AnimeApi>;
