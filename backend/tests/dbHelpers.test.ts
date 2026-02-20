import { describe, it, expect } from 'vitest';
import * as dbHelpers from '../src/helpers/dbHelpers';

describe('dbHelpers', () => {
  it('deve formatar datas corretamente', () => {
    const data = new Date('2023-01-01T00:00:00Z');
    const formatada = dbHelpers.formatarData(data);
    expect(typeof formatada).toBe('string');
    expect(formatada).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});
