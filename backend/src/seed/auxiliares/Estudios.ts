import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { persistRecords } from '../utils/persistencia';
import { estudio } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('Estudios', async (ctx, report) => {
    const rows = await readRows('entidades/estudios.json', estudio, report);
    await persistRecords(ctx, report, rows, {
      list: (db, ids) => db.estudio.findMany({ where: ids ? { id: { in: ids } } : undefined }),
      create: (db, row) => db.estudio.create({ data: row }),
      update: (db, id, data) => db.estudio.update({ where: { id }, data }),
      unique: ['nome'],
    });
  }, context);
}

runDirect(import.meta.url, main);
