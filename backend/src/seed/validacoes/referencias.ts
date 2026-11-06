import { SeedInputError } from '../utils/relatorio';

export function assertReferences(
  values: (number | null)[],
  existing: { id: number }[],
  description: string,
): void {
  const ids = new Set(existing.map(row => row.id));
  const missing = [...new Set(values.filter((value): value is number => value !== null && !ids.has(value)))];
  if (missing.length) throw new SeedInputError(`${description}: IDs ausentes ${missing.join(', ')}.`);
}
