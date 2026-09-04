import type { Request, Response } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const authServiceMocks = vi.hoisted(() => ({
  login: vi.fn(),
  register: vi.fn(),
  refresh: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../../services/authService', () => ({
  authService: authServiceMocks,
}));

import { authController } from '../../controllers/authController';

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  const cookie = vi.fn();
  const clearCookie = vi.fn();
  return { res: { status, json, cookie, clearCookie } as unknown as Response, status, json, cookie, clearCookie };
}

describe('authController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar login sem email e senha', async () => {
    const req = { body: {} } as Request;
    const { res, status, json } = criarResponse();

    await authController.login(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Email e senha são obrigatórios' });
  });

  it('deve mapear erro de credenciais inválidas no login', async () => {
    const req = { body: { email: 'a@teste.com', senha: '123456' }, ip: '127.0.0.1', get: vi.fn(() => 'Vitest') } as unknown as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.login.mockRejectedValueOnce(new Error('Email ou senha inválidos'));

    await authController.login(req, res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Email ou senha inválidos' });
  });

  it('deve retornar cookie no login com sucesso', async () => {
    const req = { body: { email: 'a@teste.com', senha: '123456' }, ip: '127.0.0.1', get: vi.fn(() => 'Vitest') } as unknown as Request;
    const { res, status, json, cookie } = criarResponse();
    authServiceMocks.login.mockResolvedValueOnce({
      user: { id: 1, email: 'a@teste.com' },
      accessToken: 'access',
      refreshToken: '1.refresh',
      refreshExpiraEm: new Date('2026-10-10T00:00:00.000Z'),
    });

    await authController.login(req, res);

    expect(cookie).toHaveBeenCalledWith('refreshToken', '1.refresh', expect.objectContaining({ httpOnly: true, path: '/auth' }));
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      user: { id: 1, email: 'a@teste.com' },
      accessToken: 'access',
      refreshExpiraEm: new Date('2026-10-10T00:00:00.000Z'),
    });
  });

  it('deve retornar 400 sem refresh token no refresh', async () => {
    const req = { body: {}, headers: {}, cookies: {} } as unknown as Request;
    const { res, status, json } = criarResponse();

    await authController.refresh(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Refresh token é obrigatório' });
  });

  it('deve retornar token de reset em ambiente não produtivo', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'test';
    const req = { body: { email: 'a@teste.com' } } as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.requestPasswordReset.mockResolvedValueOnce('jwt-reset');

    await authController.forgotPassword(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      message: 'Email enviado, você receberá instruções para redefinir sua senha',
      resetToken: 'jwt-reset',
    });
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('deve rejeitar reset com payload inválido', async () => {
    const req = { body: { token: 'abc', novaSenha: '123' } } as Request;
    const { res, status, json } = criarResponse();

    await authController.resetPassword(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      message: 'Token e nova senha com no mínimo 6 caracteres são obrigatórios',
    });
  });

  it('deve limpar cookie ao fazer logout com sucesso', async () => {
    const req = { body: { refreshToken: '1.refresh' }, headers: {}, cookies: {} } as unknown as Request;
    const { res, status, json, clearCookie } = criarResponse();
    authServiceMocks.logout.mockResolvedValueOnce(undefined);

    await authController.logout(req, res);

    expect(clearCookie).toHaveBeenCalledWith('refreshToken', expect.objectContaining({ httpOnly: true, path: '/auth' }));
  });

  it('deve retornar 500 para erro inesperado no login', async () => {
    const req = { body: { email: 'a@teste.com', senha: '123' }, ip: '127.0.0.1', get: vi.fn(() => 'Vitest') } as unknown as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.login.mockRejectedValueOnce(new Error('Falha de banco de dados'));

    await authController.login(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
  });

  it('deve rejeitar registro com campos obrigatórios ausentes', async () => {
    const req = { body: { nome: 'Luffy' } } as Request;
    const { res, status, json } = criarResponse();

    await authController.register(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Nome, email e senha são obrigatórios' });
  });

  it('deve retornar 409 quando email já estiver cadastrado no registro', async () => {
    const req = { body: { nome: 'Luffy', email: 'luffy@teste.com', senha: 'secretpassword' } } as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.register.mockRejectedValueOnce(new Error('Email já cadastrado'));

    await authController.register(req, res);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith({ message: 'Email já cadastrado' });
  });

  it('deve registrar usuário com sucesso e retornar 201', async () => {
    const req = { body: { nome: 'Zoro', email: 'zoro@teste.com', senha: 'secretpassword' } } as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.register.mockResolvedValueOnce({ id: 2, nome: 'Zoro', email: 'zoro@teste.com' });

    await authController.register(req, res);

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ id: 2, nome: 'Zoro', email: 'zoro@teste.com' });
  });

  it('deve retornar 500 para erro inesperado no registro', async () => {
    const req = { body: { nome: 'Zoro', email: 'zoro@teste.com', senha: 'secretpassword' } } as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.register.mockRejectedValueOnce(new Error('Erro interno'));

    await authController.register(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
  });

  it('deve renovar sessão no refresh via cookie', async () => {
    const req = {
      body: {},
      cookies: { refreshToken: '1.valid-token' },
      headers: {},
    } as unknown as Request;
    const { res, status, json, cookie } = criarResponse();
    authServiceMocks.refresh.mockResolvedValueOnce({
      accessToken: 'new-access',
      refreshToken: '2.new-refresh',
      user: { id: 1, email: 'a@teste.com' },
      refreshExpiraEm: new Date('2026-10-10T00:00:00.000Z'),
    });

    await authController.refresh(req, res);

    expect(cookie).toHaveBeenCalledWith('refreshToken', '2.new-refresh', expect.anything());
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ accessToken: 'new-access' }));
  });

  it('deve renovar sessão no refresh extraindo cookie do header caso req.cookies não exista', async () => {
    const req = {
      body: {},
      headers: { cookie: 'outro=1; refreshToken=3.header-token; tracking=xyz' },
    } as unknown as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.refresh.mockResolvedValueOnce({
      accessToken: 'new-access',
      refreshToken: '4.new-token',
      user: { id: 1 },
      refreshExpiraEm: new Date(),
    });

    await authController.refresh(req, res);

    expect(authServiceMocks.refresh).toHaveBeenCalledWith('3.header-token');
    expect(status).toHaveBeenCalledWith(200);
  });

  it('deve retornar 401 caso o serviço de refresh lance exceção', async () => {
    const req = { body: { refreshToken: 'invalido' }, headers: {}, cookies: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.refresh.mockRejectedValueOnce(new Error('Refresh token revogado'));

    await authController.refresh(req, res);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({ message: 'Refresh token revogado' });
  });

  it('deve rejeitar forgotPassword quando email for inválido ou vazio', async () => {
    const req = { body: { email: '   ' } } as Request;
    const { res, status, json } = criarResponse();

    await authController.forgotPassword(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Email é obrigatório' });
  });

  it('não deve expor resetToken em ambiente de produção', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const req = { body: { email: 'user@teste.com' } } as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.requestPasswordReset.mockResolvedValueOnce('secret-token');

    await authController.forgotPassword(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      message: 'Email enviado, você receberá instruções para redefinir sua senha',
    });
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('deve redefinir senha com sucesso', async () => {
    const req = { body: { token: 'jwt-valid', novaSenha: 'senhaForte123' } } as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.resetPassword.mockResolvedValueOnce({
      user: { id: 1, email: 'a@teste.com' },
      accessToken: 'new-access',
    });

    await authController.resetPassword(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Senha redefinida com sucesso',
      accessToken: 'new-access',
    }));
  });

  it('deve retornar 400 caso resetPassword falhe por token inválido ou expirado', async () => {
    const req = { body: { token: 'jwt-expirado', novaSenha: 'senhaForte123' } } as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.resetPassword.mockRejectedValueOnce(
      new Error('Token de recuperação expirado ou inválido')
    );

    await authController.resetPassword(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      message: 'Token de recuperação expirado ou inválido',
    });
  });

  it('deve retornar 500 caso resetPassword falhe por erro genérico', async () => {
    const req = { body: { token: 'jwt-qualquer', novaSenha: 'senhaForte123' } } as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.resetPassword.mockRejectedValueOnce(new Error('Erro de banco'));

    await authController.resetPassword(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro ao redefinir senha' });
  });

  it('deve retornar 400 no logout quando token for inválido ou sessão não encontrada', async () => {
    const req = { body: { refreshToken: '99.token-aleatorio' }, headers: {}, cookies: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.logout.mockRejectedValueOnce(new Error('Sessão não encontrada'));

    await authController.logout(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({ message: 'Sessão não encontrada' });
  });

  it('deve retornar 500 no logout para erro inesperado no serviço', async () => {
    const req = { body: { refreshToken: '1.token' }, headers: {}, cookies: {} } as unknown as Request;
    const { res, status, json } = criarResponse();
    authServiceMocks.logout.mockRejectedValueOnce(new Error('Falha de banco'));

    await authController.logout(req, res);

    expect(status).toHaveBeenCalledWith(500);
    expect(json).toHaveBeenCalledWith({ message: 'Erro interno do servidor' });
  });
});