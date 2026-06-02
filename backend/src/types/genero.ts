import type { ApiItemResponse, ApiListResponse } from './api';

export type Genero = {
  id: number;
  nome: string;
  descricao?: string | null;
};

export type CriarGeneroDTO = {
  nome: string;
  descricao?: string;
};

export type AtualizarGeneroDTO = Partial<CriarGeneroDTO>;

export type GeneroResponse = ApiItemResponse<Genero>;
export type GenerosListResponse = ApiListResponse<Genero>;
