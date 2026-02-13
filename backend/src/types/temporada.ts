import type { ApiItemResponse, ApiListResponse } from './api';

export interface Temporada {
  id: number;
  animeId: number;
  slug: string;
  nome: string;
  tipo: string;
  temporada: number;
  statusId: number;
  ano: number;
  estacaoId: number;
  episodios: number;
  sinopse?: string;
}

export type TemporadaResponse = ApiItemResponse<Temporada>;
export type TemporadasListResponse = ApiListResponse<Temporada>;