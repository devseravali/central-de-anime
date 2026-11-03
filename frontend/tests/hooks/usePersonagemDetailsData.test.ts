// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { favoritoService } from '../../src/services/favorito.service';
import { personagemService } from '../../src/services/personagem.service';
import { userService } from '../../src/services/user.service';
import type { Personagem } from '../../src/types/Personagem';
import { usePersonagemDetailsData } from '../../src/hooks/UsePersonagemDetailsData/usePersonagemDetailsData';
import { createDeferred } from './deferred';

vi.mock('../../src/services/favorito.service', () => ({
  favoritoService: {
    PersonagensFavoritos: vi.fn(),
    FavoritarPersonagem: vi.fn(),
    DesfavoritarPersonagem: vi.fn(),
  },
}));

vi.mock('../../src/services/personagem.service', () => ({
  personagemService: {
    listarPersonagens: vi.fn(),
    listarPersonagensPorUrl: vi.fn(),
    listarPersonagensPorId: vi.fn(),
    buscarPersonagemPorUrl: vi.fn(),
  },
}));

vi.mock('../../src/services/user.service', () => ({
  userService: {
    buscarMeuPerfil: vi.fn(),
    atualizarMeuPerfil: vi.fn(),
    listarUsuarios: vi.fn(),
    promoverUsuario: vi.fn(),
    buscarUsuario: vi.fn(),
    atualizarUsuario: vi.fn(),
    excluirUsuario: vi.fn(),
  },
}));

const buscarPersonagemPorId = vi.mocked(
  personagemService.listarPersonagensPorId,
);
const buscarPerfil = vi.mocked(userService.buscarMeuPerfil);
const listarFavoritos = vi.mocked(favoritoService.PersonagensFavoritos);
const favoritar = vi.mocked(favoritoService.FavoritarPersonagem);
const desfavoritar = vi.mocked(favoritoService.DesfavoritarPersonagem);

const makePersonagem = (
  id: number,
  relatedIds: number[] = [],
): Personagem => ({
  id,
  nome: `Personagem ${id}`,
  animes: [
    {
      animeId: id,
      anime: {
        id,
        titulo: `Anime ${id}`,
        personagens: [id, ...relatedIds].map((personagemId) => ({
          personagem: {
            id: personagemId,
            nome: `Personagem ${personagemId}`,
          },
        })),
      },
    },
  ],
});

const loadProfile = () =>
  buscarPerfil.mockResolvedValue({
    message: 'Perfil carregado',
    usuario: {
      id: 7,
      nome: 'Usuário de teste',
      email: 'teste@example.test',
      avatar: null,
      status: 'ativo',
    },
  });

