import jwt from 'jsonwebtoken';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../config/prisma', async () => {
  const { sessionPersistence, transaction } = await import('../helpers/sessionTestDatabase');
  const persistence = {
    sessao: {
      findUnique: vi.fn(sessionPersistence.sessao.findUnique),
      create: vi.fn(sessionPersistence.sessao.create),
      updateMany: vi.fn(sessionPersistence.sessao.updateMany),
    },
    usuario: {
      findUnique: vi.fn(sessionPersistence.usuario.findUnique),
      update: vi.fn(sessionPersistence.usuario.update),
      updateMany: vi.fn(sessionPersistence.usuario.updateMany),
    },
  };
  return {
    prisma: {
      ...persistence,
      $transaction: async <T>(callback: (tx: typeof persistence) => Promise<T>) =>
        transaction(() => callback(persistence)),
    },
  };
});
vi.mock('../../services/emailService', () => ({
  sendPasswordResetEmail: vi.fn(async () => {}),
  sendPasswordResetConfirmationEmail: vi.fn(async () => {}),
  sendRegisterConfirmationEmail: vi.fn(async () => {}),
}));

import { prisma } from '../../config/prisma';
import { authService } from '../../services/authService';
import { db, resetSessionTestDatabase } from '../helpers/sessionTestDatabase';
import { createAuthTestApp } from '../helpers/authTestApp';

const app = createAuthTestApp();

const authorize = (token: string) =>
  request(app).get('/protected').auth(token, { type: 'bearer' });

const setCookies = (value: unknown): string[] => {
  if (!Array.isArray(value) || !value.every((cookie: unknown) => typeof cookie === 'string')) {
    throw new Error('Cookies esperados na resposta');
  }
  return value;
};

async function login(id = 1) {
  const response = await request(app).post('/auth/login').send({
    email: `user${id}@example.test`,
    senha: 'senha-teste',
  });
  expect(response.status).toBe(200);
  const cookies = setCookies(response.headers['set-cookie']);
  const cookie = cookies.find(c => c.startsWith('refreshToken='))!;
  const refreshToken = decodeURIComponent(cookie.split(';')[0].slice('refreshToken='.length));
  const accessToken: string = response.body.accessToken;
  const claims = jwt.verify(accessToken, process.env.JWT_SECRET!);
  if (typeof claims === 'string') throw new Error('Payload inesperado');
  return { accessToken, refreshToken, claims };
}

