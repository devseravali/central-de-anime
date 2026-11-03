// @vitest-environment jsdom

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MeuProgresso } from '../../src/pages/MeuProgresso/MeuProgresso';
import { useMeuProgressoData } from '../../src/hooks/UseMeuProgressoData/useMeuProgressoData';
import type { AnimeProgressItem } from '../../src/utils/meuProgresso';
import { renderApp } from '../fixtures/renderApp';

vi.mock('../../src/hooks/UseMeuProgressoData/useMeuProgressoData', () => ({
  useMeuProgressoData: vi.fn(),
}));

const item = (
  overrides: Partial<AnimeProgressItem> = {},
): AnimeProgressItem => ({
  id: 10,
  titulo: 'Anime de teste',
  subtitulo: 'TV',
  temporada: 'Outono',
  totalEpisodios: 12,
  episodiosAssistidos: 3,
  status: 'assistindo',
  proximoEpisodio: 'Ep. 4',
  ultimaAtualizacao: 'Ontem',
  ultimaAtualizacaoOrdem: 100,
  semanaAssistidos: 2,
  sigla: 'AT',
  ...overrides,
});

const progressState = (
  overrides: Partial<ReturnType<typeof useMeuProgressoData>> = {},
): ReturnType<typeof useMeuProgressoData> => ({
  actionError: null,
  alterarEpisodio: vi.fn(async () => {}),
  dataNotice: null,
  items: [item()],
  loadError: false,
  loading: false,
  retry: vi.fn(),
  sessionAvailable: true,
  updatingAnimeId: null,
  weeklyActivity: [10, 20, 30, 40, 50, 60, 70],
  ...overrides,
});

describe('MeuProgresso page', () => {
  beforeEach(() => {
    vi.mocked(useMeuProgressoData).mockReturnValue(progressState());
  });

  afterEach(() => {
    cleanup();
  });

  it('sem sessão exibe gate de autenticação e oculta dados privados', () => {
    vi.mocked(useMeuProgressoData).mockReturnValue(
      progressState({ sessionAvailable: false }),
    );
    renderApp(<MeuProgresso />);
    expect(screen.getByText('Conteudo restrito')).toBeTruthy();
    expect(screen.queryByLabelText('Lista de progresso dos animes')).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: 'Fazer login' }));
    expect(screen.getByTestId('current-path').textContent).toBe('/login');
  });

  it('expõe estados acessíveis de carregamento e erro com ação de retry', () => {
    const retry = vi.fn();
    vi.mocked(useMeuProgressoData).mockReturnValue(
      progressState({ loading: true, items: [], retry }),
    );
    const { rerender } = renderApp(<MeuProgresso />);
    expect(screen.getByRole('status').textContent).toContain(
      'Carregando progresso real...',
    );

    vi.mocked(useMeuProgressoData).mockReturnValue(
      progressState({ loading: false, loadError: true, items: [], retry }),
    );
    rerender(<MeuProgresso />);
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível carregar os dados reais do seu progresso.',
    );
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(retry).toHaveBeenCalledOnce();
  });

  it('mostra estado vazio quando não há itens para os filtros', () => {
    vi.mocked(useMeuProgressoData).mockReturnValue(
      progressState({ items: [] }),
    );
    renderApp(<MeuProgresso />);
    expect(
      screen.getByText('Nenhum anime encontrado para os filtros selecionados.'),
    ).toBeTruthy();
  });

  it('fornece labels de filtros e permite teclado/foco nos controles', () => {
    renderApp(<MeuProgresso />);
    const tabs = screen.getByRole('button', { name: /Assistindo/ });
    const search = screen.getByRole('searchbox', {
      name: 'Filtrar animes por nome',
    });
    const sort = screen.getByRole('combobox', { name: 'Ordenar animes' });
    tabs.focus();
    expect(document.activeElement).toBe(tabs);
    search.focus();
    expect(document.activeElement).toBe(search);
    sort.focus();
    expect(document.activeElement).toBe(sort);
    fireEvent.change(search, { target: { value: '  anime ' } });
    expect(search).toHaveProperty('value', '  anime ');
  });

  it('atualiza visual e ações quando os dados mudam e evita clique duplo em item atualizando', () => {
    const alterarEpisodio = vi.fn(async () => {});
    const { rerender } = renderApp(<MeuProgresso />);

    vi.mocked(useMeuProgressoData).mockReturnValue(
      progressState({
        alterarEpisodio,
        items: [
          item({ id: 99, titulo: 'Primeiro título', episodiosAssistidos: 1 }),
        ],
      }),
    );
    rerender(<MeuProgresso />);
    fireEvent.click(
      screen.getByRole('button', { name: 'Aumentar episódios assistidos' }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Diminuir episódios assistidos' }),
    );
    expect(alterarEpisodio).toHaveBeenNthCalledWith(1, 99, 1);
    expect(alterarEpisodio).toHaveBeenNthCalledWith(2, 99, -1);
    expect(
      screen.getByRole('progressbar', { name: 'Progresso de Primeiro título' }),
    ).toBeTruthy();

    vi.mocked(useMeuProgressoData).mockReturnValue(
      progressState({
        alterarEpisodio,
        items: [
          item({ id: 100, titulo: 'Segundo título', episodiosAssistidos: 5 }),
        ],
        updatingAnimeId: 100,
      }),
    );
    rerender(<MeuProgresso />);
    expect(screen.queryByText('Primeiro título')).toBeNull();
    expect(screen.getByText('Segundo título')).toBeTruthy();
    const add = screen.getByRole('button', {
      name: 'Aumentar episódios assistidos',
    });
    expect(add.hasAttribute('disabled')).toBe(true);
    fireEvent.click(add);
    expect(alterarEpisodio).toHaveBeenCalledTimes(2);
  });

  it('mantém mensagem de aviso e erro de ação sem apagar lista existente', () => {
    vi.mocked(useMeuProgressoData).mockReturnValue(
      progressState({
        dataNotice: 'Metadados de temporada indisponíveis no momento.',
        actionError: 'Não foi possível atualizar o episódio.',
      }),
    );
    renderApp(<MeuProgresso />);
    expect(screen.getByRole('status').textContent).toContain(
      'Metadados de temporada indisponíveis no momento.',
    );
    expect(screen.getByRole('alert').textContent).toContain(
      'Não foi possível atualizar o episódio.',
    );
    expect(screen.getByText('Anime de teste')).toBeTruthy();
  });
});
