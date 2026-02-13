import type { ApiItemResponse, ApiListResponse } from './api';

export interface Estudio {
  id: number;
  nome: string;
  principaisObras: string;
}

export type CriarEstudioDTO = {
  nome: string;
  pais?: string;
  website?: string;
};

export type AtualizarEstudioDTO = Partial<CriarEstudioDTO>;

export interface Studio {
  id: number;
  nome: string;
  principaisObras: string;
}

export type StudioResponse = ApiItemResponse<Studio>;
export type StudiosListResponse = ApiListResponse<Studio>;

export type StudioComNomePossivelmenteNulo = Omit<Studio, 'nome'> & {
  nome: string | null;
};