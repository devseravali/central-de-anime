import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { resolveImagePath } from '../utils/imagens';
import { persistRecords } from '../utils/persistencia';
import { assertReferences } from '../validacoes/referencias';
import { anime, animeStatus } from '../validacoes/schemas';
import { applyFinalStatus } from '../utils/status';

export function main(context?: SeedContext) {
  return executeSeed('Animes', async (ctx, report) => {
    const source = await readRows('entidades/animes.json', anime, report, ctx);
    const updates = await readRows('relacionamentos/anime_status.json', animeStatus, { ...report }, ctx);
    const rows = applyFinalStatus(source, updates, report.avisos);
    for (const row of rows) resolveImagePath(row.capaUrl, report, row.id);
    const [estudios, status, franquias, estacoes] = await Promise.all([
      ctx.prisma.estudio.findMany({ select: { id: true } }),
      ctx.prisma.status.findMany({ select: { id: true } }),
      ctx.prisma.franquia.findMany({ select: { id: true } }),
      ctx.prisma.estacao.findMany({ select: { id: true } }),
    ]);
    assertReferences(rows.map(row => row.estudioId), estudios, 'Animes.estudioId');
    assertReferences(rows.map(row => row.statusId), status, 'Animes.statusId');
    assertReferences(rows.map(row => row.franquiaId), franquias, 'Animes.franquiaId');
    assertReferences(rows.map(row => row.estacaoId), estacoes, 'Animes.estacaoId');
    await persistRecords(ctx, report, rows, {
      list: (db, ids) => db.anime.findMany({ where: ids ? { id: { in: ids } } : undefined }),
      create: (db, row) => db.anime.create({ data: row }),
      update: (db, id, data) => db.anime.update({ where: { id }, data }),
    });
  }, context);
}

runDirect(import.meta.url, main);
