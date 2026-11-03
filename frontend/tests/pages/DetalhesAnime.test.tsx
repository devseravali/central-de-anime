// @vitest-environment jsdom

import { cleanup, fireEvent, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DetalhesAnime } from '../../src/pages/DetalhesAnime/DetalhesAnime';
import { useAnimeDetails } from '../../src/hooks/UseAnimeDetails/useAnimeDetails';
import usePersonagens from '../../src/hooks/UsePersonagens/UsePersonagens';
import placeholder from '../../src/assets/placeholder.jpg';
import { anime } from '../fixtures/userData';
import { renderApp } from '../fixtures/renderApp';

vi.mock('../../src/hooks/UseAnimeDetails/useAnimeDetails', () => ({
  useAnimeDetails: vi.fn(),
}));
vi.mock('../../src/hooks/UsePersonagens/UsePersonagens', () => ({
  default: vi.fn(),
}));

const details = (
  overrides: Partial<ReturnType<typeof useAnimeDetails>> = {},
) => ({
  anime: { ...anime, estudio: 'Estúdio fictício' },
  loading: false,
  error: null,
  isFavorite: false,
  favoriteLoading: false,
  favoriteError: null,
  temporadas: [],
  loadingTemporadas: false,
  errorTemporadas: null,
  handleToggleFavorite: vi.fn(async () => {}),
  ...overrides,
});

const renderDetails = (id = '10') =>
  renderApp(<DetalhesAnime />, {
    initialEntry: `/animes/${id}`,
    path: '/animes/:id',
  });

