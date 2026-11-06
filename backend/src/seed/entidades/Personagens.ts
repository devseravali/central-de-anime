import type { SeedContext } from '../config/context';
import { readRows } from '../utils/arquivos';
import { executeSeed, runDirect } from '../utils/executar';
import { normalizeImage } from '../utils/imagens';
import { persistRecords } from '../utils/persistencia';
import { personagem } from '../validacoes/schemas';

export function main(context?: SeedContext) {
  return executeSeed('Personagens', async (ctx, report) => {
    const source = await readRows('entidades/personagens.json', personagem, report);
    const rows = source.map(row => ({ ...row, imagem: normalizeImage(row.imagem, report, row.id)! }));
    await persistRecords(ctx, report, rows, {
      list: (db, ids) => db.personagem.findMany({ where: ids ? { id: { in: ids } } : undefined }),
      create: (db, row) => db.personagem.create({ data: row }),
      update: (db, id, data) => db.personagem.update({ where: { id }, data }),
    });
  }, context);
}

runDirect(import.meta.url, main);
