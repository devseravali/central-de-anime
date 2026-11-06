import type { SeedContext, SeedDatabase } from '../config/context';
import { assertUnique } from './arquivos';
import { SeedInputError, type SeedReport } from './relatorio';

export type RecordStore<T extends { id: number }> = {
  list: (db: SeedDatabase, ids?: number[]) => Promise<T[]>;
  create: (db: SeedDatabase, row: T) => Promise<unknown>;
  update: (db: SeedDatabase, id: number, fields: Omit<T, 'id'>) => Promise<unknown>;
  unique?: (keyof T)[];
};

export function equalFields<T extends object>(existing: T, desired: T): boolean {
  return Object.keys(desired).every(key => {
    const k = key as keyof T;
    const left = existing[k];
    const right = desired[k];
    return left instanceof Date && right instanceof Date
      ? left.getTime() === right.getTime()
      : left === right;
  });
}

export async function persistRecords<T extends { id: number }>(
  context: SeedContext,
  report: SeedReport,
  rows: T[],
  store: RecordStore<T>,
): Promise<void> {
  assertUnique(rows, row => row.id, report.modulo);
  const existing = await store.list(context.prisma);
  for (const key of store.unique ?? []) {
    assertUnique(rows, row => row[key], `${report.modulo}.${String(key)}`);
    const owners = new Map(existing.map(row => [row[key], row.id]));
    for (const row of rows) {
      const owner = owners.get(row[key]);
      if (owner !== undefined && owner !== row.id) {
        throw new SeedInputError(`${report.modulo}: conflito de identidade no campo ${String(key)}, id=${row.id}, existente=${owner}.`);
      }
    }
  }
  for (let offset = 0; offset < rows.length; offset += 50) {
    const batch = rows.slice(offset, offset + 50);
    const committed = await context.prisma.$transaction(async db => {
      const current = new Map((await store.list(db, batch.map(row => row.id))).map(row => [row.id, row]));
      const counts = { inseridos: 0, atualizados: 0, inalterados: 0 };
      for (const row of batch) {
        const found = current.get(row.id);
        if (!found) {
          await store.create(db, row);
          counts.inseridos++;
        } else if (equalFields(found, row) || context.insertOnly) {
          // insertOnly: dados existentes em producao nunca sao sobrescritos.
          counts.inalterados++;
        } else {
          const { id, ...fields } = row;
          await store.update(db, id, fields);
          counts.atualizados++;
        }
      }
      return counts;
    }, { isolationLevel: 'Serializable', timeout: 60000 });
    report.inseridos += committed.inseridos;
    report.atualizados += committed.atualizados;
    report.inalterados += committed.inalterados;
  }
}

export async function persistPairs<T>(
  context: SeedContext,
  report: SeedReport,
  rows: T[],
  key: (row: T) => string,
  store: {
    list: (db: SeedDatabase) => Promise<T[]>;
    createMany: (db: SeedDatabase, rows: T[]) => Promise<{ count: number }>;
  },
): Promise<void> {
  assertUnique(rows, key, report.modulo);
  for (let offset = 0; offset < rows.length; offset += 100) {
    const batch = rows.slice(offset, offset + 100);
    const committed = await context.prisma.$transaction(async db => {
      const existing = new Set((await store.list(db)).map(key));
      const missing = batch.filter(row => !existing.has(key(row)));
      const inserted = missing.length ? (await store.createMany(db, missing)).count : 0;
      if (inserted !== missing.length) {
        throw new SeedInputError(`${report.modulo}: contagem de persistencia inesperada.`);
      }
      return { inserted, unchanged: batch.length - missing.length };
    }, { isolationLevel: 'Serializable', timeout: 60000 });
    report.inseridos += committed.inserted;
    report.inalterados += committed.unchanged;
  }
}
