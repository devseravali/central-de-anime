// @vitest-environment jsdom

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Favoritos } from '../../src/pages/Favoritos/Favoritos';
import { useFavoriteData } from '../../src/hooks/UseFavoriteData/useFavoriteData';
import { useFavoriteRatings } from '../../src/hooks/UseFavoriteRatings/useFavoriteRatings';
import { favoriteAnime } from '../fixtures/userData';
import { renderApp } from '../fixtures/renderApp';

vi.mock('../../src/hooks/UseFavoriteData/useFavoriteData', () => ({
  useFavoriteData: vi.fn(),
}));
vi.mock('../../src/hooks/UseFavoriteRatings/useFavoriteRatings', () => ({
  useFavoriteRatings: vi.fn(),
}));

const favorites = (
  overrides: Partial<ReturnType<typeof useFavoriteData>> = {},
): ReturnType<typeof useFavoriteData> => ({
  actionError: null,
  animeFavorites: [favoriteAnime],
  auxiliaryError: null,
  characterFavorites: [{ id: 12, nome: 'Akira', papel: 'Protagonista' }],
  episodeCounts: { 10: 2 },
  episodesLoading: false,
  error: null,
  loading: false,
  removeFavorite: vi.fn(async () => {}),
  removingKey: null,
  retry: vi.fn(),
  sessionAvailable: true,
  userId: 7,
  ...overrides,
});
const ratings = (
  overrides: Partial<ReturnType<typeof useFavoriteRatings>> = {},
) => ({
  ratingsByAnime: { 10: 8.5 },
  error: null,
  isLoading: false,
  retry: vi.fn(),
  ...overrides,
});

beforeEach(() => {
  vi.mocked(useFavoriteData).mockReturnValue(favorites());
  vi.mocked(useFavoriteRatings).mockReturnValue(ratings());
});
afterEach(cleanup);

