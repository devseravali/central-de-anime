import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { normalizeImage } from '../utils/imagens';
import { persistRecords } from '../utils/persistencia';
import { capa } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('Capas', async (ctx, report) => {
    const rows = await readRows('entidades/capa.json', capa, report);
    for (const row of rows) normalizeImage(row.caminho, report, row.id);
    await persistRecords(ctx, report, rows, {
      list: (db, ids) => db.capas.findMany({ where: ids ? { id: { in: ids } } : undefined }),
      create: (db, row) => db.capas.create({ data: row }),
      update: (db, id, data) => db.capas.update({ where: { id }, data }),
      unique: ['caminho'],
    });
  }, context);
}

runDirect(import.meta.url, main);
