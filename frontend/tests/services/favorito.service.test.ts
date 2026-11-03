import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../src/services/api';
import { favoritoService } from '../../src/services/favorito.service';
import { favoriteAnime, httpResponse } from '../fixtures/userData';

vi.mock('../../src/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn() },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('favoritoService', () => {
  it('consulta favoritos do usuário com relações opcionais nulas preservadas', async () => {
    const character = { id: 20, nome: 'Personagem' };
    vi.mocked(api.get)
      .mockResolvedValueOnce(httpResponse([favoriteAnime]))
      .mockResolvedValueOnce(httpResponse([character]));
    await expect(favoritoService.AnimesFavoritos(7)).resolves.toEqual([
      favoriteAnime,
    ]);
    await expect(favoritoService.PersonagensFavoritos(7)).resolves.toEqual([
      character,
    ]);
    expect(api.get).toHaveBeenNthCalledWith(1, '/usuarios/7/favoritos/animes');
    expect(api.get).toHaveBeenNthCalledWith(
      2,
      '/usuarios/7/favoritos/personagens',
    );
  });

  it.each([
    ['anime', favoritoService.AnimesFavoritos],
    ['personagem', favoritoService.PersonagensFavoritos],
  ] as const)(
    'distingue lista vazia e rejeição na consulta de %s',
    async (_name, method) => {
      vi.mocked(api.get).mockResolvedValueOnce(httpResponse([]));
      await expect(method(7)).resolves.toEqual([]);
      const failure = new Error('Falha');
      vi.mocked(api.get).mockRejectedValueOnce(failure);
      await expect(method(7)).rejects.toBe(failure);
    },
  );

  it.each([
    ['/animes/10/favoritar', favoritoService.Favoritar],
    ['/animes/10/desfavoritar', favoritoService.Desfavoritar],
    ['/personagens/10/favoritar', favoritoService.FavoritarPersonagem],
    ['/personagens/10/desfavoritar', favoritoService.DesfavoritarPersonagem],
  ] as const)(
    'usa POST %s e propaga falhas da mutation',
    async (url, method) => {
      vi.mocked(api.post).mockResolvedValueOnce(httpResponse(undefined));
      await expect(method(10)).resolves.toBeUndefined();
      expect(api.post).toHaveBeenCalledWith(url);
      const failure = new Error('Falha');
      vi.mocked(api.post).mockRejectedValueOnce(failure);
      await expect(method(10)).rejects.toBe(failure);
    },
  );
});
