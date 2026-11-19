import type { SeedContext } from '../config/context';
import { assertUnique, readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { SeedInputError } from '../utils/relatorio';
import { assertReferences } from '../validacoes/referencias';
import { animeStatus } from '../validacoes/schemas';
import { anime } from '../validacoes/schemas';
import { applyFinalStatus } from '../utils/status';

export function main(context?: SeedContext) {
  return executeSeed('AnimeStatus', async (ctx, report) => {
    const rows = await readRows('relacionamentos/anime_status.json', animeStatus, report, ctx);
    const source = await readRows('entidades/animes.json', anime, { ...report }, ctx);
    applyFinalStatus(source, rows, report.avisos);
    assertUnique(rows, row => row.animeId, 'AnimeStatus.animeId');
    const [animes, status] = await Promise.all([
      ctx.prisma.anime.findMany({ select: { id: true, statusId: true } }),
      ctx.prisma.status.findMany({ select: { id: true } }),
    ]);
    assertReferences(rows.map(row => row.animeId), animes, 'AnimeStatus.animeId');
    assertReferences(rows.map(row => row.statusId), status, 'AnimeStatus.statusId');
    const previous = new Map(animes.map(row => [row.id, row.statusId]));
    for (const row of rows) {
      const current = previous.get(row.animeId);
      if (current !== row.statusId) {
        throw new SeedInputError(`AnimeStatus: conflito animeId=${row.animeId}, status existente=${current}, prioritario=${row.statusId}; nenhuma sobrescrita autorizada.`);
      }
    }
    report.inalterados = rows.length;
  }, context);
}

runDirect(import.meta.url, main);
