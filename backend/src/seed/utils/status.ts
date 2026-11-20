import { assertUnique } from './arquivos';
import { SeedInputError } from './relatorio';

export function applyFinalStatus<T extends { id: number; statusId: number }>(
  animes: readonly T[],
  updates: readonly { animeId: number; statusId: number }[],
  warnings: string[],
): T[] {
  assertUnique([...updates], row => row.animeId, 'AnimeStatus.animeId');
  const ids = new Set(animes.map(row => row.id));
  const statuses = new Map<number, number>();
  for (const row of updates) {
    if (!ids.has(row.animeId)) throw new SeedInputError(`AnimeStatus: animeId=${row.animeId} ausente em animes.json.`);
    statuses.set(row.animeId, row.statusId);
  }
  return animes.map(row => {
    const statusId = statuses.get(row.id) ?? row.statusId;
    if (row.statusId !== statusId) warnings.push(`Anime id=${row.id}: status divergente; anime_status.json prevalece.`);
    return { ...row, statusId };
  });
}
