import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { persistRecords } from '../utils/persistencia';
import { named } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('Status', async (ctx, report) => {
    const rows = await readRows('entidades/status.json', named, report);
    await persistRecords(ctx, report, rows, {
      list: (db, ids) => db.status.findMany({ where: ids ? { id: { in: ids } } : undefined }),
      create: (db, row) => db.status.create({ data: row }),
      update: (db, id, data) => db.status.update({ where: { id }, data }),
      unique: ['nome'],
    });
  }, context);
}

runDirect(import.meta.url, main);
