// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Header } from '../../src/components/layout/Header/Header';
import { authService } from '../../src/services/auth.service';
import { userService } from '../../src/services/user.service';
import { renderApp } from '../fixtures/renderApp';

vi.mock('../../src/services/auth.service', () => ({
  authService: {
    logout: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    refresh: vi.fn(),
  },
}));

vi.mock('../../src/services/user.service', () => ({
  userService: {
    buscarMeuPerfil: vi.fn(),
  },
}));

const logout = vi.mocked(authService.logout);
const buscarMeuPerfil = vi.mocked(userService.buscarMeuPerfil);

const renderHeader = () => renderApp(<Header />);

describe('Header auth session integration', () => {
  beforeEach(() => {
    logout.mockReset();
    buscarMeuPerfil.mockReset();
    buscarMeuPerfil.mockResolvedValue({
      message: 'Perfil',
      usuario: {
        id: 1,
        nome: 'Pessoa de teste',
        email: 'pessoa@example.test',
        avatar: null,
        status: 'ativo',
      },
    });
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('atualiza os controles de sessão após evento de storage de outra aba', async () => {
    renderHeader();

    expect(screen.getByRole('link', { name: 'Entrar' })).toBeTruthy();

    localStorage.setItem('accessToken', 'access-token');
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'accessToken', newValue: 'access-token' }),
    );

    expect(await screen.findByRole('button', { name: 'Sair' })).toBeTruthy();

    localStorage.removeItem('accessToken');
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'accessToken', newValue: null }),
    );

    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Entrar' })).toBeTruthy(),
    );
    expect(screen.queryByRole('button', { name: 'Sair' })).toBeNull();
  });

  it('limpa a sessão e redireciona mesmo se o logout remoto falhar', async () => {
    localStorage.setItem('accessToken', 'access-token');
    localStorage.setItem('authSessionHint', '1');
    localStorage.setItem('refreshToken', 'refresh-token');
    localStorage.setItem('userAvatar', '/uploads/avatar.jpg');
    logout.mockRejectedValue(new Error('Falha remota'));
    const logError = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderHeader();
    fireEvent.click(await screen.findByRole('button', { name: 'Sair' }));

    await waitFor(() =>
      expect(screen.getByTestId('current-path').textContent).toBe('/login'),
    );

    expect(logout).toHaveBeenCalledOnce();
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('authSessionHint')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('userAvatar')).toBeNull();
    expect(screen.getByRole('link', { name: 'Entrar' })).toBeTruthy();
    expect(logError).toHaveBeenCalledOnce();
  });
});
