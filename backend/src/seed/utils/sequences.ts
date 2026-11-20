import type { SeedDatabase } from '../config/context';

export const SEQUENCE_TABLES = [
  'Status', 'Genero', 'Estudio', 'Plataforma', 'AnimeTag', 'Franquia', 'Capas',
  'Estacao', 'Anime', 'Personagem', 'Episodio',
] as const;

export async function synchronizeSequences(db: SeedDatabase): Promise<void> {
  for (const table of SEQUENCE_TABLES) {
    await db.$executeRawUnsafe(`LOCK TABLE public."${table}" IN ACCESS EXCLUSIVE MODE`);
    const [identity] = await db.$queryRawUnsafe<{ sequence: string | null; next: bigint }[]>(
      `SELECT pg_get_serial_sequence('public."${table}"', 'id') as sequence,
       greatest(coalesce(max(id), 0) + 1, 1)::bigint as next FROM public."${table}"`,
    );
    if (!identity?.sequence || identity.next > 2147483647n) throw new Error(`Sequence invalida ou esgotada: ${table}.`);
    // ALTER SEQUENCE RESTART is transactional, unlike setval.
    const parts = identity.sequence.split('.');
    if (parts.length !== 2) throw new Error(`Nome de sequence invalido: ${table}.`);
    const quoted = parts.map(part => `"${part.replace(/^"|"$/g, '').replace(/"/g, '""')}"`).join('.');
    const [current] = await db.$queryRawUnsafe<{ last_value: bigint; is_called: boolean }[]>(
      `SELECT last_value::bigint,is_called FROM ${quoted}`,
    );
    if (!current) throw new Error(`Estado de sequence ausente: ${table}.`);
    const allocated = current.last_value + (current.is_called ? 1n : 0n);
    const next = allocated > identity.next ? allocated : identity.next;
    if (next > 2147483647n) throw new Error(`Sequence esgotada: ${table}.`);
    await db.$executeRawUnsafe(`ALTER SEQUENCE ${quoted} RESTART WITH ${next}`);
  }
}
