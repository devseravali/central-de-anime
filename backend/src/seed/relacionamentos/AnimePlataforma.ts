import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { persistPairs } from '../utils/persistencia';
import { assertReferences } from '../validacoes/referencias';
import { animePlataforma } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('AnimePlataforma', async (ctx, report) => {
    const rows = await readRows('relacionamentos/anime_plataforma.json', animePlataforma, report);
    const [animes, plataformas] = await Promise.all([
      ctx.prisma.anime.findMany({ select: { id: true } }),
      ctx.prisma.plataforma.findMany({ select: { id: true } }),
    ]);
    assertReferences(rows.map(row => row.animeId), animes, 'AnimePlataforma.animeId');
    assertReferences(rows.map(row => row.plataformaId), plataformas, 'AnimePlataforma.plataformaId');
    await persistPairs(ctx, report, rows, row => `${row.animeId}:${row.plataformaId}`, {
      list: db => db.animePlataforma.findMany(),
      createMany: (db, data) => db.animePlataforma.createMany({ data }),
    });
  }, context);
}

runDirect(import.meta.url, main);
