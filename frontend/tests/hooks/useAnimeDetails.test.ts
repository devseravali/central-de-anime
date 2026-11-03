// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAnimeDetails } from '../../src/hooks/UseAnimeDetails/useAnimeDetails';
import { animeService } from '../../src/services/anime.service';
import { favoritoService } from '../../src/services/favorito.service';
import { temporadaService } from '../../src/services/temporada.service';
import { userService } from '../../src/services/user.service';
import { anime, favoriteAnime, profile } from '../fixtures/userData';
import { createDeferred } from './deferred';

describe('useAnimeDetails favorites', () => {
  beforeEach(() => {
    vi.spyOn(animeService, 'buscarAnime').mockResolvedValue(anime);
    vi.spyOn(temporadaService, 'listarTemporadasPorAnime').mockResolvedValue(
      [],
    );
    vi.spyOn(userService, 'buscarMeuPerfil').mockResolvedValue(profile());
    vi.spyOn(favoritoService, 'AnimesFavoritos').mockResolvedValue([]);
    vi.spyOn(favoritoService, 'Favoritar').mockResolvedValue();
    vi.spyOn(favoritoService, 'Desfavoritar').mockResolvedValue();
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('consulta favoritos antes de determinar a ausência e adiciona somente após sucesso', async () => {
    const request = createDeferred<void>();
    vi.mocked(favoritoService.Favoritar).mockReturnValue(request.promise);
    const { result } = renderHook(() => useAnimeDetails('10'));
    await waitFor(() =>
      expect(favoritoService.AnimesFavoritos).toHaveBeenCalledWith(7),
    );
    expect(result.current.isFavorite).toBe(false);
    let action!: Promise<void>;
    act(() => {
      action = result.current.handleToggleFavorite();
    });
    expect(result.current.favoriteLoading).toBe(true);
    expect(result.current.isFavorite).toBe(false);
    expect(favoritoService.Favoritar).toHaveBeenCalledWith(10);
    await act(async () => {
      request.resolve();
      await action;
    });
    expect(result.current).toMatchObject({
      isFavorite: true,
      favoriteLoading: false,
      favoriteError: null,
    });
  });

  it('remove favorito identificado no resultado da consulta', async () => {
    vi.mocked(favoritoService.AnimesFavoritos).mockResolvedValue([
      favoriteAnime,
    ]);
    const { result } = renderHook(() => useAnimeDetails('10'));
    await waitFor(() => expect(result.current.isFavorite).toBe(true));
    await act(async () => {
      await result.current.handleToggleFavorite();
    });
    expect(favoritoService.Desfavoritar).toHaveBeenCalledWith(10);
    expect(result.current.isFavorite).toBe(false);
  });

  it('mantém estado de favorito quando a mutation falha', async () => {
    vi.mocked(favoritoService.AnimesFavoritos).mockResolvedValue([
      favoriteAnime,
    ]);
    vi.mocked(favoritoService.Desfavoritar).mockRejectedValue(
      new Error('Falha'),
    );
    const { result } = renderHook(() => useAnimeDetails('10'));
    await waitFor(() => expect(result.current.isFavorite).toBe(true));
    await act(async () => {
      await result.current.handleToggleFavorite();
    });
    expect(result.current).toMatchObject({
      isFavorite: true,
      favoriteLoading: false,
      favoriteError: 'Não foi possível atualizar favorito agora.',
    });
  });

  it('documenta o contrato atual: falha da consulta não confirma ausência e impede mutation', async () => {
    vi.mocked(favoritoService.AnimesFavoritos).mockRejectedValue(
      new Error('Consulta indisponível'),
    );
    const { result } = renderHook(() => useAnimeDetails('10'));
    await waitFor(() =>
      expect(favoritoService.AnimesFavoritos).toHaveBeenCalledOnce(),
    );
    await act(async () => {
      await result.current.handleToggleFavorite();
    });
    expect(result.current.isFavorite).toBe(false);
    expect(result.current.favoriteError).toBe(
      'Faça login para atualizar os favoritos.',
    );
    expect(favoritoService.Favoritar).not.toHaveBeenCalled();
  });

  it('sem perfil autenticado mantém o anime visível mas não permite favoritar', async () => {
    vi.mocked(userService.buscarMeuPerfil).mockRejectedValue(
      new Error('Sessão expirada'),
    );
    const { result } = renderHook(() => useAnimeDetails('10'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.handleToggleFavorite();
    });
    expect(result.current.anime).toEqual(anime);
    expect(result.current.favoriteError).toBe(
      'Faça login para atualizar os favoritos.',
    );
    expect(favoritoService.AnimesFavoritos).not.toHaveBeenCalled();
  });
});
