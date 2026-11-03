// @vitest-environment jsdom

import { cleanup, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../../src/components/layout/Header/Header';
import { renderApp } from '../fixtures/renderApp';

vi.mock('../../src/services/user.service', () => ({
  userService: {
    buscarMeuPerfil: vi.fn(),
  },
}));

describe('Header accessibility e tema', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('expõe nomes acessíveis para navegação, busca, tema e autenticação', () => {
    renderApp(<Header />);
    expect(
      screen.getByRole('navigation', { name: 'Navegação principal' }),
    ).toBeTruthy();
    expect(screen.getByRole('search')).toBeTruthy();
    expect(
      screen.getByRole('searchbox', { name: 'Buscar animes' }),
    ).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Ativar tema claro', pressed: true }),
    ).toBeTruthy();
    expect(
      screen.getByRole('navigation', { name: 'Autenticação' }),
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Registrar' })).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Acessar meu perfil' }),
    ).toBeTruthy();
  });

  it('permite foco por teclado nos controles interativos principais', () => {
    renderApp(<Header />);
    const search = screen.getByRole('searchbox', { name: 'Buscar animes' });
    const themeToggle = screen.getByRole('button', {
      name: 'Ativar tema claro',
    });
    const login = screen.getByRole('link', { name: 'Entrar' });
    search.focus();
    expect(document.activeElement).toBe(search);
    themeToggle.focus();
    expect(document.activeElement).toBe(themeToggle);
    login.focus();
    expect(document.activeElement).toBe(login);
  });

  it('persiste a preferência de tema e restaura no próximo carregamento', () => {
    const { unmount } = renderApp(<Header />);
    const toggle = screen.getByRole('button', { name: 'Ativar tema claro' });
    fireEvent.click(toggle);
    expect(localStorage.getItem('central-de-anime-theme')).toBe('light');
    expect(
      screen.getByRole('button', {
        name: 'Ativar tema escuro',
        pressed: false,
      }),
    ).toBeTruthy();

    unmount();
    renderApp(<Header />);
    expect(
      screen.getByRole('button', {
        name: 'Ativar tema escuro',
        pressed: false,
      }),
    ).toBeTruthy();
  });

  it('informa falha de persistência de tema sem impedir a troca visual', () => {
    const setItem = vi
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('Quota exceeded');
      });

    renderApp(<Header />);
    fireEvent.click(screen.getByRole('button', { name: 'Ativar tema claro' }));

    expect(
      screen.getByRole('button', {
        name: 'Ativar tema escuro',
        pressed: false,
      }),
    ).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain(
      'Tema alterado, mas a preferência não pôde ser salva neste navegador.',
    );
    expect(setItem).toHaveBeenCalledWith('central-de-anime-theme', 'light');
  });
});
