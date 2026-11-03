// @vitest-environment jsdom

import { cleanup, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Ranking } from '../../src/pages/Ranking/Ranking';
import { api } from '../../src/services/api';
import {
  createTestQueryClient,
  renderAppWithQueryClient,
  renderWithAppProviders,
} from '../fixtures/renderApp';

vi.mock('../../src/services/api', () => ({ api: { get: vi.fn() } }));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Ranking', () => {
  it('preserva a ordem recebida, as posições e os destinos dos cards e da lista', async () => {
    const titles = ['Zeta com um titulo muito longo para o podio', 'Alfa', 'Gama', 'Beta'];
    vi.mocked(api.get).mockImplementation(async (url) => ({
      data: url === '/ranking/animes/top'
        ? titles.map((titulo, index) => ({
            id: index + 10, titulo, tipo: 'TV', ano: 2026,
            capaUrl: null, totalFavoritos: 40 - index,
          }))
        : [{ id: 5, nome: 'Personagem', imagem: '', papel: null, totalFavoritos: 12 }],
    }));
    renderAppWithQueryClient(<Ranking />);
    const first = await screen.findByRole('link', { name: `Ver detalhes de ${titles[0]}` });
    const podium = first.closest('ol')!;
    expect(within(podium).getAllByRole('heading').map((item) => item.textContent))
      .toEqual(titles.slice(0, 3));
    expect(within(podium).getAllByText(/º lugar/).map((item) => item.textContent))
      .toEqual(['1º lugar', '2º lugar', '3º lugar']);
    expect(first.getAttribute('href')).toBe('/animes/10');
    expect(within(first).getByText(/40 favoritos/)).toBeTruthy();
    const fourth = screen.getByRole('link', { name: 'Ver detalhes de Beta' });
    expect(within(fourth).getByText('04')).toBeTruthy();
    expect(fourth.getAttribute('href')).toBe('/animes/13');
    const character = await screen.findByRole('link', { name: 'Ver detalhes de Personagem' });
    expect(within(character).getByText('1º lugar')).toBeTruthy();
    expect(character.getAttribute('href')).toBe('/personagens/5');
  });

  it('mostra o estado vazio para respostas sem itens', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderAppWithQueryClient(<Ranking />);
    expect(await screen.findByText('Ainda não há animes suficientes para o ranking.')).toBeTruthy();
    expect(await screen.findByText('Ainda não há personagens suficientes para o ranking.')).toBeTruthy();
    expect(screen.queryByRole('listitem')).toBeNull();
  });

  it('mostra loading enquanto aguarda as respostas', () => {
    vi.mocked(api.get).mockReturnValue(new Promise(() => {}));
    renderAppWithQueryClient(<Ranking />);
    expect(screen.getByText('Carregando ranking de animes...')).toBeTruthy();
    expect(screen.getByText('Carregando ranking de personagens...')).toBeTruthy();
  });

  it('distingue falha de consulta de um ranking vazio', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('Falha de rede'));
    const queryClient = createTestQueryClient();
    queryClient.setDefaultOptions({ queries: { retry: false } });
    renderWithAppProviders(<Ranking />, { queryClient });
    expect(await screen.findByText('Erro ao carregar ranking de animes.')).toBeTruthy();
    expect(await screen.findByText('Erro ao carregar ranking de personagens.')).toBeTruthy();
    expect(screen.queryByText('Ainda não há animes suficientes para o ranking.')).toBeNull();
  });
});
