import { describe, it, expect } from 'vitest';
import * as httpParsers from '../src/helpers/httpParsers';

describe('httpParsers', () => {
  it('deve parsear JSON válido', () => {
    const obj = httpParsers.parseJson('{"foo": "bar"}');
    expect(obj).toEqual({ foo: 'bar' });
  });

  it('deve retornar null para JSON inválido', () => {
    const obj = httpParsers.parseJson('invalido');
    expect(obj).toBeNull();
  });
});