describe('Favoritos', () => {
  it('sem sessão oculta conteúdo privado, mesmo se ainda houver dados, e oferece login e cadastro', () => {
    vi.mocked(useFavoriteData).mockReturnValue(
      favorites({ sessionAvailable: false }),
    );
    renderApp(<Favoritos />);
    expect(screen.getByText('Conteudo restrito')).toBeTruthy();
    expect(screen.queryByText(favoriteAnime.titulo)).toBeNull();
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Criar cadastro' }).getAttribute('href'),
    ).toBe('/registro');
    fireEvent.click(screen.getByRole('link', { name: 'Fazer login' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/login');
  });

  it('substitui o carregamento pelos favoritos e respectivas avaliações', () => {
    vi.mocked(useFavoriteData).mockReturnValue(favorites({ loading: true }));
    const { rerender } = renderApp(<Favoritos />);
    expect(screen.getByText('Carregando favoritos')).toBeTruthy();
    expect(screen.queryByText(favoriteAnime.titulo)).toBeNull();
    vi.mocked(useFavoriteData).mockReturnValue(favorites());
    rerender(<Favoritos />);
    expect(
      screen.getByRole('heading', { name: favoriteAnime.titulo }),
    ).toBeTruthy();
    expect(screen.getByText('★ 8.5')).toBeTruthy();
    expect(screen.getByText('2 episodios')).toBeTruthy();
    expect(useFavoriteRatings).toHaveBeenLastCalledWith(7);
  });

  it('não apresenta falha de consulta como lista vazia e permite tentar novamente', () => {
    const retry = vi.fn();
    vi.mocked(useFavoriteData).mockReturnValue(
      favorites({
        animeFavorites: [],
        characterFavorites: [],
        error: 'Não foi possível consultar os favoritos.',
        retry,
      }),
    );
    renderApp(<Favoritos />);
    expect(screen.getByText('Erro ao carregar favoritos')).toBeTruthy();
    expect(screen.queryByText('Nenhum favorito encontrado')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('lista vazia bem-sucedida mostra o estado vazio, sem mensagem de falha', () => {
    vi.mocked(useFavoriteData).mockReturnValue(
      favorites({ animeFavorites: [], characterFavorites: [] }),
    );
    renderApp(<Favoritos />);
    expect(screen.getByText('Nenhum favorito encontrado')).toBeTruthy();
    expect(screen.queryByText('Erro ao carregar favoritos')).toBeNull();
  });

  it('filtra, ordena e alterna entre animes e personagens', () => {
    vi.mocked(useFavoriteData).mockReturnValue(
      favorites({
        animeFavorites: [
          { ...favoriteAnime, id: 11, titulo: 'Zeta' },
          { ...favoriteAnime, id: 12, titulo: 'Alfa' },
        ],
      }),
    );
    renderApp(<Favoritos />);
    fireEvent.change(
      screen.getByRole('combobox', { name: 'Ordenar favoritos' }),
      { target: { value: 'title' } },
    );
    expect(
      screen
        .getAllByRole('heading', { level: 3 })
        .slice(0, 2)
        .map((heading) => heading.textContent),
    ).toEqual(['Alfa', 'Zeta']);
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Filtrar favoritos' }),
      { target: { value: '  ZETA ' } },
    );
    expect(screen.queryByRole('heading', { name: 'Alfa' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Zeta' })).toBeTruthy();
    fireEvent.change(
      screen.getByRole('searchbox', { name: 'Filtrar favoritos' }),
      { target: { value: '' } },
    );
    fireEvent.click(screen.getByRole('button', { name: /Personagens/ }));
    expect(screen.getByRole('heading', { name: 'Akira' })).toBeTruthy();
    expect(screen.queryByRole('heading', { name: 'Zeta' })).toBeNull();
  });

  it('dispara remoção com a identidade correta e reflete atualização, bloqueio e erro', () => {
    const removeFavorite = vi.fn(async () => {});
    vi.mocked(useFavoriteData).mockReturnValue(favorites({ removeFavorite }));
    const { rerender } = renderApp(<Favoritos />);
    fireEvent.click(
      screen.getByRole('button', {
        name: `Remover ${favoriteAnime.titulo} dos favoritos`,
      }),
    );
    expect(removeFavorite).toHaveBeenCalledWith(
      expect.objectContaining({ id: 10, type: 'anime' }),
    );

    vi.mocked(useFavoriteData).mockReturnValue(
      favorites({ removeFavorite, removingKey: 'anime-10' }),
    );
    rerender(<Favoritos />);
    const pending = screen.getByRole('button', {
      name: `Remover ${favoriteAnime.titulo} dos favoritos`,
    });
    expect(pending.hasAttribute('disabled')).toBe(true);
    fireEvent.click(pending);
    expect(removeFavorite).toHaveBeenCalledOnce();

    vi.mocked(useFavoriteData).mockReturnValue(
      favorites({
        actionError: 'Não foi possível remover este item dos favoritos.',
      }),
    );
    rerender(<Favoritos />);
    expect(screen.getByRole('alert').textContent).toBe(
      'Não foi possível remover este item dos favoritos.',
    );
    expect(
      screen.getByRole('heading', { name: favoriteAnime.titulo }),
    ).toBeTruthy();

    vi.mocked(useFavoriteData).mockReturnValue(
      favorites({ animeFavorites: [] }),
    );
    rerender(<Favoritos />);
    expect(
      screen.queryByRole('heading', { name: favoriteAnime.titulo }),
    ).toBeNull();
    expect(screen.getByText('Nenhum favorito encontrado')).toBeTruthy();
  });

  it('remove personagem pela aba correta', () => {
    const removeFavorite = vi.fn(async () => {});
    vi.mocked(useFavoriteData).mockReturnValue(favorites({ removeFavorite }));
    renderApp(<Favoritos />);
    fireEvent.click(screen.getByRole('button', { name: /Personagens/ }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Remover Akira dos favoritos' }),
    );
    expect(removeFavorite).toHaveBeenCalledWith(
      expect.objectContaining({ id: 12, type: 'personagem' }),
    );
  });

  it('falhas auxiliares preservam os cards e permitem recarregar avaliações', () => {
    const retry = vi.fn();
    vi.mocked(useFavoriteData).mockReturnValue(
      favorites({ auxiliaryError: 'Contagem indisponível.' }),
    );
    vi.mocked(useFavoriteRatings).mockReturnValue(
      ratings({
        ratingsByAnime: {},
        error: 'Avaliações indisponíveis.',
        retry,
      }),
    );
    renderApp(<Favoritos />);
    expect(screen.getByText('Contagem indisponível.')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain(
      'Avaliações indisponíveis.',
    );
    expect(screen.getByText('★ --')).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: favoriteAnime.titulo }),
    ).toBeTruthy();
    fireEvent.click(
      screen.getByRole('button', {
        name: 'Tentar carregar avaliações novamente',
      }),
    );
    expect(retry).toHaveBeenCalledOnce();
  });
});