beforeEach(() => {
  vi.mocked(useAnimeDetails).mockReturnValue(details());
  vi.mocked(usePersonagens).mockReturnValue({
    data: [],
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
});
afterEach(cleanup);

describe('DetalhesAnime', () => {
  it.each([
    { state: { loading: true }, message: 'Carregando...' },
    {
      state: { error: 'Anime indisponível' },
      message: 'Erro: Anime indisponível',
    },
    { state: { anime: null }, message: 'Anime não encontrado.' },
  ])('exibe $message sem mostrar dados do anime', ({ state, message }) => {
    vi.mocked(useAnimeDetails).mockReturnValue(details(state));
    renderDetails();
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.queryByRole('heading', { name: anime.titulo })).toBeNull();
    expect(
      screen.queryByRole('button', { name: 'Adicionar aos favoritos' }),
    ).toBeNull();
  });

  it('rejeita ID inválido e desabilita a consulta de personagens', () => {
    renderDetails('invalido');
    expect(screen.getByText('Erro: ID do anime inválido.')).toBeTruthy();
    expect(usePersonagens).toHaveBeenCalledWith({
      animeId: NaN,
      enabled: false,
    });
  });

  it('exibe informações, episódios, personagens e navegação com dados válidos', () => {
    vi.mocked(useAnimeDetails).mockReturnValue(
      details({
        temporadas: [
          {
            id: 1,
            numero: 1,
            animeId: 10,
            quantidadeEpisodios: 1,
            episodios: [
              {
                id: 101,
                animeId: 10,
                numero: 1,
                titulo: 'Início da jornada',
                sinopse: 'Um novo começo.',
              },
            ],
          },
        ],
      }),
    );
    vi.mocked(usePersonagens).mockReturnValue({
      data: [{ id: 12, nome: 'Akira' }],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    renderDetails();
    expect(useAnimeDetails).toHaveBeenCalledWith('10');
    expect(screen.getByRole('heading', { name: anime.titulo })).toBeTruthy();
    expect(screen.getByText('Estúdio fictício')).toBeTruthy();
    expect(screen.getByText(anime.sinopse!)).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Temporada 1 (1 episodios)' }),
    ).toBeTruthy();
    expect(screen.getByText('Um novo começo.')).toBeTruthy();
    expect(
      screen
        .getByRole('img', { name: 'Início da jornada' })
        .getAttribute('src'),
    ).toBe(placeholder);
    fireEvent.click(
      screen.getByRole('link', { name: 'Ver detalhes de Akira' }),
    );
    expect(screen.getByTestId('current-path').textContent).toBe(
      '/personagens/12',
    );
  });

  it('usa fallback no erro da imagem de episódio', () => {
    vi.mocked(useAnimeDetails).mockReturnValue(
      details({
        temporadas: [
          {
            id: 1,
            numero: 1,
            quantidadeEpisodios: 1,
            episodios: [
              {
                id: 101,
                animeId: 10,
                titulo: 'Imagem quebrada',
                imagemUrl: 'https://cdn.example.test/ausente.jpg',
              },
            ],
          },
        ],
      }),
    );
    renderDetails();
    const image = screen.getByRole('img', { name: 'Imagem quebrada' });
    fireEvent.error(image);
    expect(image.getAttribute('src')).toBe(placeholder);
  });

  it('mostra vazios e falhas auxiliares sem ocultar o anime carregado', () => {
    const { rerender } = renderDetails();
    expect(
      screen.getByText('Nenhum episodio disponivel para este anime.'),
    ).toBeTruthy();
    expect(screen.getByText('Nenhum personagem encontrado.')).toBeTruthy();

    vi.mocked(useAnimeDetails).mockReturnValue(
      details({
        loadingTemporadas: true,
      }),
    );
    vi.mocked(usePersonagens).mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    rerender(<DetalhesAnime />);
    expect(screen.getByText('Carregando episodios...')).toBeTruthy();
    expect(screen.getByText('Carregando personagens...')).toBeTruthy();

    vi.mocked(useAnimeDetails).mockReturnValue(
      details({ errorTemporadas: 'Falha nos episódios' }),
    );
    vi.mocked(usePersonagens).mockReturnValue({
      data: null,
      loading: false,
      error: 'Falha nos personagens',
      refetch: vi.fn(),
    });
    rerender(<DetalhesAnime />);
    expect(screen.getByText('Erro: Falha nos episódios')).toBeTruthy();
    expect(screen.getByText('Erro: Falha nos personagens')).toBeTruthy();
    expect(screen.getByRole('heading', { name: anime.titulo })).toBeTruthy();
  });

  it('dispara favorito, bloqueia durante atualização e reflete sucesso e erro do hook', () => {
    const handleToggleFavorite = vi.fn(async () => {});
    vi.mocked(useAnimeDetails).mockReturnValue(
      details({ handleToggleFavorite }),
    );
    const { rerender } = renderDetails();
    fireEvent.click(
      screen.getByRole('button', { name: 'Adicionar aos favoritos' }),
    );
    expect(handleToggleFavorite).toHaveBeenCalledOnce();

    vi.mocked(useAnimeDetails).mockReturnValue(
      details({ handleToggleFavorite, favoriteLoading: true }),
    );
    rerender(<DetalhesAnime />);
    const pending = screen.getByRole('button', { name: 'Atualizando...' });
    expect(pending.hasAttribute('disabled')).toBe(true);
    fireEvent.click(pending);
    expect(handleToggleFavorite).toHaveBeenCalledOnce();

    vi.mocked(useAnimeDetails).mockReturnValue(
      details({ handleToggleFavorite, isFavorite: true }),
    );
    rerender(<DetalhesAnime />);
    expect(
      screen.getByRole('button', {
        name: 'Remover dos favoritos',
        pressed: true,
      }),
    ).toBeTruthy();

    vi.mocked(useAnimeDetails).mockReturnValue(
      details({
        favoriteError: 'Faça login para atualizar os favoritos.',
      }),
    );
    rerender(<DetalhesAnime />);
    expect(
      within(screen.getByRole('region', { name: 'Favorito' })).getByText(
        'Faça login para atualizar os favoritos.',
      ),
    ).toBeTruthy();
  });
});
