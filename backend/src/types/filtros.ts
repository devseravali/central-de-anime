export interface AnimeWhereInput {
  ano?: { in: number[] };
  status_id?: { in: number[] };
  estudio_id?: { in: number[] };
  estacao_id?: { in: number[] };
  generos?: {
    some: {
      genero_id: { in: number[] };
    };
  };
}

export interface AnimeGenero {
  generos: {
    nome: string;
  };
}

export interface AnimeResponse {
  id: number;
  titulo: string;
  generos: string;
  status?: string | null;
  estudio: string;
  estacao?: string | null;
  ano: number | null;
  capaUrl: string;
}
