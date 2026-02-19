// Formata uma data para o padrão YYYY-MM-DD
export function formatarData(data: Date): string {
  return data.toISOString().slice(0, 10);
}
import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function contarTabela(table: unknown): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(table as any);

  return count;
}
