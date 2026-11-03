import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosHeaders, type AxiosResponse } from 'axios';
import { api } from '../../src/services/api';
import {
  authService,
  type LoginData,
  type LoginResponse,
  type RegisterData,
  type RefreshResponse,
} from '../../src/services/auth.service';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const apiPost = vi.mocked(api.post);
const response = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() },
});

describe('authService', () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it('envia cadastro e login aos endpoints com os dados informados', async () => {
    const registration: RegisterData = {
      nome: 'Pessoa de teste',
      email: 'pessoa@example.test',
      senha: 'senha-segura',
    };
    const login: LoginData = {
      email: registration.email,
      senha: registration.senha,
    };
    const user = { id: 8, nome: registration.nome, email: registration.email };
    const loginResult: LoginResponse = {
      user,
      accessToken: 'access-token',
      refreshExpiraEm: '2026-10-30T00:00:00.000Z',
    };
    apiPost.mockResolvedValueOnce(response(user)).mockResolvedValueOnce(
      response(loginResult),
    );

    await expect(authService.register(registration)).resolves.toEqual(user);
    await expect(authService.login(login)).resolves.toEqual(loginResult);

    expect(apiPost).toHaveBeenNthCalledWith(1, '/auth/register', registration);
    expect(apiPost).toHaveBeenNthCalledWith(2, '/auth/login', login, {
      withCredentials: true,
    });
  });

  it('solicita recuperação usando somente o email e repassa a resposta', async () => {
    const result = {
      message: 'Se o email estiver cadastrado, enviaremos instruções.',
    };
    apiPost.mockResolvedValue(response(result));

    await expect(
      authService.forgotPassword('pessoa@example.test'),
    ).resolves.toEqual(result);
    expect(apiPost).toHaveBeenCalledWith('/auth/forgot-password', {
      email: 'pessoa@example.test',
    });
  });

  it('envia token e nova senha na redefinição', async () => {
    const payload = { token: 'token-de-recuperacao', novaSenha: 'nova-senha' };
    const result = {
      message: 'Senha atualizada.',
      user: { id: 8, nome: 'Pessoa', email: 'pessoa@example.test' },
      accessToken: 'token',
      refreshExpiraEm: '2026-10-30T00:00:00.000Z',
    };
    apiPost.mockResolvedValue(response(result));

    await expect(authService.resetPassword(payload)).resolves.toEqual(result);
    expect(apiPost).toHaveBeenCalledWith('/auth/reset-password', payload, {
      withCredentials: true,
    });
  });

  it('renova com cookies e preserva o contrato de resposta', async () => {
    const result: RefreshResponse = {
      user: { id: 8, nome: 'Pessoa', email: 'pessoa@example.test' },
      accessToken: 'token-renovado',
      refreshExpiraEm: '2026-11-30T00:00:00.000Z',
    };
    apiPost.mockResolvedValue(response(result));

    await expect(authService.refresh()).resolves.toEqual(result);
    expect(apiPost).toHaveBeenCalledWith('/auth/refresh', undefined, {
      withCredentials: true,
    });
  });

  it.each(['login', 'resetPassword'] as const)(
    '%s propaga falhas sem transformar erro em sucesso',
    async (method) => {
      const failure = new Error('Falha de rede');
      apiPost.mockRejectedValue(failure);
      const result = method === 'login'
        ? authService.login({ email: 'pessoa@example.test', senha: 'senha' })
        : authService.resetPassword({ token: 'reset-token', novaSenha: 'nova-senha' });

      await expect(result).rejects.toBe(failure);
    },
  );

  it('envia token de confirmação e repassa a resposta', async () => {
    const result = { message: 'Email confirmado.' };
    apiPost.mockResolvedValue(response(result));

    await expect(
      authService.verifyEmail({ token: 'email-token' }),
    ).resolves.toEqual(result);
    expect(apiPost).toHaveBeenCalledWith('/auth/verify-email', {
      token: 'email-token',
    });
  });

  it('envia logout com cookies e propaga falha do cliente HTTP', async () => {
    apiPost.mockResolvedValue(response({ message: 'Sessão encerrada.' }));

    await expect(authService.logout()).resolves.toEqual({
      message: 'Sessão encerrada.',
    });
    expect(apiPost).toHaveBeenCalledWith('/auth/logout', undefined, {
      withCredentials: true,
    });

    const failure = new Error('Falha de rede');
    apiPost.mockRejectedValue(failure);
    await expect(authService.logout()).rejects.toBe(failure);
  });
});