describe('Regressão JWT e sessões (criptografia e fluxos reais)', () => {
  afterEach(() => vi.restoreAllMocks());

  beforeEach(async () => {
    vi.clearAllMocks();
    await resetSessionTestDatabase();
  });

  it('vincula JWT do login à sessão real e armazena somente o hash do refresh', async () => {
    const result = await login();
    const id = Number(result.refreshToken.split('.')[0]);

    expect(result.claims.sid).toBe(id);
    expect(Number(result.claims.sub)).toBe(1);
    expect(db.sessions.get(id)?.refreshTokenHash).not.toBe(result.refreshToken);
    expect(await authorize(result.accessToken)).toMatchObject({ status: 200 });
  });

  it('logout rejeita o JWT correspondente e preserva outra sessão ativa', async () => {
    const first = await login();
    const second = await login();
    expect((await authorize(first.accessToken)).status).toBe(200);

    const logout = await request(app).post('/auth/logout')
      .set('Cookie', `refreshToken=${first.refreshToken}`).send({});

    expect(logout.status).toBe(200);
    expect(setCookies(logout.headers['set-cookie'])[0]).toMatch(
      /^refreshToken=;.*Path=\/auth;.*Expires=Thu, 01 Jan 1970.*HttpOnly.*SameSite=Lax/,
    );
    expect((await authorize(first.accessToken)).status).toBe(401);
    expect((await authorize(second.accessToken)).status).toBe(200);
    await expect(authService.refresh(first.refreshToken)).rejects.toThrow('Refresh token revogado');
  });

  it('cookies de produção são HttpOnly, Secure e limitados ao caminho de autenticação', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    try {
      const response = await request(app).post('/auth/login').send({
        email: 'user1@example.test', senha: 'senha-teste',
      });
      expect(response.status).toBe(200);
      expect(setCookies(response.headers['set-cookie'])[0]).toMatch(
        /^refreshToken=.+;.*Path=\/auth;.*HttpOnly; Secure; SameSite=Lax$/,
      );
      expect(setCookies(response.headers['set-cookie'])[0]).not.toContain('Domain=');
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it('conta inativa não usa JWT existente nem renova sua sessão', async () => {
    const first = await login();
    const user = db.users.get(1);
    if (!user) throw new Error('Usuario esperado');
    user.status = 'inativo';
    expect((await authorize(first.accessToken)).status).toBe(401);
    expect((await request(app).post('/auth/refresh')
      .set('Cookie', `refreshToken=${first.refreshToken}`)).status).toBe(401);
    expect(db.sessions.size).toBe(1);
    expect(db.sessions.get(Number(first.claims.sid))?.revogadoEm).toBeNull();
  });

  it('revogação administrativa rejeita JWT e mantém sessões independentes', async () => {
    const first = await login();
    const second = await login();
    const admin = await login(99);
    const revoked = await request(app).delete(`/auth/sessions/${first.claims.sid}`)
      .auth(admin.accessToken, { type: 'bearer' });

    expect(revoked.status).toBe(204);
    expect((await authorize(first.accessToken)).status).toBe(401);
    expect((await authorize(second.accessToken)).status).toBe(200);
    expect((await authorize(admin.accessToken)).status).toBe(200);
  });

  it('redefinição revoga JWTs anteriores e vincula novos tokens à nova sessão', async () => {
    const first = await login();
    const second = await login();
    const otherUser = await login(2);
    const resetToken = await authService.requestPasswordReset('user1@example.test');
    const reset = await request(app).post('/auth/reset-password').send({
      token: resetToken, novaSenha: 'nova-senha-teste',
    });
    expect(reset.status).toBe(200);
    const claims = jwt.verify(reset.body.accessToken, process.env.JWT_SECRET!);
    if (typeof claims === 'string') throw new Error('Payload inesperado');
    const cookies = setCookies(reset.headers['set-cookie']);
    expect(cookies[0]).toContain(`refreshToken=${claims.sid}.`);
    expect(claims.sid).not.toBe(first.claims.sid);
    expect(claims.sid).not.toBe(second.claims.sid);
    expect((await authorize(first.accessToken)).status).toBe(401);
    expect((await authorize(second.accessToken)).status).toBe(401);
    expect((await authorize(reset.body.accessToken)).status).toBe(200);
    expect((await authorize(otherUser.accessToken)).status).toBe(200);
    await expect(authService.refresh(first.refreshToken)).rejects.toThrow('Refresh token revogado');
  });

  it('refresh rotaciona sid, invalida tokens anteriores e preserva outra sessão', async () => {
    const first = await login();
    const second = await login();
    const refreshed = await request(app).post('/auth/refresh')
      .set('Cookie', `refreshToken=${first.refreshToken}`).send({});
    expect(refreshed.status).toBe(200);
    const claims = jwt.verify(refreshed.body.accessToken, process.env.JWT_SECRET!);
    if (typeof claims === 'string') throw new Error('Payload inesperado');
    expect(claims.sid).not.toBe(first.claims.sid);
    const cookies = setCookies(refreshed.headers['set-cookie']);
    expect(cookies[0]).toContain(`refreshToken=${claims.sid}.`);
    expect((await authorize(first.accessToken)).status).toBe(401);
    expect((await authorize(refreshed.body.accessToken)).status).toBe(200);
    expect((await authorize(second.accessToken)).status).toBe(200);
    const reuse = await request(app).post('/auth/refresh').send({ refreshToken: first.refreshToken });
    expect(reuse.status).toBe(401);
  });

  it('duas rotações concorrentes consomem o refresh uma única vez', async () => {
    const first = await login();
    const results = await Promise.allSettled([
      authService.refresh(first.refreshToken), authService.refresh(first.refreshToken),
    ]);
    expect(results.filter(r => r.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter(r => r.status === 'rejected')).toHaveLength(1);
    expect([...db.sessions.values()].filter(s => !s.revogadoEm)).toHaveLength(1);
    expect((await authorize(first.accessToken)).status).toBe(401);
  });

  it('JWT expirado não consome refresh; endpoint explícito renova e valida a nova sessão', async () => {
    const first = await login();
    const expired = jwt.sign({ sub: '1', sid: first.claims.sid }, process.env.JWT_SECRET!, { expiresIn: -1 });
    const response = await authorize(expired).set('x-refresh-token', first.refreshToken)
      .set('Cookie', `refreshToken=${first.refreshToken}`);

    expect(response.status).toBe(401);
    expect(response.headers['x-access-token']).toBeUndefined();
    expect(response.headers['x-refresh-token']).toBeUndefined();
    expect(response.headers['set-cookie']).toBeUndefined();
    expect(db.sessions.size).toBe(1);
    expect(db.sessions.get(Number(first.claims.sid))?.revogadoEm).toBeNull();
    expect((await authorize(first.accessToken)).status).toBe(200);
    const refreshed = await request(app).post('/auth/refresh')
      .set('Cookie', `refreshToken=${first.refreshToken}`).send({});
    expect(refreshed.status).toBe(200);
    const refreshedAccess = refreshed.body.accessToken;
    const claims = jwt.verify(refreshedAccess, process.env.JWT_SECRET!);
    if (typeof claims === 'string') throw new Error('Payload inesperado');
    expect(claims.sid).not.toBe(first.claims.sid);
    expect(setCookies(refreshed.headers['set-cookie'])[0]).toContain(`refreshToken=${claims.sid}.`);
    expect((await authorize(refreshedAccess)).status).toBe(200);
    expect((await authorize(first.accessToken)).status).toBe(401);
  });

  it.each(['refresh', 'logout'])('cookie duplicado em %s não consome nem revoga sessão', async (endpoint) => {
    const first = await login();
    const response = await request(app).post(`/auth/${endpoint}`)
      .set('Cookie', `refreshToken=${first.refreshToken}; refreshToken=${first.refreshToken}`)
      .send({});
    expect(response.status).toBe(401);
    expect(db.sessions.size).toBe(1);
    expect(db.sessions.get(Number(first.claims.sid))?.revogadoEm).toBeNull();
    expect((await authorize(first.accessToken)).status).toBe(200);
    if (endpoint === 'logout') {
      expect(setCookies(response.headers['set-cookie'])[0]).toMatch(/^refreshToken=;/);
    } else {
      expect(response.headers['set-cookie']).toBeUndefined();
    }
  });

  it('falha na criação da nova sessão desfaz o consumo do refresh', async () => {
    const first = await login();
    vi.mocked(prisma.sessao.create).mockRejectedValueOnce(new Error('Falha simulada de persistência'));
    await expect(authService.refresh(first.refreshToken)).rejects.toThrow('Falha simulada');

    expect(db.sessions.get(Number(first.claims.sid))?.revogadoEm).toBeNull();
    expect((await authorize(first.accessToken)).status).toBe(200);
    const retry = await authService.refresh(first.refreshToken);
    expect((await authorize(retry.accessToken)).status).toBe(200);
  });

  it('falha ao assinar JWT desfaz a rotação do refresh', async () => {
    const first = await login();
    vi.spyOn(jwt, 'sign').mockImplementationOnce(() => {
      throw new Error('Falha simulada de assinatura');
    });

    await expect(authService.refresh(first.refreshToken)).rejects.toThrow('Falha simulada de assinatura');

    expect(db.sessions.get(Number(first.claims.sid))?.revogadoEm).toBeNull();
    expect(db.sessions.size).toBe(1);
    expect((await authorize(first.accessToken)).status).toBe(200);
    const retry = await authService.refresh(first.refreshToken);
    expect((await authorize(retry.accessToken)).status).toBe(200);
  });

  it('falha ao assinar JWT no reset preserva senha, sessões e token de recuperação', async () => {
    const first = await login();
    const oldHash = db.users.get(1)?.senha;
    const resetToken = await authService.requestPasswordReset('user1@example.test');
    if (!resetToken) throw new Error('Token de recuperação esperado');
    vi.spyOn(jwt, 'sign').mockImplementationOnce(() => {
      throw new Error('Falha simulada de assinatura');
    });

    await expect(authService.resetPassword(resetToken, 'nova-senha-teste'))
      .rejects.toThrow('Falha simulada de assinatura');

    expect(db.users.get(1)?.senha).toBe(oldHash);
    expect(db.users.get(1)?.resetSenhaTokenHash).not.toBeNull();
    expect(db.sessions.size).toBe(1);
    expect((await authorize(first.accessToken)).status).toBe(200);
    const retry = await authService.resetPassword(resetToken, 'nova-senha-teste');
    expect((await authorize(first.accessToken)).status).toBe(401);
    expect((await authorize(retry.accessToken)).status).toBe(200);
  });
});
