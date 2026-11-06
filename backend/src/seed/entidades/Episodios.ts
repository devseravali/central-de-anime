import type { SeedContext } from '../config/context';
import { assertUnique, readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { normalizeImage } from '../utils/imagens';
import { persistRecords } from '../utils/persistencia';
import { assertReferences } from '../validacoes/referencias';
import { episodio } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('Episodios', async (ctx, report) => {
    const source = await readRows('entidades/episodios.json', episodio, report);
    const rows = source.map(({ temporadaId, ...row }) => ({
      ...row, temporada: temporadaId, imagemUrl: normalizeImage(row.imagemUrl, report, row.id),
    }));
    assertUnique(rows, row => `${row.animeId}:${row.temporada}:${row.numero}`, 'Episodios.anime/temporada/numero');
    const animes = await ctx.prisma.anime.findMany({ select: { id: true, temporada: true } });
    assertReferences(rows.map(row => row.animeId), animes, 'Episodios.animeId');
    const seasons = new Map(animes.map(row => [row.id, row.temporada]));
    for (const row of rows) {
      if (seasons.get(row.animeId) !== row.temporada) {
        report.avisos.push(`id=${row.id}: temporada da fonte ${row.temporada} difere de Anime ${seasons.get(row.animeId)}; valor preservado.`);
      }
    }
    await persistRecords(ctx, report, rows, {
      list: (db, ids) => db.episodio.findMany({ where: ids ? { id: { in: ids } } : undefined }),
      create: (db, row) => db.episodio.create({ data: row }),
      update: (db, id, data) => db.episodio.update({ where: { id }, data }),
    });
  }, context);
}

runDirect(import.meta.url, main);
