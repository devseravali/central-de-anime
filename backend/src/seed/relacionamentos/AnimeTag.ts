import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { persistPairs } from '../utils/persistencia';
import { assertReferences } from '../validacoes/referencias';
import { animeTag } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('AnimeTag', async (ctx, report) => {
    const rows = await readRows('relacionamentos/anime_tag.json', animeTag, report);
    const [animes, tags] = await Promise.all([
      ctx.prisma.anime.findMany({ select: { id: true } }),
      ctx.prisma.animeTag.findMany({ select: { id: true } }),
    ]);
    assertReferences(rows.map(row => row.animeId), animes, 'AnimeTag.animeId');
    assertReferences(rows.map(row => row.tagId), tags, 'AnimeTag.tagId');
    await persistPairs(ctx, report, rows, row => `${row.animeId}:${row.tagId}`, {
      list: db => db.animeTagAnime.findMany(),
      createMany: (db, data) => db.animeTagAnime.createMany({ data }),
    });
  }, context);
}

runDirect(import.meta.url, main);
