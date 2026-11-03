import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sessionFindUnique: vi.fn(),
  sessionCreate: vi.fn(),
  sessionUpdateMany: vi.fn(),
  userFindUnique: vi.fn(),
  userUpdate: vi.fn(),
  userUpdateMany: vi.fn(),
}));

vi.mock('../../config/prisma', async () => {
  const { sessionPersistence, transaction } = await import('../helpers/sessionTestDatabase');
  const persistence = {
    sessao: {
      findUnique: mocks.sessionFindUnique.mockImplementation(async (args) =>
        structuredClone(await sessionPersistence.sessao.findUnique(args))),
      create: mocks.sessionCreate.mockImplementation(sessionPersistence.sessao.create),
      updateMany: mocks.sessionUpdateMany.mockImplementation(sessionPersistence.sessao.updateMany),
    },
    usuario: {
      findUnique: mocks.userFindUnique.mockImplementation(async (args) =>
        structuredClone(await sessionPersistence.usuario.findUnique(args))),
      update: mocks.userUpdate.mockImplementation(sessionPersistence.usuario.update),
      updateMany: mocks.userUpdateMany.mockImplementation(sessionPersistence.usuario.updateMany),
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

import { authController } from '../../controllers/authController';
import AdminRouter from '../../routes/admin';
import { authService } from '../../services/authService';
import {
  createAuthTestApp,
  expireAccessToken,
  readAccessIdentity,
} from '../helpers/authTestApp';
import {
  db,
  resetSessionTestDatabase,
  sessionPersistence,
} from '../helpers/sessionTestDatabase';

const app = createAuthTestApp();
app.use(AdminRouter);
app.post('/auth/verify-email', authController.verifyEmail);

const authorize = (token: string) =>
  request(app).get('/protected').auth(token, { type: 'bearer' });
const refresh = (token: string) =>
  request(app).post('/auth/refresh').set('Cookie', `refreshToken=${token}`).send({});
const sessionsSnapshot = () => structuredClone([...db.sessions.entries()]);

describe('Banimento e reativacao preservam sessoes (persistencia simulada)', () => {
  let adminToken: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    await resetSessionTestDatabase();
    adminToken = (await authService.login('user99@example.test', 'senha-teste')).accessToken;
  });

  const changeStatus = (action: 'ban' | 'unban', token = adminToken) =>
    request(app).post(`/users/1/${action}`).auth(token, { type: 'bearer' }).send({});

  it('preserva todas as sessoes e hashes, bloqueia JWT, login e refresh durante o banimento', async () => {
    const first = await authService.login('user1@example.test', 'senha-teste');
    const second = await authService.login('user1@example.test', 'senha-teste');
    const other = await authService.login('user2@example.test', 'senha-teste');
    expect((await authorize(first.accessToken)).status).toBe(200);
    const before = sessionsSnapshot();
    mocks.sessionCreate.mockClear();
    mocks.sessionUpdateMany.mockClear();

    expect((await changeStatus('ban')).status).toBe(200);
    expect(db.users.get(1)?.status).toBe('banido');
    expect((await authorize(first.accessToken)).status).toBe(401);
    expect((await authorize(second.accessToken)).status).toBe(401);
    const denied = await refresh(first.refreshToken);
    expect(denied.status).toBe(401);
    expect(denied.body.accessToken).toBeUndefined();
    expect(denied.headers['set-cookie']).toBeUndefined();
    expect((await request(app).post('/auth/login').send({
      email: 'user1@example.test', senha: 'senha-teste',
    })).status).toBe(401);
    expect((await authorize(other.accessToken)).status).toBe(200);
    expect((await authorize(adminToken)).status).toBe(200);
    expect(sessionsSnapshot()).toEqual(before);
    expect(mocks.sessionCreate).not.toHaveBeenCalled();
    expect(mocks.sessionUpdateMany).not.toHaveBeenCalled();
  });

  it('reativa JWTs anteriores sem criar sessoes e permite refresh mantendo a protecao contra reutilizacao', async () => {
    const first = await authService.login('user1@example.test', 'senha-teste');
    const second = await authService.login('user1@example.test', 'senha-teste');
    expect((await changeStatus('ban')).status).toBe(200);
    expect((await refresh(first.refreshToken)).status).toBe(401);
    const before = sessionsSnapshot();
    mocks.sessionCreate.mockClear();
    mocks.sessionUpdateMany.mockClear();

    expect((await changeStatus('unban')).status).toBe(200);
    expect(db.users.get(1)?.status).toBe('ativo');
    expect(sessionsSnapshot()).toEqual(before);
    expect(mocks.sessionCreate).not.toHaveBeenCalled();
    expect(mocks.sessionUpdateMany).not.toHaveBeenCalled();
    expect((await authorize(first.accessToken)).status).toBe(200);
    expect((await authorize(second.accessToken)).status).toBe(200);

    const renewed = await refresh(first.refreshToken);
    expect(renewed.status).toBe(200);
    expect((await authorize(renewed.body.accessToken)).status).toBe(200);
    expect((await authorize(first.accessToken)).status).toBe(401);
    expect((await refresh(first.refreshToken)).status).toBe(401);
    expect((await authorize(second.accessToken)).status).toBe(200);
    expect(db.sessions.size).toBe(before.length + 1);
  });

  it.each(['expirada', 'revogada'] as const)(
    'nao recupera sessao %s apos reativacao',
    async (state) => {
      const login = await authService.login('user1@example.test', 'senha-teste');
      const session = db.sessions.get(readAccessIdentity(login.accessToken).sessionId);
      if (!session) throw new Error('Sessao esperada no teste');
      expect((await changeStatus('ban')).status).toBe(200);
      if (state === 'expirada') {
        session.expiraEm = new Date(Date.now() - 1000);
      } else {
        await authService.logout(login.refreshToken);
      }
      const before = sessionsSnapshot();
      expect((await changeStatus('unban')).status).toBe(200);
      expect((await authorize(login.accessToken)).status).toBe(401);
      expect((await refresh(login.refreshToken)).status).toBe(401);
      expect(sessionsSnapshot()).toEqual(before);
    },
  );

  it('mantem JWT expirado invalido, mas permite renovar refresh ainda valido apos reativacao', async () => {
    const login = await authService.login('user1@example.test', 'senha-teste');
    const expired = expireAccessToken(login.accessToken);
    expect((await changeStatus('ban')).status).toBe(200);
    expect((await changeStatus('unban')).status).toBe(200);
    expect((await authorize(expired)).status).toBe(401);
    expect((await refresh(login.refreshToken)).status).toBe(200);
  });

  it('mantem sid obrigatorio, identidade vinculada e assinatura valida apos reativacao', async () => {
    const login = await authService.login('user1@example.test', 'senha-teste');
    const { sessionId } = readAccessIdentity(login.accessToken);
    expect((await changeStatus('ban')).status).toBe(200);
    expect((await changeStatus('unban')).status).toBe(200);
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET esperado no teste');
    for (const token of [
      jwt.sign({ sub: 1 }, secret, { expiresIn: 60 }),
      jwt.sign({ sub: 2, sid: sessionId }, secret, { expiresIn: 60 }),
      jwt.sign({ sub: 1, sid: sessionId }, 'chave-incorreta', { expiresIn: 60 }),
    ]) {
      expect((await authorize(token)).status).toBe(401);
    }
    expect((await authorize(login.accessToken)).status).toBe(200);
  });

  it('mantem autorizacao administrativa para banimento e reativacao', async () => {
    const other = await authService.login('user2@example.test', 'senha-teste');
    const before = sessionsSnapshot();
    for (const action of ['ban', 'unban'] as const) {
      expect((await request(app).post(`/users/1/${action}`).send({})).status).toBe(401);
      expect((await changeStatus(action, other.accessToken)).status).toBe(403);
    }
    expect(db.users.get(1)?.status).toBe('ativo');
    expect(sessionsSnapshot()).toEqual(before);
  });

  it('revalida status ao consumir refresh se o banimento ocorre apos a leitura inicial simulada', async () => {
    const login = await authService.login('user1@example.test', 'senha-teste');
    const sessionId = readAccessIdentity(login.accessToken).sessionId;
    const before = sessionsSnapshot();
    mocks.sessionFindUnique.mockImplementationOnce(async () => {
      const snapshot = structuredClone(await sessionPersistence.sessao.findUnique({ where: { id: sessionId } }));
      expect((await changeStatus('ban')).status).toBe(200);
      return snapshot;
    });

    expect((await refresh(login.refreshToken)).status).toBe(401);
    expect(db.users.get(1)?.status).toBe('banido');
    expect(sessionsSnapshot()).toEqual(before);
    expect((await changeStatus('unban')).status).toBe(200);
    expect((await refresh(login.refreshToken)).status).toBe(200);
  });

  it('usa o status lido pelo middleware e bloqueia a proxima requisicao apos banimento', async () => {
    const login = await authService.login('user1@example.test', 'senha-teste');
    const sessionId = readAccessIdentity(login.accessToken).sessionId;
    mocks.sessionFindUnique.mockImplementationOnce(async () => {
      expect((await changeStatus('ban')).status).toBe(200);
      return sessionPersistence.sessao.findUnique({ where: { id: sessionId } });
    });
    expect((await authorize(login.accessToken)).status).toBe(401);
    expect((await changeStatus('unban')).status).toBe(200);
    expect((await authorize(login.accessToken)).status).toBe(200);
  });

  it('nao permite redefinicao de senha emitir tokens ou revogar sessoes durante banimento', async () => {
    const login = await authService.login('user1@example.test', 'senha-teste');
    const token = await authService.requestPasswordReset('user1@example.test');
    expect((await changeStatus('ban')).status).toBe(200);
    const before = sessionsSnapshot();
    const userBefore = structuredClone(db.users.get(1));
    const denied = await request(app).post('/auth/reset-password').send({
      token, novaSenha: 'nova-senha-teste',
    });
    expect(denied.status).toBe(400);
    expect(denied.body.accessToken).toBeUndefined();
    expect(denied.headers['set-cookie']).toBeUndefined();
    expect(sessionsSnapshot()).toEqual(before);
    expect(db.users.get(1)).toEqual(userBefore);
    expect((await changeStatus('unban')).status).toBe(200);
    expect((await authorize(login.accessToken)).status).toBe(200);
  });

  it('revalida status no consumo do reset se banimento ocorre apos leitura inicial simulada', async () => {
    await authService.login('user1@example.test', 'senha-teste');
    const token = await authService.requestPasswordReset('user1@example.test');
    const before = sessionsSnapshot();
    const oldPassword = db.users.get(1)?.senha;
    mocks.userFindUnique.mockImplementationOnce(async () => {
      const snapshot = structuredClone(await sessionPersistence.usuario.findUnique({ where: { id: 1 } }));
      expect((await changeStatus('ban')).status).toBe(200);
      return snapshot;
    });

    const denied = await request(app).post('/auth/reset-password').send({
      token, novaSenha: 'nova-senha-teste',
    });
    expect(denied.status).toBe(400);
    expect(db.users.get(1)?.senha).toBe(oldPassword);
    expect(db.users.get(1)?.resetSenhaTokenHash).not.toBeNull();
    expect(sessionsSnapshot()).toEqual(before);
  });

  async function prepareEmailVerification() {
    const user = db.users.get(1);
    const secret = process.env.JWT_SECRET;
    if (!user || !secret) throw new Error('Usuario e JWT_SECRET esperados no teste');
    const token = jwt.sign({ usuarioId: 1 }, secret, { expiresIn: 60 });
    user.status = 'pendente';
    user.verificaEmailTokenHash = await bcrypt.hash(token, 4);
    user.verificaEmailExpiraEm = new Date(Date.now() + 60_000);
    return token;
  }

  it('confirmacao de email nao reativa conta banida nem altera suas sessoes', async () => {
    await authService.login('user1@example.test', 'senha-teste');
    const token = await prepareEmailVerification();
    expect((await changeStatus('ban')).status).toBe(200);
    const before = sessionsSnapshot();
    const userBefore = structuredClone(db.users.get(1));
    const denied = await request(app).post('/auth/verify-email').send({ token });
    expect(denied.status).toBe(400);
    expect(db.users.get(1)).toEqual(userBefore);
    expect(sessionsSnapshot()).toEqual(before);
  });

  it('confirmacao nao sobrescreve banimento ocorrido apos leitura inicial simulada', async () => {
    const token = await prepareEmailVerification();
    mocks.userFindUnique.mockImplementationOnce(async () => {
      const snapshot = structuredClone(await sessionPersistence.usuario.findUnique({ where: { id: 1 } }));
      expect((await changeStatus('ban')).status).toBe(200);
      return snapshot;
    });
    expect((await request(app).post('/auth/verify-email').send({ token })).status).toBe(400);
    expect(db.users.get(1)?.status).toBe('banido');
    expect(db.users.get(1)?.verificaEmailTokenHash).not.toBeNull();
  });
});
