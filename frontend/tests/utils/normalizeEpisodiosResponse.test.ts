import { describe, expect, it } from 'vitest';
import { normalizeEpisodiosResponse } from '../../src/utils/normalizeEpisodiosResponse';
import type { Episodio } from '../../src/types/Episodio';

const episodes: Episodio[] = [
  { id: 1, titulo: 'Episódio 1', numero: 1 },
  { id: 2, titulo: 'Episódio 2', numero: 2 },
];

describe('normalizeEpisodiosResponse', () => {
  it('retorna diretamente a lista recebida', () => {
    expect(normalizeEpisodiosResponse(episodes)).toBe(episodes);
  });

  it('extrai episódios de uma resposta paginada', () => {
    expect(
      normalizeEpisodiosResponse({ items: episodes }),
    ).toEqual(episodes);
  });

  it('retorna lista vazia quando a resposta paginada omite items', () => {
    expect(normalizeEpisodiosResponse({})).toEqual([]);
    expect(normalizeEpisodiosResponse({ items: undefined })).toEqual([]);
  });
});
