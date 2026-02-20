import { describe, it, expect } from 'vitest';
import * as estatisticasHelper from '../src/helpers/estatisticasHelper';

describe('estatisticasHelper', () => {
  it('deve calcular média corretamente', () => {
    const result = estatisticasHelper.calcularMedia([2, 4, 6, 8]);
    expect(result).toBe(5);
  });

  it('deve retornar 0 para array vazio', () => {
    const result = estatisticasHelper.calcularMedia([]);
    expect(result).toBe(0);
  });
});
