// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/App';
import { renderAppWithQueryClient } from '../fixtures/renderApp';

const lazyControl = vi.hoisted(() => {
  const createDeferred = () => {
    let resolve!: () => void;
    const promise = new Promise<void>((resolvePromise) => {
      resolve = resolvePromise;
    });
    return { promise, resolve };
  };

  const reset = () => ({
    holdLogin: false,
    holdRegistro: false,
    registroRequested: false,
    login: createDeferred<void>(),
    registro: createDeferred<void>(),
  });

  return {
    ...reset(),
    reset,
  };
});

vi.mock('../../src/services/api', async () => {
  const actual = await vi.importActual<typeof import('../../src/services/api')>(
    '../../src/services/api',
  );
  return {
    ...actual,
    bootstrapAuthSession: vi.fn(async () => {}),
    getAccessToken: vi.fn(() => ''),
    subscribeToAuthSessionChanges: vi.fn(() => () => {}),
  };
});
vi.mock('../../src/services/user.service', () => ({
  userService: {
    buscarMeuPerfil: vi.fn(),
  },
}));
vi.mock('../../src/pages/Home/Home', () => ({
  Home: () => <h1>Página inicial mock</h1>,
}));
vi.mock('../../src/pages/Explorar/Explorar', () => ({
  Explorar: () => <h1>Explorar mock</h1>,
}));
vi.mock('../../src/pages/Registro/Registro', async () => {
  lazyControl.registroRequested = true;
  if (lazyControl.holdRegistro) {
    await lazyControl.registro.promise;
  }
  return { Registro: () => <h1>Registro mock</h1> };
});
vi.mock('../../src/pages/Login/Login', async () => {
  if (lazyControl.holdLogin) {
    await lazyControl.login.promise;
  }
  return { Login: () => <h1>Login mock</h1> };
});
vi.mock('../../src/pages/Ranking/Ranking', () => ({
  default: () => <h1>Ranking mock</h1>,
}));

const renderApp = (initialEntry: string) =>
  renderAppWithQueryClient(<App />, initialEntry);

describe('App shell integração e acessibilidade', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.assign(lazyControl, lazyControl.reset());
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('mantém um único landmark main com header e footer ao renderizar páginas', async () => {
    renderApp('/login');
    expect(screen.getByText('Carregando...')).toBeTruthy();
    expect(
      await screen.findByRole('heading', { name: 'Login mock' }),
    ).toBeTruthy();
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('contentinfo')).toBeTruthy();
  });

  it('navega por busca do Header para explorar sem perder parâmetros codificados', async () => {
    renderApp('/login');
    await screen.findByRole('heading', { name: 'Login mock' });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Buscar animes' }), {
      target: { value: '  ação & aventura ' },
    });
    fireEvent.submit(screen.getByRole('search'));
    expect(
      await screen.findByRole('heading', { name: 'Explorar mock' }),
    ).toBeTruthy();
    expect(screen.getByTestId('current-path').textContent).toBe(
      '/explorar?busca=a%C3%A7%C3%A3o%20%26%20aventura',
    );
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('evita conteúdo obsoleto ao navegar rapidamente entre rotas lazy', async () => {
    lazyControl.holdRegistro = true;
    renderApp('/login');
    await screen.findByRole('heading', { name: 'Login mock' });
    fireEvent.click(screen.getByRole('link', { name: 'Registrar' }));
    await waitFor(() => expect(lazyControl.registroRequested).toBe(true));
    fireEvent.click(screen.getByRole('link', { name: 'Entrar' }));
    expect(
      await screen.findByRole('heading', { name: 'Login mock' }),
    ).toBeTruthy();
    lazyControl.registro.resolve();
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'Registro mock' }),
      ).toBeNull(),
    );
    expect(screen.getByTestId('current-path').textContent).toBe('/login');
  });
});
