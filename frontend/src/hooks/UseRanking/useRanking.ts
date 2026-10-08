import { useQuery } from '@tanstack/react-query';
import type { RankingResponse, RankingTopItem } from '../../types/ranking';
import { api } from '../../services/api';

async function fetchRanking(): Promise<RankingResponse> {
  const res = await api.get<RankingTopItem[]>('/ranking/top');

  const items = res.data.map((item, index) => ({
    id: item.usuario?.id ?? item.id,
    name: item.usuario?.nome ?? `Usuário ${item.usuarioId}`,
    subtitle: `Nível ${item.nivel}`,
    points: item.pontos,
    position: index + 1,
  }));

  return {
    podium: items.slice(0, 3),
    ranking: items.slice(3, 10),
  };
}

export function useRanking() {
  return useQuery({
    queryKey: ['ranking', 'top'],
    queryFn: fetchRanking,
    staleTime: 1000 * 60 * 2,
  });
}
