// @vitest-environment jsdom

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Perfil } from '../../src/pages/Perfil/Perfil';
import { useProfileData } from '../../src/hooks/UseProfileData/useProfileData';
import placeholder from '../../src/assets/placeholder.jpg';
import { renderApp } from '../fixtures/renderApp';

vi.mock('../../src/hooks/UseProfileData/useProfileData', () => ({
  useProfileData: vi.fn(),
}));

const profileData = (
  overrides: Partial<ReturnType<typeof useProfileData>> = {},
): ReturnType<typeof useProfileData> => ({
  loading: false,
  errorMessage: null,
  hasPartialData: false,
  nome: 'Pessoa fictícia',
  email: 'pessoa@example.test',
  avatar: 'https://cdn.example.test/avatar.jpg',
  status: 'ativo',
  pontosArquivo: 1500,
  totalFavoritosAnimes: 2,
  totalFavoritosPersonagens: 1,
  episodiosConcluidos: 4,
  totalProgressos: 6,
  conquistas: [
    {
      id: 'primeiro',
      nome: 'Primeiro episódio',
      descricao: 'Conclua um episódio.',
      categoria: 'progresso',
      unlocked: true,
      progress: { current: 1, target: 1, percent: 100 },
    },
  ],
  totalConquistasDesbloqueadas: 1,
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  vi.mocked(useProfileData).mockReturnValue(profileData());
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe('Perfil', () => {
  it('exibe identidade, pontos, contadores, conquistas e navega para edição', () => {
    renderApp(<Perfil />);
    expect(
      screen.getByRole('heading', { name: 'Pessoa fictícia' }),
    ).toBeTruthy();
    expect(screen.getByText('pessoa@example.test')).toBeTruthy();
    expect(screen.getByText('1.500 pts')).toBeTruthy();
    expect(screen.getByText('2 animes + 1 personagens')).toBeTruthy();
    expect(screen.getByText('Primeiro episódio')).toBeTruthy();
    expect(screen.getByText('Desbloqueada')).toBeTruthy();
    expect(screen.getByText('Progresso: 1/1 (100%)')).toBeTruthy();
    expect(screen.getByText('1 de 1 conquistas desbloqueadas.')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Editar perfil' }));
    expect(screen.getByTestId('current-path').textContent).toBe(
      '/editar-perfil',
    );
  });

  it('reflete loading e atualização dos dados sem manter identidade antiga', () => {
    vi.mocked(useProfileData).mockReturnValue(
      profileData({ loading: true, nome: 'Perfil' }),
    );
    const { rerender } = renderApp(<Perfil />);
    expect(screen.getByRole('heading', { name: 'Carregando...' })).toBeTruthy();
    expect(screen.getByText('Carregando dados')).toBeTruthy();
    vi.mocked(useProfileData).mockReturnValue(profileData());
    rerender(<Perfil />);
    expect(screen.queryByText('Carregando dados')).toBeNull();
    expect(screen.getByText('Dados sincronizados')).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Pessoa fictícia' }),
    ).toBeTruthy();
  });

  it('mantém dados válidos e conquistas quando uma fonte auxiliar falha', () => {
    vi.mocked(useProfileData).mockReturnValue(
      profileData({
        hasPartialData: true,
        errorMessage: 'Alguns dados do perfil não puderam ser carregados.',
        pontosArquivo: null,
      }),
    );
    renderApp(<Perfil />);
    expect(screen.getByRole('alert').textContent).toContain(
      'Alguns dados do perfil não puderam ser carregados.',
    );
    expect(screen.getByText('Dados parciais')).toBeTruthy();
    expect(screen.getByText('Primeiro episódio')).toBeTruthy();
    expect(
      screen.getByRole('heading', { name: 'Pessoa fictícia' }),
    ).toBeTruthy();
    expect(screen.queryByText('1.500 pts')).toBeNull();
    expect(screen.getAllByText('Sem dados').length).toBeGreaterThan(0);
  });

  it('mostra falta de sessão e dados vazios sem expor identidade privada anterior', () => {
    const { rerender } = renderApp(<Perfil />);
    vi.mocked(useProfileData).mockReturnValue(
      profileData({
        nome: 'Perfil',
        email: '',
        avatar: null,
        status: 'Status indisponivel',
        pontosArquivo: null,
        totalFavoritosAnimes: 0,
        totalFavoritosPersonagens: 0,
        episodiosConcluidos: 0,
        totalProgressos: 0,
        conquistas: [],
        totalConquistasDesbloqueadas: 0,
        errorMessage: 'Sessão não encontrada. Faça login para ver seu perfil.',
      }),
    );
    rerender(<Perfil />);
    expect(screen.getByRole('alert').textContent).toContain(
      'Sessão não encontrada.',
    );
    expect(screen.queryByText('pessoa@example.test')).toBeNull();
    expect(
      screen.queryByRole('heading', { name: 'Pessoa fictícia' }),
    ).toBeNull();
    expect(screen.queryByText('Primeiro episódio')).toBeNull();
    expect(screen.getByText('Nenhuma conquista encontrada')).toBeTruthy();
    expect(screen.getByText('e-mail indisponível')).toBeTruthy();
    expect(screen.getByText('Dados indisponíveis')).toBeTruthy();
  });

  it('substitui avatar quebrado por fallback e aceita um novo avatar', () => {
    const { rerender } = renderApp(<Perfil />);
    const image = screen.getByRole('img', { name: 'Avatar do usuário' });
    expect(image.getAttribute('src')).toBe(
      'https://cdn.example.test/avatar.jpg',
    );
    fireEvent.error(image);
    expect(image.getAttribute('src')).toBe(placeholder);
    vi.mocked(useProfileData).mockReturnValue(
      profileData({ avatar: 'https://cdn.example.test/novo.jpg' }),
    );
    rerender(<Perfil />);
    expect(
      screen
        .getByRole('img', { name: 'Avatar do usuário' })
        .getAttribute('src'),
    ).toBe('https://cdn.example.test/novo.jpg');
  });
});
