import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { persistPairs } from '../utils/persistencia';
import { assertReferences } from '../validacoes/referencias';
import { animePersonagem } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('AnimePersonagem', async (ctx, report) => {
    const rows = await readRows('relacionamentos/anime_personagem.json', animePersonagem, report);
    const [animes, personagens] = await Promise.all([
      ctx.prisma.anime.findMany({ select: { id: true } }),
      ctx.prisma.personagem.findMany({ select: { id: true } }),
    ]);
    assertReferences(rows.map(row => row.animeId), animes, 'AnimePersonagem.animeId');
    assertReferences(rows.map(row => row.personagemId), personagens, 'AnimePersonagem.personagemId');
    await persistPairs(ctx, report, rows, row => `${row.animeId}:${row.personagemId}`, {
      list: db => db.animePersonagem.findMany(),
      createMany: (db, data) => db.animePersonagem.createMany({ data }),
    });
  }, context);
}

runDirect(import.meta.url, main);
