export type IdNome = {
  id: number;
  nome: string;
};

export type PopularComTotalAnimes = IdNome & {
  totalAnimes: number;
};

export type EstacaoPopular = IdNome & {
  total: number;
};

export type TemporadaPopular = {
  id: number;
  nome: string;
  episodios: number;
  ano: number | string;
  slug: string;
};

export type AnimePopular = {
  id: number;
  nome: string;
  totalPersonagens: number;
};