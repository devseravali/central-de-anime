export type RankingEntry = {
  id: number;
  name: string;
  subtitle?: string;
  points: number;
  position?: number;
};

export type RankingResponse = {
  podium: RankingEntry[];
  ranking: RankingEntry[];
};

export type RankingTopItem = {
  id: number;
  usuarioId: number;
  pontos: number;
  nivel: number;
  totalEpisodiosAssistidos: number;
  atualizadoEm: string;
  usuario: {
    id: number;
    nome: string;
    avatar: string | null;
  };
};
