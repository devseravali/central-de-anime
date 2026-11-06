import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { persistPairs } from '../utils/persistencia';
import { assertReferences } from '../validacoes/referencias';
import { animeGenero } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('AnimeGenero', async (ctx, report) => {
    const rows = await readRows('relacionamentos/anime_genero.json', animeGenero, report);
    const [animes, generos] = await Promise.all([
      ctx.prisma.anime.findMany({ select: { id: true } }),
      ctx.prisma.genero.findMany({ select: { id: true } }),
    ]);
    assertReferences(rows.map(row => row.animeId), animes, 'AnimeGenero.animeId');
    assertReferences(rows.map(row => row.generoId), generos, 'AnimeGenero.generoId');
    await persistPairs(ctx, report, rows, row => `${row.animeId}:${row.generoId}`, {
      list: db => db.animeGenero.findMany(),
      createMany: (db, data) => db.animeGenero.createMany({ data }),
    });
  }, context);
}

runDirect(import.meta.url, main);
