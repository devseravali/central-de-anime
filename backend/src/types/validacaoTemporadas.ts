export interface ValidacaoTemporada {
  id: number;
  anime_id: number;
  slug: string;
  nome: string;
  tipo: string;
  temporada: number;
  status_id: number;
  ano: number;
  estacao_id: number;
  episodios: number;
  sinopse: string;
}

export type ValidacaoTemporadaInput = {
  id?: number | string;
  anime_id?: number | string;
  slug?: string;
  nome?: string;
  tipo?: string;
  temporada?: number | string;
  status_id?: number | string;
  ano?: number | string;
  estacao_id?: number | string;
  episodios?: number | string;
  sinopse?: string;
};