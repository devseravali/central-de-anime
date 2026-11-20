import { describe, expect, it, vi } from 'vitest';
import { inspectSchema } from '../../../scripts/database/inspection';
import type pg from 'pg';

describe('Inspecao Supabase somente leitura', () => {
  it('nao oculta falhas de permissao ou timeout', async () => {
    const query = vi.fn().mockRejectedValue(new Error('permission denied'));
    await expect(inspectSchema({ query } as Pick<pg.Client, 'query'>)).rejects.toThrow('permission denied');
    expect(query).toHaveBeenCalledTimes(1);
  });
  it('consulta catalogos sem executar SQL de escrita', async () => {
    const query = vi.fn().mockResolvedValue({ rows: [] });
    const result = await inspectSchema({ query } as Pick<pg.Client, 'query'>);
    expect(result.counts).toEqual({});
    expect(result.visibility).toContain('RLS');
    expect(query.mock.calls.every(([sql]) => /^\s*select\b/i.test(sql))).toBe(true);
  });
});
