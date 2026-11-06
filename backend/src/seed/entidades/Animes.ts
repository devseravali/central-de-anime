import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { normalizeImage } from '../utils/imagens';
import { persistRecords } from '../utils/persistencia';
import { assertReferences } from '../validacoes/referencias';
import { anime } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('Animes', async (ctx, report) => {
    const source = await readRows('entidades/animes.json', anime, report);
    const rows = source.map(row => ({ ...row, capaUrl: normalizeImage(row.capaUrl, report, row.id, true) }));
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
    report.avisos.push('statusId preservado de animes.json; AnimeStatus pode aplicar a outra fonte explicitamente.');
    await persistRecords(ctx, report, rows, {
      list: (db, ids) => db.anime.findMany({ where: ids ? { id: { in: ids } } : undefined }),
      create: (db, row) => db.anime.create({ data: row }),
      update: (db, id, data) => db.anime.update({ where: { id }, data }),
    });
  }, context);
}

runDirect(import.meta.url, main);
