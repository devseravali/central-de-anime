import { useQuery } from '@tanstack/react-query';
import type {
  RankingAnimeEntry,
  RankingAnimeResponse,
  RankingPersonagemEntry,
  RankingPersonagemResponse,
} from '../../types/ranking';
import { api } from '../../services/api';

export function useAnimeRanking() {
  return useQuery({
    queryKey: ['ranking', 'animes', 'top'],
    queryFn: async (): Promise<RankingAnimeResponse> => {
      const res = await api.get<RankingAnimeEntry[]>('/ranking/animes/top');

      const items = res.data.map((item, index) => ({
        ...item,
        position: index + 1,
      }));

      return {
        podium: items.slice(0, 3),
        ranking: items.slice(3, 10),
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}

export function usePersonagemRanking() {
  return useQuery({
    queryKey: ['ranking', 'personagens', 'top'],
    queryFn: async (): Promise<RankingPersonagemResponse> => {
      const res = await api.get<RankingPersonagemEntry[]>('/ranking/personagens/top');

      const items = res.data.map((item, index) => ({
        ...item,
        position: index + 1,
      }));

      return {
        podium: items.slice(0, 3),
        ranking: items.slice(3, 10),
      };
    },
    staleTime: 1000 * 60 * 2,
  });
}
