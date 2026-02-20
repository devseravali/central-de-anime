import { describe, it, expect } from 'vitest';
import {
  validarEstacaoPayload,
  validarAnimePayload,
} from '../src/utils/validacao';

describe('validacao utils', () => {
  it('deve validar payload de estação corretamente', () => {
    const valido = validarEstacaoPayload({ nome: 'Verão', slug: 'verao' });
    expect(valido).toEqual({ nome: 'Verão', slug: 'verao' });
    const invalido = validarEstacaoPayload({ nome: '', slug: '' });
    expect(invalido).toBe(false);
  });

  it('deve validar payload de anime corretamente', () => {
    const valido = validarAnimePayload({
      anime_id: 1,
      estudio_id: 1,
      slug: 'naruto',
      titulo: 'Naruto',
    });
    expect(valido).toMatchObject({
      anime_id: 1,
      estudio_id: 1,
      slug: 'naruto',
      titulo: 'Naruto',
    });
    const invalido = validarAnimePayload({});
    expect(invalido).toBe(false);
  });
});

describe('validacao utils - testes extras', () => {
  it('deve rejeitar tipos errados em estação', () => {
    expect(validarEstacaoPayload({ nome: 123, slug: true })).toBe(false);
    expect(validarEstacaoPayload({})).toBe(false);
    expect(validarEstacaoPayload(null as any)).toBe(false);
    expect(validarEstacaoPayload(undefined as any)).toBe(false);
  });

  it('deve aceitar campos extras em estação (ignora extras)', () => {
    const result = validarEstacaoPayload({
      nome: 'Verão',
      slug: 'verao',
      extra: 1,
    });
    expect(result).toMatchObject({ nome: 'Verão', slug: 'verao' });
  });

  it('deve rejeitar tipos errados em anime', () => {
    expect(
      validarAnimePayload({
        anime_id: 'a',
        estudio_id: [],
        slug: 1,
        titulo: {},
      }),
    ).toBe(false);
    expect(validarAnimePayload(null as any)).toBe(false);
    expect(validarAnimePayload(undefined as any)).toBe(false);
  });

  it('deve aceitar campos extras em anime (ignora extras)', () => {
    const result = validarAnimePayload({
      anime_id: 1,
      estudio_id: 1,
      slug: 'slug',
      titulo: 't',
      extra: 2,
    });
    expect(result).toMatchObject({
      anime_id: 1,
      estudio_id: 1,
      slug: 'slug',
      titulo: 't',
    });
  });

  it('deve rejeitar payloads vazios', () => {
    expect(validarEstacaoPayload({})).toBe(false);
    expect(validarAnimePayload({})).toBe(false);
  });
});
