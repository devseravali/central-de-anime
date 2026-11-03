// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  personagemService,
  type Personagem,
} from '../../src/services/personagem.service';
import { usePersonagens } from '../../src/hooks/UsePersonagens/UsePersonagens';
import { createDeferred } from './deferred';

vi.mock('../../src/services/personagem.service', () => ({
  personagemService: {
    listarPersonagens: vi.fn(),
    listarPersonagensPorUrl: vi.fn(),
    listarPersonagensPorId: vi.fn(),
    buscarPersonagemPorUrl: vi.fn(),
  },
}));

const listarPersonagens = vi.mocked(personagemService.listarPersonagens);
const makePersonagem = (id: number): Personagem => ({
  id,
  nome: `Personagem ${id}`,
});

describe('usePersonagens', () => {
  afterEach(cleanup);

  beforeEach(() => {
    listarPersonagens.mockReset();
  });

  it('inicia o carregamento e publica os personagens recebidos', async () => {
    const request = createDeferred<Personagem[]>();
    listarPersonagens.mockReturnValue(request.promise);

    const { result } = renderHook(() =>
      usePersonagens({ animeId: 12, urlBase: '/personagens' }),
    );

    await waitFor(() => expect(listarPersonagens).toHaveBeenCalledOnce());
    expect(listarPersonagens).toHaveBeenCalledWith(12, '/personagens');
    expect(result.current.loading).toBe(true);

    await act(async () => {
      request.resolve([makePersonagem(1)]);
      await request.promise;
    });

    expect(result.current).toMatchObject({
      data: [makePersonagem(1)],
      loading: false,
      error: null,
    });
  });

  it('expõe a falha da requisição e limpa os dados', async () => {
    listarPersonagens.mockRejectedValue(new Error('Falha ao carregar'));

    const { result } = renderHook(() =>
      usePersonagens({ urlBase: '/personagens' }),
    );

    await waitFor(() =>
      expect(result.current).toMatchObject({
        data: null,
        loading: false,
        error: 'Falha ao carregar',
      }),
    );
  });

  it('ignora a resposta invalidada sem encerrar o loading da requisição atual', async () => {
    const requestA = createDeferred<Personagem[]>();
    const requestB = createDeferred<Personagem[]>();
    listarPersonagens.mockImplementation((animeId) =>
      Number(animeId) === 1 ? requestA.promise : requestB.promise,
    );

    const { result, rerender } = renderHook(
      ({ animeId }) =>
        usePersonagens({ animeId, urlBase: '/personagens' }),
      { initialProps: { animeId: 1 } },
    );
    await waitFor(() => expect(listarPersonagens).toHaveBeenCalledTimes(1));

    rerender({ animeId: 2 });
    await waitFor(() => expect(listarPersonagens).toHaveBeenCalledTimes(2));

    await act(async () => {
      requestA.resolve([makePersonagem(1)]);
      await requestA.promise;
    });

    expect(result.current).toMatchObject({
      data: null,
      loading: true,
      error: null,
    });

    await act(async () => {
      requestB.resolve([makePersonagem(2)]);
      await requestB.promise;
    });

    expect(result.current).toMatchObject({
      data: [makePersonagem(2)],
      loading: false,
      error: null,
    });
  });

  it('não permite que uma resposta antiga resolvida por último sobrescreva a atual', async () => {
    const requestA = createDeferred<Personagem[]>();
    const requestB = createDeferred<Personagem[]>();
    listarPersonagens.mockImplementation((animeId) =>
      Number(animeId) === 1 ? requestA.promise : requestB.promise,
    );

    const { result, rerender } = renderHook(
      ({ animeId }) =>
        usePersonagens({ animeId, urlBase: '/personagens' }),
      { initialProps: { animeId: 1 } },
    );
    await waitFor(() => expect(listarPersonagens).toHaveBeenCalledTimes(1));
    rerender({ animeId: 2 });
    await waitFor(() => expect(listarPersonagens).toHaveBeenCalledTimes(2));

    await act(async () => {
      requestB.resolve([makePersonagem(2)]);
      await requestB.promise;
    });
    await act(async () => {
      requestA.resolve([makePersonagem(1)]);
      await requestA.promise;
    });

    expect(result.current).toMatchObject({
      data: [makePersonagem(2)],
      loading: false,
      error: null,
    });
  });

  it('não permite que uma falha antiga substitua os dados atuais', async () => {
    const requestA = createDeferred<Personagem[]>();
    const requestB = createDeferred<Personagem[]>();
    listarPersonagens.mockImplementation((animeId) =>
      Number(animeId) === 1 ? requestA.promise : requestB.promise,
    );

    const { result, rerender } = renderHook(
      ({ animeId }) =>
        usePersonagens({ animeId, urlBase: '/personagens' }),
      { initialProps: { animeId: 1 } },
    );
    await waitFor(() => expect(listarPersonagens).toHaveBeenCalledTimes(1));
    rerender({ animeId: 2 });
    await waitFor(() => expect(listarPersonagens).toHaveBeenCalledTimes(2));

    await act(async () => {
      requestB.resolve([makePersonagem(2)]);
      await requestB.promise;
    });
    await act(async () => {
      requestA.reject(new Error('Falha antiga'));
      await requestA.promise.catch(() => undefined);
    });

    expect(result.current).toMatchObject({
      data: [makePersonagem(2)],
      loading: false,
      error: null,
    });
  });

  it('invalida a requisição pendente ao desmontar', async () => {
    const request = createDeferred<Personagem[]>();
    listarPersonagens.mockReturnValue(request.promise);
    const { unmount } = renderHook(() =>
      usePersonagens({ urlBase: '/personagens' }),
    );
    await waitFor(() => expect(listarPersonagens).toHaveBeenCalledOnce());

    unmount();
    await act(async () => {
      request.resolve([makePersonagem(1)]);
      await request.promise;
    });

    expect(listarPersonagens).toHaveBeenCalledOnce();
  });
});
