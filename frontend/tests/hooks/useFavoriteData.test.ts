// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFavoriteData } from '../../src/hooks/UseFavoriteData/useFavoriteData';
import { clearAuthSession, setAccessToken } from '../../src/services/api';
import { episodioService } from '../../src/services/episodio.service';
import { favoritoService } from '../../src/services/favorito.service';
import { userService } from '../../src/services/user.service';
import {
  episodes,
  favoriteAnime,
  httpResponse,
  profile,
} from '../fixtures/userData';
import { createDeferred } from './deferred';

describe('useFavoriteData', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'sessao-a');
    vi.spyOn(userService, 'buscarMeuPerfil').mockResolvedValue(profile());
    vi.spyOn(episodioService, 'listarEpisodios').mockResolvedValue(episodes);
    vi.spyOn(favoritoService, 'AnimesFavoritos').mockResolvedValue([
      favoriteAnime,
    ]);
    vi.spyOn(favoritoService, 'PersonagensFavoritos').mockResolvedValue([
      { id: 20, nome: 'Personagem' },
    ]);
    vi.spyOn(favoritoService, 'Desfavoritar').mockResolvedValue();
    vi.spyOn(favoritoService, 'DesfavoritarPersonagem').mockResolvedValue();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('inicia carregando e publica listas e contagem de episódios para o usuário da sessão', async () => {
    const request = createDeferred<ReturnType<typeof profile>>();
    vi.mocked(userService.buscarMeuPerfil).mockReturnValue(request.promise);
    const { result } = renderHook(useFavoriteData);
    expect(result.current).toMatchObject({
      loading: true,
      animeFavorites: [],
      characterFavorites: [],
      userId: null,
    });

    await act(async () => {
      request.resolve(profile());
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({
      userId: 7,
      animeFavorites: [favoriteAnime],
      characterFavorites: [{ id: 20, nome: 'Personagem' }],
      episodeCounts: { 10: 2 },
      error: null,
    });
    expect(favoritoService.AnimesFavoritos).toHaveBeenCalledWith(7);
  });

  it('distingue lista vazia bem-sucedida de erro de consulta', async () => {
    vi.mocked(favoritoService.AnimesFavoritos).mockResolvedValue([]);
    vi.mocked(favoritoService.PersonagensFavoritos).mockResolvedValue([]);
    const { result } = renderHook(useFavoriteData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({
      animeFavorites: [],
      error: null,
      userId: 7,
    });

    vi.mocked(favoritoService.AnimesFavoritos).mockRejectedValue(
      new Error('Falha'),
    );
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      'Não foi possível carregar os favoritos. Tente novamente.',
    );
    expect(result.current.userId).toBeNull();
  });

  it('preserva favoritos se a fonte auxiliar de episódios falhar', async () => {
    vi.mocked(episodioService.listarEpisodios).mockRejectedValue(
      new Error('Falha'),
    );
    const { result } = renderHook(useFavoriteData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.animeFavorites).toEqual([favoriteAnime]);
    expect(result.current.characterFavorites).toHaveLength(1);
    expect(result.current.error).toBeNull();
    expect(result.current.auxiliaryError).toBe(
      'A contagem de episódios não está disponível no momento.',
    );
    expect(result.current.episodesLoading).toBe(false);
  });

  it.each(['anime', 'personagem'] as const)(
    'remove favorito de %s somente após sucesso',
    async (type) => {
      const request = createDeferred<void>();
      const service =
        type === 'anime'
          ? vi.mocked(favoritoService.Desfavoritar)
          : vi.mocked(favoritoService.DesfavoritarPersonagem);
      service.mockReturnValue(request.promise);
      const id = type === 'anime' ? 10 : 20;
      const { result } = renderHook(useFavoriteData);
      await waitFor(() => expect(result.current.loading).toBe(false));
      let action!: Promise<void>;
      act(() => {
        action = result.current.removeFavorite({ id, type });
      });
      expect(result.current.removingKey).toBe(`${type}-${id}`);
      expect(result.current.animeFavorites).toHaveLength(1);
      expect(service).toHaveBeenCalledWith(id);
      await act(async () => {
        request.resolve();
        await action;
      });
      expect(
        type === 'anime'
          ? result.current.animeFavorites
          : result.current.characterFavorites,
      ).toEqual([]);
      expect(result.current.removingKey).toBeNull();
    },
  );

  it('mantém o favorito e expõe actionError quando a remoção falha', async () => {
    vi.mocked(favoritoService.Desfavoritar).mockRejectedValue(
      new Error('Falha'),
    );
    const { result } = renderHook(useFavoriteData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.removeFavorite({ id: 10, type: 'anime' });
    });
    expect(result.current.animeFavorites).toEqual([favoriteAnime]);
    expect(result.current.actionError).toBe(
      'Não foi possível remover este item dos favoritos.',
    );
    expect(result.current.removingKey).toBeNull();
  });

  it('ignora dados da consulta A que chega após a nova sessão B', async () => {
    const oldRequest = createDeferred<ReturnType<typeof profile>>();
    vi.mocked(userService.buscarMeuPerfil)
      .mockReturnValueOnce(oldRequest.promise)
      .mockResolvedValue(profile(8));
    const { result } = renderHook(useFavoriteData);
    act(() => setAccessToken('sessao-b'));
    await waitFor(() => expect(result.current.userId).toBe(8));
    await act(async () => {
      oldRequest.resolve(profile(7));
    });
    expect(result.current.userId).toBe(8);
    expect(favoritoService.AnimesFavoritos).toHaveBeenCalledTimes(1);
    expect(favoritoService.AnimesFavoritos).toHaveBeenCalledWith(8);
  });

  it('logout invalida remoção pendente sem restaurar dados privados', async () => {
    const request = createDeferred<void>();
    vi.mocked(favoritoService.Desfavoritar).mockReturnValue(request.promise);
    const { result } = renderHook(useFavoriteData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    let action!: Promise<void>;
    act(() => {
      action = result.current.removeFavorite({ id: 10, type: 'anime' });
    });
    act(() => clearAuthSession());
    await act(async () => {
      request.resolve();
      await action;
    });
    expect(result.current).toMatchObject({
      sessionAvailable: false,
      loading: false,
      userId: null,
      animeFavorites: [],
      characterFavorites: [],
      removingKey: null,
      actionError: null,
    });
  });

  it('logout invalida consulta pendente de favoritos', async () => {
    const request = createDeferred<(typeof favoriteAnime)[]>();
    vi.mocked(favoritoService.AnimesFavoritos).mockReturnValue(request.promise);
    const { result } = renderHook(useFavoriteData);
    await waitFor(() =>
      expect(favoritoService.AnimesFavoritos).toHaveBeenCalledOnce(),
    );
    act(() => clearAuthSession());
    await act(async () => {
      request.resolve([favoriteAnime]);
    });
    expect(result.current).toMatchObject({
      sessionAvailable: false,
      loading: false,
      userId: null,
      animeFavorites: [],
      characterFavorites: [],
      error: null,
    });
  });

  it('sessão expirada ao buscar perfil é erro de consulta, não favoritos vazios confirmados', async () => {
    const response = httpResponse({ message: 'token interno expirado' });
    response.status = 401;
    vi.mocked(userService.buscarMeuPerfil).mockRejectedValue(
      new AxiosError(
        'Sessão expirada',
        undefined,
        response.config,
        undefined,
        response,
      ),
    );
    const { result } = renderHook(useFavoriteData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(
      'Não foi possível carregar os favoritos. Tente novamente.',
    );
    expect(result.current.userId).toBeNull();
    expect(favoritoService.AnimesFavoritos).not.toHaveBeenCalled();
  });

  it('sem token não consulta serviços nem permite remover favorito', async () => {
    localStorage.clear();
    const { result } = renderHook(useFavoriteData);
    expect(result.current.sessionAvailable).toBe(false);
    expect(userService.buscarMeuPerfil).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.removeFavorite({ id: 10, type: 'anime' });
    });
    expect(result.current.actionError).toBe(
      'Sessão de usuário indisponível para remover favorito.',
    );
    expect(favoritoService.Desfavoritar).not.toHaveBeenCalled();
  });
});
