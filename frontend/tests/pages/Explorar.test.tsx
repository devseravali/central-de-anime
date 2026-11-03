// @vitest-environment jsdom

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../../src/components/layout/Header/Header';
import { Explorar } from '../../src/pages/Explorar/Explorar';
import {
  animeService,
  type ListarAnimesResponse,
} from '../../src/services/anime.service';
import coverPlaceholder from '../../src/assets/placeholder-capa.jpg';
import { anime } from '../fixtures/userData';
import { renderApp } from '../fixtures/renderApp';
import { createDeferred } from '../hooks/deferred';

vi.mock('../../src/services/anime.service', () => ({
  animeService: { listarAnimes: vi.fn(), buscarAnimes: vi.fn() },
}));
vi.mock('../../src/services/user.service', () => ({
  userService: { buscarMeuPerfil: vi.fn() },
}));

const page = (
  items = [anime],
  number = 1,
  total = items.length,
): ListarAnimesResponse => ({ items, page: number, perPage: 20, total });
const clients: QueryClient[] = [];

const renderExplore = (initialEntry = '/explorar') => {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, refetchOnWindowFocus: false },
    },
  });
  clients.push(client);
  return {
    client,
    ...renderApp(
      <QueryClientProvider client={client}>
        <Header />
        <Explorar />
      </QueryClientProvider>,
      { initialEntry },
    ),
  };
};

beforeEach(() => {
  localStorage.clear();
  vi.mocked(animeService.listarAnimes).mockReset().mockResolvedValue(page());
  vi.mocked(animeService.buscarAnimes).mockReset().mockResolvedValue(page());
});
afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
  localStorage.clear();
});

