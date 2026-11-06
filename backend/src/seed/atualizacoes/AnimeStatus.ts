import type { SeedContext } from '../config/context';
import { assertUnique, readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { assertReferences } from '../validacoes/referencias';
import { animeStatus } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('AnimeStatus', async (ctx, report) => {
    const rows = await readRows('relacionamentos/anime_status.json', animeStatus, report);
    assertUnique(rows, row => row.animeId, 'AnimeStatus.animeId');
    const [animes, status] = await Promise.all([
      ctx.prisma.anime.findMany({ select: { id: true, statusId: true } }),
      ctx.prisma.status.findMany({ select: { id: true } }),
    ]);
    assertReferences(rows.map(row => row.animeId), animes, 'AnimeStatus.animeId');
    assertReferences(rows.map(row => row.statusId), status, 'AnimeStatus.statusId');
    const previous = new Map(animes.map(row => [row.id, row.statusId]));
    for (const row of rows) {
      if (previous.get(row.animeId) !== row.statusId) {
        report.avisos.push(`animeId=${row.animeId}: status ${previous.get(row.animeId)} -> ${row.statusId} conforme anime_status.json.`);
      }
    }
    for (let offset = 0; offset < rows.length; offset += 50) {
      const batch = rows.slice(offset, offset + 50);
      const counts = await ctx.prisma.$transaction(async db => {
        let updated = 0;
        let unchanged = 0;
        for (const row of batch) {
          const current = await db.anime.findUniqueOrThrow({ where: { id: row.animeId }, select: { statusId: true } });
          if (current.statusId === row.statusId) unchanged++;
          else {
            await db.anime.update({ where: { id: row.animeId }, data: { statusId: row.statusId } });
            updated++;
          }
        }
        return { updated, unchanged };
      }, { isolationLevel: 'Serializable', timeout: 60000 });
      report.atualizados += counts.updated;
      report.inalterados += counts.unchanged;
    }
  }, context);
}

runDirect(import.meta.url, main);
