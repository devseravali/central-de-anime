import { describe, it, expect } from 'vitest';
import * as textHelpers from '../src/helpers/textHelpers';

describe('textHelpers', () => {
  it('deve capitalizar texto', () => {
    expect(textHelpers.capitalizar('anime')).toBe('Anime');
  });

  it('deve retornar string vazia se input for vazio', () => {
    expect(textHelpers.capitalizar('')).toBe('');
  });
});
