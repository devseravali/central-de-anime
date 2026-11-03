// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  personagemService,
  type Personagem,
} from '../../src/services/personagem.service';
import { usePersonagem } from '../../src/hooks/UsePersonagem/UsePersonagem';
import { createDeferred } from './deferred';

vi.mock('../../src/services/personagem.service', () => ({
  personagemService: {
    listarPersonagens: vi.fn(),
    listarPersonagensPorUrl: vi.fn(),
    listarPersonagensPorId: vi.fn(),
    buscarPersonagemPorUrl: vi.fn(),
  },
}));

const listarPersonagemPorId = vi.mocked(
  personagemService.listarPersonagensPorId,
);
const makePersonagem = (id: number): Personagem => ({
  id,
  nome: `Personagem ${id}`,
});

describe('usePersonagem', () => {
  afterEach(cleanup);

  beforeEach(() => {
    listarPersonagemPorId.mockReset();
  });

  it('inicia o carregamento e publica o personagem recebido', async () => {
    const request = createDeferred<Personagem>();
    listarPersonagemPorId.mockReturnValue(request.promise);

    const { result } = renderHook(() =>
      usePersonagem({ id: 12, urlBase: '/personagens' }),
    );

    await waitFor(() =>
      expect(listarPersonagemPorId).toHaveBeenCalledOnce(),
    );
    expect(listarPersonagemPorId).toHaveBeenCalledWith(12, '/personagens');
    expect(result.current.loading).toBe(true);

    await act(async () => {
      request.resolve(makePersonagem(12));
      await request.promise;
    });

    expect(result.current).toMatchObject({
      data: makePersonagem(12),
      loading: false,
      error: null,
    });
  });

  it('expõe a falha da requisição e limpa os dados', async () => {
    listarPersonagemPorId.mockRejectedValue(new Error('Personagem ausente'));

    const { result } = renderHook(() =>
      usePersonagem({ id: 404, urlBase: '/personagens' }),
    );

    await waitFor(() =>
      expect(result.current).toMatchObject({
        data: null,
        loading: false,
        error: 'Personagem ausente',
      }),
    );
  });

  it('ignora a resposta invalidada sem encerrar o loading da requisição atual', async () => {
    const requestA = createDeferred<Personagem>();
    const requestB = createDeferred<Personagem>();
    listarPersonagemPorId.mockImplementation((id) =>
      Number(id) === 1 ? requestA.promise : requestB.promise,
    );

    const { result, rerender } = renderHook(
      ({ id }) => usePersonagem({ id, urlBase: '/personagens' }),
      { initialProps: { id: 1 } },
    );
    await waitFor(() =>
      expect(listarPersonagemPorId).toHaveBeenCalledTimes(1),
    );

    rerender({ id: 2 });
    await waitFor(() =>
      expect(listarPersonagemPorId).toHaveBeenCalledTimes(2),
    );

    await act(async () => {
      requestA.resolve(makePersonagem(1));
      await requestA.promise;
    });

    expect(result.current).toMatchObject({
      data: null,
      loading: true,
      error: null,
    });

    await act(async () => {
      requestB.resolve(makePersonagem(2));
      await requestB.promise;
    });

    expect(result.current).toMatchObject({
      data: makePersonagem(2),
      loading: false,
      error: null,
    });
  });

  it('não permite que uma resposta antiga resolvida por último sobrescreva a atual', async () => {
    const requestA = createDeferred<Personagem>();
    const requestB = createDeferred<Personagem>();
    listarPersonagemPorId.mockImplementation((id) =>
      Number(id) === 1 ? requestA.promise : requestB.promise,
    );

    const { result, rerender } = renderHook(
      ({ id }) => usePersonagem({ id, urlBase: '/personagens' }),
      { initialProps: { id: 1 } },
    );
    await waitFor(() =>
      expect(listarPersonagemPorId).toHaveBeenCalledTimes(1),
    );
    rerender({ id: 2 });
    await waitFor(() =>
      expect(listarPersonagemPorId).toHaveBeenCalledTimes(2),
    );

    await act(async () => {
      requestB.resolve(makePersonagem(2));
      await requestB.promise;
    });
    await act(async () => {
      requestA.resolve(makePersonagem(1));
      await requestA.promise;
    });

    expect(result.current).toMatchObject({
      data: makePersonagem(2),
      loading: false,
      error: null,
    });
  });

  it('não permite que uma falha antiga substitua os dados atuais', async () => {
    const requestA = createDeferred<Personagem>();
    const requestB = createDeferred<Personagem>();
    listarPersonagemPorId.mockImplementation((id) =>
      Number(id) === 1 ? requestA.promise : requestB.promise,
    );

    const { result, rerender } = renderHook(
      ({ id }) => usePersonagem({ id, urlBase: '/personagens' }),
      { initialProps: { id: 1 } },
    );
    await waitFor(() =>
      expect(listarPersonagemPorId).toHaveBeenCalledTimes(1),
    );
    rerender({ id: 2 });
    await waitFor(() =>
      expect(listarPersonagemPorId).toHaveBeenCalledTimes(2),
    );

    await act(async () => {
      requestB.resolve(makePersonagem(2));
      await requestB.promise;
    });
    await act(async () => {
      requestA.reject(new Error('Falha antiga'));
      await requestA.promise.catch(() => undefined);
    });

    expect(result.current).toMatchObject({
      data: makePersonagem(2),
      loading: false,
      error: null,
    });
  });

  it('invalida a requisição pendente ao desmontar', async () => {
    const request = createDeferred<Personagem>();
    listarPersonagemPorId.mockReturnValue(request.promise);
    const { unmount } = renderHook(() =>
      usePersonagem({ id: 1, urlBase: '/personagens' }),
    );
    await waitFor(() =>
      expect(listarPersonagemPorId).toHaveBeenCalledOnce(),
    );

    unmount();
    await act(async () => {
      request.resolve(makePersonagem(1));
      await request.promise;
    });

    expect(listarPersonagemPorId).toHaveBeenCalledOnce();
  });
});
