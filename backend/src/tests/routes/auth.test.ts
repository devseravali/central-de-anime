import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

const authServiceMocks = vi.hoisted(() => ({
  register: vi.fn(),
  login: vi.fn(),
  refresh: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('../../services/authService', () => ({
  authService: authServiceMocks,
}));

import app from '../../app';

describe('Rotas de autenticação', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve bloquear cadastro inválido sem executar o service', async () => {
    const response = await request(app)
      .post('/auth/register')
      .send({ nome: '', email: 'email-invalido', senha: '123' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(authServiceMocks.register).not.toHaveBeenCalled();
  });

  it('deve registrar usuário com payload válido', async () => {
    authServiceMocks.register.mockResolvedValueOnce({
      id: 1,
      nome: 'Luffy',
      email: 'luffy@teste.com',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: '2026-09-03T00:00:00.000Z',
    });

    const response = await request(app)
      .post('/auth/register')
      .send({ nome: 'Luffy', email: 'luffy@teste.com', senha: 'senhaforte' });

    expect(response.status).toBe(201);
    expect(response.body.email).toBe('luffy@teste.com');
    expect(authServiceMocks.register).toHaveBeenCalledWith('Luffy', 'luffy@teste.com', 'senhaforte');
  });

  it('deve rejeitar login com credenciais inválidas sem expor detalhes internos', async () => {
    authServiceMocks.login.mockRejectedValueOnce(new Error('Email ou senha inválidos'));

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'luffy@teste.com', senha: 'errada' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Email ou senha inválidos' });
  });

  it('deve realizar login e retornar access token sem vazar refresh token no body', async () => {
    authServiceMocks.login.mockResolvedValueOnce({
      user: {
        id: 1,
        nome: 'Luffy',
        email: 'luffy@teste.com',
        avatar: null,
        status: 'ACTIVE',
        criadoEm: new Date('2026-09-03T00:00:00.000Z'),
      },
      accessToken: 'access-token-valido',
      refreshToken: '1.refresh-token-valido',
      refreshExpiraEm: new Date('2026-10-03T00:00:00.000Z'),
    });

    const response = await request(app)
      .post('/auth/login')
      .send({ email: 'luffy@teste.com', senha: 'senhaforte', dispositivo: 'Chrome' });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBe('access-token-valido');
    expect(response.body.refreshToken).toBeUndefined();
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'][0]).toContain('refreshToken=1.refresh-token-valido');
    expect(response.headers['set-cookie'][0]).toContain('HttpOnly');
  });

  it('deve aceitar refresh token vindo do body', async () => {
    authServiceMocks.refresh.mockResolvedValueOnce({
      accessToken: 'novo-access-token',
      refreshToken: '2.novo-refresh-token',
      user: {
        id: 1,
        nome: 'Luffy',
        email: 'luffy@teste.com',
        avatar: null,
        status: 'ACTIVE',
        criadoEm: new Date('2026-09-03T00:00:00.000Z'),
      },
      refreshExpiraEm: new Date('2026-10-03T00:00:00.000Z'),
    });

    const response = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: '1.refresh-token-valido' });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBe('novo-access-token');
    expect(authServiceMocks.refresh).toHaveBeenCalledWith('1.refresh-token-valido');
    expect(response.headers['set-cookie'][0]).toContain('refreshToken=2.novo-refresh-token');
  });

  it('deve aceitar refresh token vindo do cookie', async () => {
    authServiceMocks.refresh.mockResolvedValueOnce({
      accessToken: 'token-cookie',
      refreshToken: '3.refresh-cookie-renovado',
      user: {
        id: 2,
        nome: 'Zoro',
        email: 'zoro@teste.com',
        avatar: null,
        status: 'ACTIVE',
        criadoEm: new Date('2026-09-03T00:00:00.000Z'),
      },
      refreshExpiraEm: new Date('2026-10-03T00:00:00.000Z'),
    });

    const response = await request(app)
      .post('/auth/refresh')
      .set('Cookie', ['refreshToken=3.refresh-cookie'])
      .send({});

    expect(response.status).toBe(200);
    expect(authServiceMocks.refresh).toHaveBeenCalledWith('3.refresh-cookie');
    expect(response.headers['set-cookie'][0]).toContain('refreshToken=3.refresh-cookie-renovado');
  });

  it('deve rejeitar refresh sem body e sem cookie', async () => {
    const response = await request(app)
      .post('/auth/refresh')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Refresh token é obrigatório' });
    expect(authServiceMocks.refresh).not.toHaveBeenCalled();
  });

  it('deve solicitar reset de senha sem vazar existência de usuário', async () => {
    authServiceMocks.requestPasswordReset.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'inexistente@teste.com' });

    expect(response.status).toBe(200);
    expect(response.body.message).toContain('Email enviado');
    expect(authServiceMocks.requestPasswordReset).toHaveBeenCalledWith('inexistente@teste.com');
  });

  it('deve redefinir senha com token e novaSenha válidos', async () => {
    authServiceMocks.resetPassword.mockResolvedValueOnce({
      user: {
        id: 1,
        nome: 'Luffy',
        email: 'luffy@teste.com',
        avatar: null,
        status: 'ACTIVE',
        criadoEm: new Date('2026-09-03T00:00:00.000Z'),
      },
      accessToken: 'token-pos-reset',
      refreshToken: '5.refresh-pos-reset',
      refreshExpiraEm: new Date('2026-10-03T00:00:00.000Z'),
    });

    const response = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'jwt-reset', novaSenha: 'novaSenha123' });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Senha redefinida com sucesso');
    expect(authServiceMocks.resetPassword).toHaveBeenCalledWith('jwt-reset', 'novaSenha123');
  });

  it('deve bloquear payload inválido no reset sem executar o service', async () => {
    const response = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'jwt-reset', senha: 'campo-errado' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(authServiceMocks.resetPassword).not.toHaveBeenCalled();
  });

  it('deve realizar logout usando refresh token enviado por cookie', async () => {
    authServiceMocks.logout.mockResolvedValueOnce(undefined);

    const response = await request(app)
      .post('/auth/logout')
      .set('Cookie', ['refreshToken=9.cookie-logout'])
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ message: 'Logout realizado com sucesso' });
    expect(authServiceMocks.logout).toHaveBeenCalledWith('9.cookie-logout');
    expect(response.headers['set-cookie'][0]).toContain('refreshToken=;');
  });
});
