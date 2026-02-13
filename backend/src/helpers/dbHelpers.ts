import { db } from '../db';
import { sql } from 'drizzle-orm';

export async function contarTabela(table: unknown): Promise<number> {
  const [{ count }] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(table as any);

  return count;
}
