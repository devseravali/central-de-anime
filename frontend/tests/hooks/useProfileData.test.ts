// @vitest-environment jsdom

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useProfileData } from '../../src/hooks/UseProfileData/useProfileData';
import { api, clearAuthSession, setAccessToken } from '../../src/services/api';
import { favoritoService } from '../../src/services/favorito.service';
import { progressoService } from '../../src/services/progresso.service';
import { userService } from '../../src/services/user.service';
import {
  favoriteAnime,
  httpResponse,
  profile,
  progress,
} from '../fixtures/userData';
import { createDeferred } from './deferred';

const achievement = {
  id: 'primeiro-episodio',
  nome: 'Primeiro episódio',
  descricao: 'Conclua um episódio.',
  categoria: 'progresso',
  unlocked: true,
  progress: { current: 1, target: 1, percent: 100 },
};

describe('useProfileData', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('accessToken', 'sessao');
    vi.spyOn(userService, 'buscarMeuPerfil').mockResolvedValue(profile());
    vi.spyOn(favoritoService, 'AnimesFavoritos').mockResolvedValue([
      favoriteAnime,
    ]);
    vi.spyOn(favoritoService, 'PersonagensFavoritos').mockResolvedValue([]);
    vi.spyOn(progressoService, 'obterProgressosUsuario').mockResolvedValue([
      progress(101),
      progress(102, false),
    ]);
    vi.spyOn(api, 'get').mockImplementation(async (url) => {
      if (url === '/ranking/7/pontos' || url === '/ranking/8/pontos')
        return httpResponse({ pontos: 120 });
      if (
        url === '/usuarios/7/conquistas' ||
        url === '/usuarios/8/conquistas'
      ) {
        return httpResponse({
          resumo: { desbloqueadas: 1 },
          conquistas: [achievement],
        });
      }
      throw new Error(`URL inesperada: ${url}`);
    });
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('carrega perfil, pontos, conquistas e contadores de favoritos e progresso', async () => {
    const { result } = renderHook(useProfileData);
    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({
      nome: 'Pessoa 7',
      email: 'pessoa7@example.test',
      avatar: '/avatars/original.jpg',
      pontosArquivo: 120,
      totalFavoritosAnimes: 1,
      totalFavoritosPersonagens: 0,
      totalProgressos: 2,
      episodiosConcluidos: 1,
      conquistas: [achievement],
      totalConquistasDesbloqueadas: 1,
      hasPartialData: false,
      errorMessage: null,
    });
    expect(api.get).toHaveBeenCalledWith('/ranking/7/pontos');
    expect(api.get).toHaveBeenCalledWith('/usuarios/7/conquistas');
  });

  it.each(['pontos', 'conquistas', 'favoritos', 'progressos'])(
    'falha em %s sinaliza dados parciais e mantém as outras fontes válidas',
    async (source) => {
      if (source === 'favoritos')
        vi.mocked(favoritoService.AnimesFavoritos).mockRejectedValue(
          new Error('Falha'),
        );
      if (source === 'progressos')
        vi.mocked(progressoService.obterProgressosUsuario).mockRejectedValue(
          new Error('Falha'),
        );
      const original = vi.mocked(api.get).getMockImplementation()!;
      vi.mocked(api.get).mockImplementation(async (url, config) => {
        if (
          (source === 'pontos' && url === '/ranking/7/pontos') ||
          (source === 'conquistas' && url === '/usuarios/7/conquistas')
        )
          throw new Error('Falha');
        return original(url, config);
      });
      const { result } = renderHook(useProfileData);
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current).toMatchObject({
        nome: 'Pessoa 7',
        hasPartialData: true,
        errorMessage: 'Alguns dados do perfil não puderam ser carregados.',
        pontosArquivo: source === 'pontos' ? null : 120,
        totalFavoritosAnimes: source === 'favoritos' ? 0 : 1,
        totalProgressos: source === 'progressos' ? 0 : 2,
        conquistas: source === 'conquistas' ? [] : [achievement],
      });
    },
  );

  it('metadados incompletos não inventam pontos ou conquistas', async () => {
    vi.mocked(api.get).mockResolvedValue(httpResponse({}));
    const { result } = renderHook(useProfileData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current).toMatchObject({
      pontosArquivo: null,
      conquistas: [],
      totalConquistasDesbloqueadas: 0,
      hasPartialData: false,
      errorMessage: null,
    });
  });

  it.each(['user-avatar-updated', 'storage'])(
    'avatar sincronizado por %s não é sobrescrito por consulta antiga',
    async (eventName) => {
      const request = createDeferred<ReturnType<typeof profile>>();
      vi.mocked(userService.buscarMeuPerfil).mockReturnValue(request.promise);
      const { result } = renderHook(useProfileData);
      act(() => {
        localStorage.setItem('userAvatar', '/avatars/novo.jpg');
        window.dispatchEvent(
          eventName === 'storage'
            ? new StorageEvent('storage', {
                key: 'userAvatar',
                newValue: '/avatars/novo.jpg',
              })
            : new Event('user-avatar-updated'),
        );
      });
      expect(result.current.avatar).toBe('/avatars/novo.jpg');
      await act(async () => {
        request.resolve(profile());
      });
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.avatar).toBe('/avatars/novo.jpg');
      expect(result.current.nome).toBe('Pessoa 7');
    },
  );

  it('troca de sessão ignora falha tardia e dados do perfil anterior', async () => {
    const request = createDeferred<ReturnType<typeof profile>>();
    vi.mocked(userService.buscarMeuPerfil)
      .mockReturnValueOnce(request.promise)
      .mockResolvedValue(profile(8));
    const { result } = renderHook(useProfileData);
    act(() => setAccessToken('nova-sessao'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      request.reject(new Error('Falha antiga'));
    });
    expect(result.current).toMatchObject({
      nome: 'Pessoa 8',
      errorMessage: null,
    });
  });

  it('logout limpa dados carregados e impede restauração por consulta antiga', async () => {
    const request = createDeferred<ReturnType<typeof profile>>();
    const { result } = renderHook(useProfileData);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.nome).toBe('Pessoa 7');
    vi.mocked(userService.buscarMeuPerfil).mockReturnValue(request.promise);
    act(() => setAccessToken('sessao-pendente'));
    act(() => clearAuthSession());
    await act(async () => {
      request.resolve(profile());
    });
    expect(result.current).toMatchObject({
      nome: 'Perfil',
      email: '',
      avatar: null,
      pontosArquivo: null,
      conquistas: [],
      loading: false,
      errorMessage: 'Sessão não encontrada. Faça login para ver seu perfil.',
    });
    expect(api.get).toHaveBeenCalledTimes(2);
  });

  it('fontes auxiliares da sessão anterior não sobrescrevem pontos e conquistas atuais', async () => {
    const oldPoints =
      createDeferred<ReturnType<typeof httpResponse<{ pontos: number }>>>();
    vi.mocked(api.get).mockImplementation(async (url) => {
      if (url === '/ranking/7/pontos') return oldPoints.promise;
      if (url === '/ranking/8/pontos') return httpResponse({ pontos: 800 });
      if (url === '/usuarios/7/conquistas') {
        return httpResponse({
          resumo: { desbloqueadas: 1 },
          conquistas: [achievement],
        });
      }
      if (url === '/usuarios/8/conquistas') {
        return httpResponse({ resumo: { desbloqueadas: 0 }, conquistas: [] });
      }
      throw new Error(`URL inesperada: ${url}`);
    });
    const { result } = renderHook(useProfileData);
    await waitFor(() =>
      expect(api.get).toHaveBeenCalledWith('/ranking/7/pontos'),
    );
    vi.mocked(userService.buscarMeuPerfil).mockResolvedValue(profile(8));
    act(() => setAccessToken('sessao-b'));
    await waitFor(() => expect(result.current.loading).toBe(false));
    await act(async () => {
      oldPoints.reject(new Error('Falha antiga'));
    });
    expect(result.current).toMatchObject({
      nome: 'Pessoa 8',
      pontosArquivo: 800,
      conquistas: [],
      totalConquistasDesbloqueadas: 0,
      hasPartialData: false,
      errorMessage: null,
    });
  });

  it.each([401, 403])(
    'sessão rejeitada com %s não expõe mensagem interna',
    async (status) => {
      const response = httpResponse({ message: 'token interno expirado' });
      response.status = status;
      vi.mocked(userService.buscarMeuPerfil).mockRejectedValue(
        new AxiosError(
          'detalhe interno',
          undefined,
          response.config,
          undefined,
          response,
        ),
      );
      const { result } = renderHook(useProfileData);
      await waitFor(() => expect(result.current.loading).toBe(false));
      expect(result.current.errorMessage).toBe('');
      expect(result.current.nome).toBe('Perfil');
      expect(api.get).not.toHaveBeenCalled();
    },
  );

  it('sem autenticação não consulta o perfil', () => {
    localStorage.clear();
    const { result } = renderHook(useProfileData);
    expect(result.current.errorMessage).toBe(
      'Sessão não encontrada. Faça login para ver seu perfil.',
    );
    expect(userService.buscarMeuPerfil).not.toHaveBeenCalled();
  });

  it('desmontagem remove listeners e invalida carregamento pendente', async () => {
    const request = createDeferred<ReturnType<typeof profile>>();
    vi.mocked(userService.buscarMeuPerfil).mockReturnValue(request.promise);
    const { unmount } = renderHook(useProfileData);
    unmount();
    act(() => setAccessToken('outra'));
    await act(async () => {
      request.resolve(profile());
    });
    expect(userService.buscarMeuPerfil).toHaveBeenCalledOnce();
    expect(api.get).not.toHaveBeenCalled();
  });
});
