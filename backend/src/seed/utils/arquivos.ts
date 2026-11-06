import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { dataRoot } from './caminhos';
import { SeedInputError, type SeedReport } from './relatorio';

export async function readRows<S extends z.ZodType>(
  relative: string,
  schema: S,
  report: SeedReport,
): Promise<z.output<S>[]> {
  let value: unknown;
  try {
    value = JSON.parse(await readFile(path.join(dataRoot, relative), 'utf8'));
  } catch {
    throw new SeedInputError(`${relative}: arquivo obrigatorio ausente, inacessivel ou JSON invalido.`);
  }
  if (!Array.isArray(value)) throw new SeedInputError(`${relative}: esperado array.`);
  report.lidos = value.length;
  const result = z.array(schema).safeParse(value);
  if (!result.success) {
    const issues = result.error.issues.map(issue => {
      const row: unknown = value[Number(issue.path[0])];
      const recordId = typeof row === 'object' && row !== null && 'id' in row ? String(row.id) : 'sem id';
      return `${relative}: registro ${String(issue.path[0])} (id=${recordId}), campo ${issue.path.slice(1).join('.')}: ${issue.code}`;
    });
    throw new SeedInputError(issues.join('; '));
  }
  report.validos = result.data.length;
  return result.data;
}

export function assertUnique<T>(rows: T[], key: (row: T) => unknown, description: string): void {
  const seen = new Set<unknown>();
  for (const row of rows) {
    const value = key(row);
    if (seen.has(value)) throw new SeedInputError(`${description}: chave duplicada ${String(value)}.`);
    seen.add(value);
  }
}
