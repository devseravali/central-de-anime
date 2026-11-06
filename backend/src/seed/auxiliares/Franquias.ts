import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { persistRecords } from '../utils/persistencia';
import { franquia } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('Franquias', async (ctx, report) => {
    const rows = await readRows('entidades/franquia.json', franquia, report);
    await persistRecords(ctx, report, rows, {
      list: (db, ids) => db.franquia.findMany({ where: ids ? { id: { in: ids } } : undefined }),
      create: (db, row) => db.franquia.create({ data: row }),
      update: (db, id, data) => db.franquia.update({ where: { id }, data }),
      unique: ['nome'],
    });
  }, context);
}

runDirect(import.meta.url, main);
