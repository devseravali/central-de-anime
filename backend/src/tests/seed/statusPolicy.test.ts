import { describe, expect, it } from 'vitest';
import { applyFinalStatus } from '../../seed/utils/status';

describe('Precedencia definitiva de status', () => {
  it('aplica overlay, preserva fallback e nao modifica as fontes', () => {
    const source = [{ id: 1, statusId: 1 }, { id: 2, statusId: 3 }];
    const updates = [{ animeId: 1, statusId: 2 }];
    const warnings: string[] = [];
    const result = applyFinalStatus(source, updates, warnings);
    expect(result).toEqual([{ id: 1, statusId: 2 }, { id: 2, statusId: 3 }]);
    expect(source[0].statusId).toBe(1);
    expect(warnings).toHaveLength(1);
    expect(applyFinalStatus(result, updates, [])).toEqual(result);
  });
  it('rejeita atualizacoes de animes ausentes e duplicadas', () => {
    expect(() => applyFinalStatus([], [{ animeId: 1, statusId: 2 }], [])).toThrow('ausente');
    expect(() => applyFinalStatus([{ id: 1, statusId: 1 }],
      [{ animeId: 1, statusId: 1 }, { animeId: 1, statusId: 2 }], [])).toThrow('duplicada');
  });
});