describe('usePersonagemDetailsData', () => {
  afterEach(cleanup);

  beforeEach(() => {
    buscarPersonagemPorId.mockReset();
    buscarPerfil.mockReset();
    listarFavoritos.mockReset();
    favoritar.mockReset();
    desfavoritar.mockReset();
  });

  it('carrega o personagem, identifica favoritos e limita relacionados únicos a quatro', async () => {
    buscarPersonagemPorId.mockResolvedValue(
      makePersonagem(1, [2, 3, 2, 4, 5, 6]),
    );
    loadProfile();
    listarFavoritos.mockResolvedValue([makePersonagem(1)]);

    const { result } = renderHook(() => usePersonagemDetailsData(1, true));

    expect(result.current.loading).toBe(true);
    await waitFor(() =>
      expect(listarFavoritos).toHaveBeenCalledWith(7),
    );

    await waitFor(() =>
      expect(result.current).toMatchObject({
        personagem: { id: 1, nome: 'Personagem 1' },
        related: [
          { id: 2, nome: 'Personagem 2' },
          { id: 3, nome: 'Personagem 3' },
          { id: 4, nome: 'Personagem 4' },
          { id: 5, nome: 'Personagem 5' },
        ],
        loading: false,
        error: null,
        isFavorite: true,
      }),
    );
  });

  it('expõe erro quando o carregamento do personagem falha', async () => {
    buscarPersonagemPorId.mockRejectedValue(new Error('Personagem indisponível'));

    const { result } = renderHook(() => usePersonagemDetailsData(99, true));

    await waitFor(() =>
      expect(result.current).toMatchObject({
        loading: false,
        error: 'Personagem indisponível',
        personagem: null,
      }),
    );
    expect(buscarPerfil).not.toHaveBeenCalled();
    expect(listarFavoritos).not.toHaveBeenCalled();
  });

  it('não permite que uma resposta antiga de outro ID substitua o personagem atual', async () => {
    const requestA = createDeferred<Personagem>();
    const requestB = createDeferred<Personagem>();
    buscarPersonagemPorId.mockImplementation((id) =>
      Number(id) === 1 ? requestA.promise : requestB.promise,
    );
    loadProfile();
    listarFavoritos.mockResolvedValue([]);

    const { result, rerender } = renderHook(
      ({ id }) => usePersonagemDetailsData(id, true),
      { initialProps: { id: 1 } },
    );
    await waitFor(() =>
      expect(buscarPersonagemPorId).toHaveBeenCalledTimes(1),
    );

    rerender({ id: 2 });
    await waitFor(() =>
      expect(buscarPersonagemPorId).toHaveBeenCalledTimes(2),
    );

    await act(async () => {
      requestB.resolve(makePersonagem(2, [3]));
      await requestB.promise;
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      requestA.resolve(makePersonagem(1, [9]));
      await requestA.promise;
    });

    expect(result.current).toMatchObject({
      personagem: { id: 2 },
      related: [{ id: 3, nome: 'Personagem 3' }],
      loading: false,
      error: null,
    });
  });

  it('ignora falha tardia do personagem invalidado', async () => {
    const requestA = createDeferred<Personagem>();
    const requestB = createDeferred<Personagem>();
    buscarPersonagemPorId.mockImplementation((id) =>
      Number(id) === 1 ? requestA.promise : requestB.promise,
    );
    loadProfile();
    listarFavoritos.mockResolvedValue([]);

    const { result, rerender } = renderHook(
      ({ id }) => usePersonagemDetailsData(id, true),
      { initialProps: { id: 1 } },
    );
    await waitFor(() =>
      expect(buscarPersonagemPorId).toHaveBeenCalledTimes(1),
    );
    rerender({ id: 2 });
    await waitFor(() =>
      expect(buscarPersonagemPorId).toHaveBeenCalledTimes(2),
    );

    await act(async () => {
      requestB.resolve(makePersonagem(2));
      await requestB.promise;
    });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      requestA.reject(new Error('Falha antiga'));
      await requestA.promise.catch(() => undefined);
    });

    expect(result.current).toMatchObject({
      personagem: { id: 2 },
      loading: false,
      error: null,
    });
  });

  it('cancela o fluxo pendente ao desmontar antes de buscar perfil e favoritos', async () => {
    const request = createDeferred<Personagem>();
    buscarPersonagemPorId.mockReturnValue(request.promise);

    const { unmount } = renderHook(() =>
      usePersonagemDetailsData(1, true),
    );
    await waitFor(() =>
      expect(buscarPersonagemPorId).toHaveBeenCalledOnce(),
    );

    unmount();
    await act(async () => {
      request.resolve(makePersonagem(1));
      await request.promise;
    });

    expect(buscarPerfil).not.toHaveBeenCalled();
    expect(listarFavoritos).not.toHaveBeenCalled();
  });

  it('atualiza o estado de favorito apenas depois da mutation concluir', async () => {
    buscarPersonagemPorId.mockResolvedValue(makePersonagem(1));
    loadProfile();
    listarFavoritos.mockResolvedValue([makePersonagem(1)]);
    const request = createDeferred<void>();
    desfavoritar.mockReturnValue(request.promise);

    const { result } = renderHook(() => usePersonagemDetailsData(1, true));
    await waitFor(() => expect(result.current.isFavorite).toBe(true));

    let toggle!: Promise<void>;
    act(() => {
      toggle = result.current.handleToggleFavorite();
    });

    expect(desfavoritar).toHaveBeenCalledWith(1);
    expect(result.current.favoriteLoading).toBe(true);
    expect(result.current.isFavorite).toBe(true);

    await act(async () => {
      request.resolve();
      await toggle;
    });

    expect(result.current).toMatchObject({
      isFavorite: false,
      favoriteLoading: false,
      favoriteError: null,
    });
  });

  it('apresenta erro quando a mutation de favorito falha', async () => {
    buscarPersonagemPorId.mockResolvedValue(makePersonagem(1));
    loadProfile();
    listarFavoritos.mockResolvedValue([]);
    favoritar.mockRejectedValue(new Error('Falha de serviço'));

    const { result } = renderHook(() => usePersonagemDetailsData(1, true));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleToggleFavorite();
    });

    expect(result.current).toMatchObject({
      isFavorite: false,
      favoriteLoading: false,
      favoriteError: 'Não foi possível atualizar favorito agora.',
    });
    expect(favoritar).toHaveBeenCalledWith(1);
  });

  it('solicita login quando usuário não autenticado tenta alterar favoritos', async () => {
    buscarPersonagemPorId.mockResolvedValue(makePersonagem(1));
    buscarPerfil.mockRejectedValue(new Error('Não autenticado'));

    const { result } = renderHook(() => usePersonagemDetailsData(1, true));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.handleToggleFavorite();
    });

    expect(result.current.favoriteError).toBe(
      'Faça login para atualizar os favoritos.',
    );
    expect(favoritar).not.toHaveBeenCalled();
    expect(desfavoritar).not.toHaveBeenCalled();
  });
});