describe('Explorar e pesquisa', () => {
  it('exibe loading, renderiza o catálogo e permite navegar para detalhes', async () => {
    const request = createDeferred<ListarAnimesResponse>();
    vi.mocked(animeService.listarAnimes).mockReturnValue(request.promise);
    renderExplore();
    expect(screen.getByText('Carregando...')).toBeTruthy();
    expect(screen.queryByText(anime.titulo)).toBeNull();
    expect(animeService.listarAnimes).toHaveBeenCalledWith({
      page: 1,
      perPage: 20,
    });
    await act(async () => request.resolve(page()));
    const cover = await screen.findByRole('img', {
      name: `Capa do anime ${anime.titulo}`,
    });
    fireEvent.error(cover);
    expect(cover.getAttribute('src')).toBe(coverPlaceholder);
    expect(
      screen
        .getByRole('button', { name: 'Todos os animes foram carregados' })
        .hasAttribute('disabled'),
    ).toBe(true);
    fireEvent.click(
      screen.getByRole('link', { name: new RegExp(anime.titulo) }),
    );
    expect(screen.getByTestId('current-path').textContent).toBe('/animes/10');
  });

  it('não expõe detalhes internos na falha inicial', async () => {
    vi.mocked(animeService.listarAnimes).mockRejectedValue(
      new Error('database connection: detalhe interno'),
    );
    renderExplore();
    expect(
      await screen.findByText('Não foi possível carregar os animes.'),
    ).toBeTruthy();
    expect(screen.queryByText(/database connection/)).toBeNull();
    expect(screen.queryByText(anime.titulo)).toBeNull();
  });

  it.each([
    ['/explorar', 'Nenhum anime disponível no catálogo no momento.'],
    ['/explorar?busca=ausente', 'Nenhum anime encontrado para essa busca.'],
  ])('mostra vazio de catálogo ou pesquisa em %s', async (url, message) => {
    vi.mocked(animeService.listarAnimes).mockResolvedValue(page([]));
    vi.mocked(animeService.buscarAnimes).mockResolvedValue(page([]));
    renderExplore(url);
    expect(await screen.findByText(message)).toBeTruthy();
    expect(
      screen.queryByRole('button', { name: 'Carregar mais animes' }),
    ).toBeNull();
  });

  it('pesquisa pelo Header, normaliza a busca e atualiza URL e resultados', async () => {
    vi.mocked(animeService.listarAnimes).mockResolvedValue(page([]));
    renderExplore();
    await screen.findByRole('heading', { name: 'Explorar animes' });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar animes' }), {
      target: { value: '  Ação & aventura  ' },
    });
    fireEvent.submit(screen.getByRole('search'));
    expect(
      await screen.findByRole('heading', {
        name: 'Resultados para "Ação & aventura"',
      }),
    ).toBeTruthy();
    expect(animeService.buscarAnimes).toHaveBeenCalledWith('Ação & aventura', {
      page: 1,
      perPage: 20,
    });
    expect(screen.getByTestId('current-path').textContent).toBe(
      '/explorar?busca=A%C3%A7%C3%A3o%20%26%20aventura',
    );
    expect(screen.getByText(anime.titulo)).toBeTruthy();
  });

  it('busca vazia volta ao catálogo em vez de consultar pesquisa', async () => {
    renderExplore('/explorar?busca=teste');
    await screen.findByRole('heading', { name: 'Resultados para "teste"' });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar animes' }), {
      target: { value: '   ' },
    });
    fireEvent.submit(screen.getByRole('search'));
    await screen.findByRole('heading', { name: 'Explorar animes' });
    expect(screen.getByTestId('current-path').textContent).toBe('/explorar');
    expect(animeService.listarAnimes).toHaveBeenCalledWith({
      page: 1,
      perPage: 20,
    });
    expect(animeService.buscarAnimes).toHaveBeenCalledTimes(1);
  });

  it('preserva a primeira página quando a próxima falha e permite tentar novamente', async () => {
    const next = createDeferred<ListarAnimesResponse>();
    vi.mocked(animeService.listarAnimes)
      .mockResolvedValueOnce(page([anime], 1, 2))
      .mockReturnValueOnce(next.promise)
      .mockResolvedValueOnce(
        page([{ ...anime, id: 11, titulo: 'Segunda obra' }], 2, 2),
      );
    renderExplore();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Carregar mais animes' }),
    );
    await waitFor(() =>
      expect(animeService.listarAnimes).toHaveBeenCalledTimes(2),
    );
    expect(
      screen
        .getByRole('button', { name: 'Carregando...' })
        .hasAttribute('disabled'),
    ).toBe(true);
    await act(async () => next.reject(new Error('Falha de paginação')));
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Não foi possível carregar mais animes. Tente novamente.',
    );
    expect(screen.getByText(anime.titulo)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText('Segunda obra')).toBeTruthy();
    expect(animeService.listarAnimes).toHaveBeenLastCalledWith({
      page: 2,
      perPage: 20,
    });
    expect(
      screen
        .getByRole('button', { name: 'Todos os animes foram carregados' })
        .hasAttribute('disabled'),
    ).toBe(true);
  });

  it('mantém resultados após falha de atualização e oferece retry', async () => {
    vi.mocked(animeService.listarAnimes)
      .mockResolvedValueOnce(page())
      .mockRejectedValueOnce(new Error('Falha na atualização'))
      .mockResolvedValueOnce(page([{ ...anime, titulo: 'Obra atualizada' }]));
    const { client } = renderExplore();
    await screen.findByText(anime.titulo);
    await act(async () => {
      await client.invalidateQueries({ queryKey: ['animes', ''] });
    });
    expect(await screen.findByRole('alert')).toHaveProperty(
      'textContent',
      'Não foi possível atualizar os animes. Os resultados carregados continuam disponíveis.',
    );
    expect(screen.getByText(anime.titulo)).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar atualizar' }));
    expect(await screen.findByText('Obra atualizada')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('resposta antiga da busca A não substitui os resultados atuais de B', async () => {
    const a = createDeferred<ListarAnimesResponse>();
    const b = createDeferred<ListarAnimesResponse>();
    vi.mocked(animeService.buscarAnimes).mockImplementation((term) =>
      term === 'A' ? a.promise : b.promise,
    );
    renderExplore('/explorar?busca=A');
    await waitFor(() =>
      expect(animeService.buscarAnimes).toHaveBeenCalledWith('A', {
        page: 1,
        perPage: 20,
      }),
    );
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar animes' }), {
      target: { value: 'B' },
    });
    fireEvent.submit(screen.getByRole('search'));
    await waitFor(() =>
      expect(animeService.buscarAnimes).toHaveBeenCalledWith('B', {
        page: 1,
        perPage: 20,
      }),
    );
    await act(async () =>
      b.resolve(page([{ ...anime, titulo: 'Resultado B' }])),
    );
    await screen.findByText('Resultado B');
    await act(async () =>
      a.resolve(page([{ ...anime, titulo: 'Resultado A' }])),
    );
    expect(screen.getByText('Resultado B')).toBeTruthy();
    expect(screen.queryByText('Resultado A')).toBeNull();
  });
});
