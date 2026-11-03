// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMeuProgressoData } from '../../src/hooks/UseMeuProgressoData/useMeuProgressoData';
import { clearAuthSession, setAccessToken } from '../../src/services/api';
import { animeService } from '../../src/services/anime.service';
import { episodioService } from '../../src/services/episodio.service';
import { progressoService } from '../../src/services/progresso.service';
import { userService } from '../../src/services/user.service';
import {
  anime,
  episodes,
  httpResponse,
  profile,
  progress,
} from '../fixtures/userData';
import { createDeferred } from './deferred';

describe('useMeuProgressoData', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'sessao');
    vi.spyOn(userService, 'buscarMeuPerfil').mockResolvedValue(profile());
    vi.spyOn(animeService, 'listarAnimes').mockResolvedValue({
      items: [anime],
      total: 1,
      page: 1,
      perPage: 1000,
    });
    vi.spyOn(episodioService, 'listarEpisodios').mockResolvedValue(episodes);
    vi.spyOn(progressoService, 'obterProgressosUsuario').mockResolvedValue([
      progress(),
    ]);
    vi.spyOn(progressoService, 'concluirEpisodio').mockResolvedValue(
      progress(102),
    );
    vi.spyOn(progressoService, 'atualizarProgresso').mockResolvedValue(
      progress(101, false),
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('carrega e agrega progresso da sessão com episódios e metadados', async () => {
    const request = createDeferred<ReturnType<typeof profile>>();
    vi.mocked(userService.buscarMeuPerfil).mockReturnValue(request.promise);
    const { result } = renderHook(useMeuProgressoData);
    expect(result.current).toMatchObject({
      loading: true,
      items: [],
      loadError: false,
    });
    await act(async () => {
      request.resolve(profile());
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toMatchObject([
      {
        id: 10,
        totalEpisodios: 2,
        episodiosAssistidos: 1,
        status: 'assistindo',
        temporada: 'Outono',
        proximoEpisodio: 'Ep. 2 - Segundo',
      },
    ]);
    expect(progressoService.obterProgressosUsuario).toHaveBeenCalledWith(7);
    expect(animeService.listarAnimes).toHaveBeenCalledWith({
      page: 1,
      perPage: 1000,
    });
  });

  it('falha em metadados mantém progresso e informa indisponibilidade parcial', async () => {
    vi.mocked(animeService.listarAnimes).mockRejectedValue(new Error('Falha'));
    const { result } = renderHook(useMeuProgressoData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toMatchObject([
      { id: 10, episodiosAssistidos: 1 },
    ]);
    expect(result.current.loadError).toBe(false);
    expect(result.current.dataNotice).toBe(
      'Alguns metadados de temporada não estão disponíveis no momento.',
    );
  });

  it.each(['progressos', 'episodios'])(
    'falha na fonte obrigatória %s não é confundida com progresso vazio',
    async (source) => {
      if (source === 'progressos') {
        vi.mocked(progressoService.obterProgressosUsuario).mockRejectedValue(
          new Error('Falha'),
        );
      } else {
        vi.mocked(episodioService.listarEpisodios).mockRejectedValue(
          new Error('Falha'),
        );
      }
      const { result } = renderHook(useMeuProgressoData);
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.loadError).toBe(true);
      expect(result.current.items).toEqual([]);
    },
  );

  it('lista de progresso vazia é sucesso e não erro de consulta', async () => {
    vi.mocked(progressoService.obterProgressosUsuario).mockResolvedValue([]);
    const { result } = renderHook(useMeuProgressoData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({
      items: [],
      loadError: false,
      weeklyActivity: [0, 0, 0, 0, 0, 0, 0],
    });
  });

  it('conclui o próximo episódio em ordem e atualiza o progresso somente após sucesso', async () => {
    const mutation = createDeferred<ReturnType<typeof progress>>();
    vi.mocked(progressoService.concluirEpisodio).mockReturnValue(
      mutation.promise,
    );
    const { result } = renderHook(useMeuProgressoData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(progressoService.obterProgressosUsuario)
      .mockResolvedValueOnce([progress()])
      .mockResolvedValueOnce([progress(), progress(102)]);
    let action!: Promise<void>;
    act(() => {
      action = result.current.alterarEpisodio(10, 1);
    });
    await waitFor(() =>
      expect(progressoService.concluirEpisodio).toHaveBeenCalledWith(102),
    );
    expect(result.current.updatingAnimeId).toBe(10);
    expect(result.current.items[0].episodiosAssistidos).toBe(1);
    await act(async () => {
      mutation.resolve(progress(102));
      await action;
    });
    expect(result.current.items[0]).toMatchObject({
      episodiosAssistidos: 2,
      status: 'completo',
    });
    expect(result.current.updatingAnimeId).toBeNull();
  });

  it('reverte o último episódio assistido para zero e recarrega o progresso', async () => {
    const { result } = renderHook(useMeuProgressoData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    vi.mocked(progressoService.obterProgressosUsuario)
      .mockResolvedValueOnce([progress(), progress(102)])
      .mockResolvedValueOnce([progress()]);
    await act(async () => {
      await result.current.alterarEpisodio(10, -1);
    });
    expect(progressoService.atualizarProgresso).toHaveBeenCalledWith(102, 0);
    expect(progressoService.concluirEpisodio).not.toHaveBeenCalled();
    expect(result.current.items[0].episodiosAssistidos).toBe(1);
  });

  it('falha na atualização mantém dados válidos e informa actionError', async () => {
    vi.mocked(progressoService.concluirEpisodio).mockRejectedValue(
      new Error('Falha'),
    );
    const { result } = renderHook(useMeuProgressoData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      await result.current.alterarEpisodio(10, 1);
    });
    expect(result.current.items[0].episodiosAssistidos).toBe(1);
    expect(result.current.actionError).toBe(
      'Não foi possível atualizar o progresso deste anime.',
    );
    expect(result.current.updatingAnimeId).toBeNull();
  });

  it('retry invalida consulta antiga sem deixar que ela finalize o loading atual', async () => {
    const oldRequest = createDeferred<ReturnType<typeof profile>>();
    const newRequest = createDeferred<ReturnType<typeof profile>>();
    vi.mocked(userService.buscarMeuPerfil)
      .mockReturnValueOnce(oldRequest.promise)
      .mockReturnValueOnce(newRequest.promise);
    const { result } = renderHook(useMeuProgressoData);
    act(() => result.current.retry());
    await act(async () => {
      oldRequest.reject(new Error('Falha antiga'));
    });
    expect(result.current).toMatchObject({
      loading: true,
      items: [],
      loadError: false,
    });
    await act(async () => {
      newRequest.resolve(profile());
    });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.items).toHaveLength(1);
  });

  it('resposta tardia de outra sessão não substitui os itens atuais', async () => {
    const oldRequest = createDeferred<ReturnType<typeof progress>[]>();
    vi.mocked(progressoService.obterProgressosUsuario)
      .mockReturnValueOnce(oldRequest.promise)
      .mockResolvedValue([]);
    const { result } = renderHook(useMeuProgressoData);
    await waitFor(() =>
      expect(progressoService.obterProgressosUsuario).toHaveBeenCalledTimes(1),
    );
    act(() => setAccessToken('sessao-b'));
    await waitFor(() =>
      expect(progressoService.obterProgressosUsuario).toHaveBeenCalledTimes(2),
    );
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      oldRequest.resolve([progress()]);
    });
    expect(result.current).toMatchObject({ items: [], loadError: false });
  });

  it('logout durante mutation não restaura itens nem dispara nova consulta', async () => {
    const mutation = createDeferred<ReturnType<typeof progress>>();
    vi.mocked(progressoService.concluirEpisodio).mockReturnValue(
      mutation.promise,
    );
    const { result } = renderHook(useMeuProgressoData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    let action!: Promise<void>;
    act(() => {
      action = result.current.alterarEpisodio(10, 1);
    });
    await waitFor(() =>
      expect(progressoService.concluirEpisodio).toHaveBeenCalledOnce(),
    );
    act(() => clearAuthSession());
    await act(async () => {
      mutation.resolve(progress(102));
      await action;
    });
    expect(result.current).toMatchObject({
      sessionAvailable: false,
      items: [],
      loading: false,
      updatingAnimeId: null,
      actionError: null,
    });
    expect(progressoService.obterProgressosUsuario).toHaveBeenCalledTimes(2);
  });

  it('sem token não consulta nem atualiza progresso', async () => {
    localStorage.clear();
    const { result } = renderHook(useMeuProgressoData);
    await act(async () => {
      await result.current.alterarEpisodio(10, 1);
    });
    expect(result.current).toMatchObject({
      sessionAvailable: false,
      loading: false,
      items: [],
    });
    expect(userService.buscarMeuPerfil).not.toHaveBeenCalled();
    expect(progressoService.concluirEpisodio).not.toHaveBeenCalled();
  });

  it('sessão expirada impede consultas privadas e sinaliza falha de carregamento', async () => {
    const response = httpResponse({ message: 'Sessão expirada' });
    response.status = 401;
    vi.mocked(userService.buscarMeuPerfil).mockRejectedValue(
      new AxiosError(
        'Não autenticado',
        undefined,
        response.config,
        undefined,
        response,
      ),
    );
    const { result } = renderHook(useMeuProgressoData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({ loadError: true, items: [] });
    expect(progressoService.obterProgressosUsuario).not.toHaveBeenCalled();
    expect(animeService.listarAnimes).not.toHaveBeenCalled();
  });

  it('desmontagem invalida resposta pendente e remove assinatura de sessão', async () => {
    const request = createDeferred<ReturnType<typeof profile>>();
    vi.mocked(userService.buscarMeuPerfil).mockReturnValue(request.promise);
    const { unmount } = renderHook(useMeuProgressoData);
    unmount();
    act(() => setAccessToken('sessao-b'));
    await act(async () => {
      request.resolve(profile());
    });
    expect(userService.buscarMeuPerfil).toHaveBeenCalledOnce();
    expect(progressoService.obterProgressosUsuario).not.toHaveBeenCalled();
  });
});
