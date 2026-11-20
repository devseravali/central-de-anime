import { describe, expect, it, vi } from 'vitest';
import { SEQUENCE_TABLES, synchronizeSequences } from '../../seed/utils/sequences';
import type { SeedDatabase } from '../../seed/config/context';

describe('Sequences do catalogo', () => {
  it('usa allowlist, lock e restart transacional sem reduzir sequence existente', async () => {
    const execute = vi.fn(async () => 0);
    const query = vi.fn(async (sql: string) => sql.includes('pg_get_serial_sequence')
      ? [{ sequence: 'public."catalog_id_seq"', next: 152n }]
      : [{ last_value: 200n, is_called: true }]);
    await synchronizeSequences({ $executeRawUnsafe: execute, $queryRawUnsafe: query } as unknown as SeedDatabase);
    expect(execute).toHaveBeenCalledTimes(SEQUENCE_TABLES.length * 2);
    expect(execute.mock.calls[0]).toEqual(['LOCK TABLE public."Status" IN ACCESS EXCLUSIVE MODE']);
    expect(execute.mock.calls[1]).toEqual(['ALTER SEQUENCE "public"."catalog_id_seq" RESTART WITH 201']);
    expect(JSON.stringify(execute.mock.calls)).not.toContain('setval');
  });
  it('interrompe com sequence ausente', async () => {
    const execute = vi.fn(async () => 0);
    const query = vi.fn(async () => [{ sequence: null, next: 1n }]);
    await expect(synchronizeSequences({ $executeRawUnsafe: execute, $queryRawUnsafe: query } as unknown as SeedDatabase))
      .rejects.toThrow('invalida');
    expect(execute).toHaveBeenCalledTimes(1);
  });
});
