export type RankingAnimeEntry = {
  id: number;
  titulo: string;
  capaUrl: string | null;
  tipo: string;
  ano: number;
  totalFavoritos: number;
  position?: number;
};

export type RankingPersonagemEntry = {
  id: number;
  nome: string;
  imagem: string;
  papel: string | null;
  afiliacao: string | null;
  totalFavoritos: number;
  position?: number;
};

export type RankingAnimeResponse = {
  podium: RankingAnimeEntry[];
  ranking: RankingAnimeEntry[];
};

export type RankingPersonagemResponse = {
  podium: RankingPersonagemEntry[];
  ranking: RankingPersonagemEntry[];
};
