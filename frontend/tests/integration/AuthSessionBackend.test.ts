import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import axios, { AxiosHeaders, type AxiosAdapter } from 'axios';
import type { Server } from 'node:http';
import {
  db,
  resetSessionTestDatabase,
} from '../../../backend/src/tests/helpers/sessionTestDatabase';

vi.mock('../../../backend/src/config/prisma', async () => {
  const { sessionPersistence, transaction } =
    await import('../../../backend/src/tests/helpers/sessionTestDatabase');
  return { prisma: { ...sessionPersistence, $transaction: transaction } };
});
vi.mock('../../../backend/src/services/emailService', () => ({
  sendPasswordResetEmail: vi.fn(async () => {}),
  sendPasswordResetConfirmationEmail: vi.fn(async () => {}),
  sendRegisterConfirmationEmail: vi.fn(async () => {}),
}));

type ObservedRequest = {
  path: string;
  authorization: unknown;
  cookie: string;
  credentials: boolean;
};

describe('Frontend Axios e backend Express: JWT, sessões e cookies', () => {
  let server: Server | undefined;
  let baseURL: string;
  let client: typeof import('../../src/services/api');
  let auth: typeof import('../../src/services/auth.service')['authService'];
  let backendAuth: typeof import('../../../backend/src/services/authService')['authService'];
  let tokens: typeof import('../../../backend/src/tests/helpers/authTestApp');
  let cookie = '';
  let receivedCookies: string[] = [];
  let requests: ObservedRequest[] = [];

  beforeAll(async () => {
    vi.stubEnv('JWT_SECRET', 'local-integration-test-secret');
    vi.stubEnv('NODE_ENV', 'test');
    tokens = await import('../../../backend/src/tests/helpers/authTestApp');
    backendAuth = (await import('../../../backend/src/services/authService')).authService;
    const app = tokens.createAuthTestApp();
    server = await new Promise<Server>((resolve, reject) => {
      const listening = app.listen(0, '127.0.0.1', () => resolve(listening));
      listening.once('error', reject);
    });
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Porta local esperada');
    baseURL = `http://127.0.0.1:${address.port}`;
    const ready = await axios.get(`${baseURL}/protected`, {
      adapter: 'http', proxy: false, validateStatus: () => true, timeout: 3000,
    });
    expect(ready.status).toBe(401);
    vi.stubEnv('VITE_API_URL', baseURL);
    client = await import('../../src/services/api');
    auth = (await import('../../src/services/auth.service')).authService;
  });

  beforeEach(async () => {
    await resetSessionTestDatabase();
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    vi.stubGlobal('window', new EventTarget());
    cookie = '';
    receivedCookies = [];
    requests = [];
    const http = axios.getAdapter('http');
    // Node has no browser cookie jar: model credentials and Path only, not CORS/SameSite.
    const transport: AxiosAdapter = async config => {
      const path = new URL(config.url ?? '', config.baseURL).pathname;
      const headers = new AxiosHeaders(config.headers);
      const sentCookie = config.withCredentials && path.startsWith('/auth/') ? cookie : '';
      if (sentCookie) headers.set('Cookie', sentCookie);
      requests.push({
        path, authorization: headers.get('Authorization'),
        cookie: sentCookie, credentials: config.withCredentials === true,
      });
      const response = await http({ ...config, headers, proxy: false, timeout: 5000 });
      const setCookie: unknown = response.headers['set-cookie'];
      if (config.withCredentials && setCookie !== undefined) {
        if (!Array.isArray(setCookie) || !setCookie.every((value: unknown) => typeof value === 'string')) {
          throw new Error('Set-Cookie inesperado no transporte de teste');
        }
        receivedCookies.push(...setCookie);
        for (const value of setCookie) {
          if (!value.startsWith('refreshToken=')) continue;
          const pair = value.split(';')[0];
          cookie = pair === 'refreshToken=' ? '' : pair;
        }
      }
      return response;
    };
    client.api.defaults.adapter = transport;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  afterAll(async () => {
    try {
      if (server) {
        const listening = server;
        await new Promise<void>((resolve, reject) =>
          listening.close(error => error ? reject(error) : resolve()),
        );
      }
    } finally {
      vi.unstubAllGlobals();
      vi.unstubAllEnvs();
    }
  });

  async function login(id = 1, senha = 'senha-teste') {
    const result = await auth.login({ email: `user${id}@example.test`, senha });
    client.setAccessToken(result.accessToken);
    return result;
  }

  const directAccess = (token: string) => axios.get(`${baseURL}/protected`, {
    adapter: 'http', proxy: false, headers: { Authorization: `Bearer ${token}` },
    validateStatus: () => true, timeout: 3000,
  });

  it('login cria a sessão correta, recebe cookie HttpOnly e autoriza via Bearer', async () => {
    const result = await login();
    const identity = tokens.readAccessIdentity(result.accessToken);
    const session = db.sessions.get(identity.sessionId);
    expect(identity.userId).toBe(result.user.id);
    expect(session?.usuarioId).toBe(result.user.id);
    expect(cookie).toMatch(new RegExp(`^refreshToken=${identity.sessionId}\\.`));
    expect(receivedCookies[0]).toContain('HttpOnly');
    expect(receivedCookies[0]).toContain('Path=/auth');
    expect(receivedCookies[0]).toContain('SameSite=Lax');
    expect(result).not.toHaveProperty('refreshToken');
    expect((await client.api.get('/protected')).data.id).toBe(result.user.id);
    expect(requests[0]).toMatchObject({ path: '/auth/login', credentials: true });
    expect(requests[1]).toMatchObject({
      authorization: `Bearer ${result.accessToken}`, cookie: '', credentials: false,
    });
  });

  it('401 de JWT expirado rotaciona a sessão e repete a requisição original', async () => {
    const result = await login();
    const oldId = tokens.readAccessIdentity(result.accessToken).sessionId;
    const oldCookie = cookie;
    const expired = tokens.expireAccessToken(result.accessToken);
    client.setAccessToken(expired);

    expect((await client.api.get('/protected')).status).toBe(200);
    const renewed = client.getAccessToken();
    const newId = tokens.readAccessIdentity(renewed).sessionId;
    expect(newId).not.toBe(oldId);
    expect(db.sessions.get(oldId)?.revogadoEm).toBeInstanceOf(Date);
    expect(db.sessions.get(newId)?.revogadoEm).toBeNull();
    expect(cookie).toMatch(new RegExp(`^refreshToken=${newId}\\.`));
    expect(requests.slice(1).map(r => r.path)).toEqual([
      '/protected', '/auth/refresh', '/protected',
    ]);
    expect(requests[2]).toMatchObject({ cookie: oldCookie, credentials: true });
    expect(requests[3].authorization).toBe(`Bearer ${renewed}`);
    expect((await directAccess(result.accessToken)).status).toBe(401);
    cookie = oldCookie;
    await expect(auth.refresh()).rejects.toMatchObject({ response: { status: 401 } });
  });

  it('requisições simultâneas compartilham uma única rotação real', async () => {
    const result = await login();
    client.setAccessToken(tokens.expireAccessToken(result.accessToken));
    const responses = await Promise.all([
      client.api.get('/protected'), client.api.get('/protected'),
    ]);
    expect(responses.map(r => r.status)).toEqual([200, 200]);
    expect(requests.filter(r => r.path === '/auth/refresh')).toHaveLength(1);
    expect(db.sessions.size).toBe(2);
    expect([...db.sessions.values()].filter(s => s.revogadoEm === null)).toHaveLength(1);
  });

  it('logout revoga a sessão, remove cookie e falha no refresh limpa o estado local', async () => {
    const result = await login();
    const id = tokens.readAccessIdentity(result.accessToken).sessionId;
    await auth.logout();
    expect(cookie).toBe('');
    expect(receivedCookies.at(-1)).toMatch(/^refreshToken=;.*Expires=Thu, 01 Jan 1970/);
    expect(db.sessions.get(id)?.revogadoEm).toBeInstanceOf(Date);
    expect((await directAccess(result.accessToken)).status).toBe(401);
    await expect(client.api.get('/protected')).rejects.toMatchObject({ response: { status: 401 } });
    expect(client.getAccessToken()).toBe('');
    expect(localStorage.getItem('authSessionHint')).toBeNull();
    expect(requests.filter(r => r.path === '/auth/refresh')).toHaveLength(1);
  });

  it('reset revoga tokens antigos e mantém o novo login com a senha redefinida', async () => {
    const first = await login();
    const second = await login();
    const resetToken = await backendAuth.requestPasswordReset('user1@example.test');
    if (!resetToken) throw new Error('Token de recuperação esperado');
    client.clearAuthSession();
    const reset = await auth.resetPassword({ token: resetToken, novaSenha: 'nova-senha-teste' });
    expect(reset.message).toBe('Senha redefinida com sucesso');
    expect(client.getAccessToken()).toBe('');
    expect((await directAccess(first.accessToken)).status).toBe(401);
    expect((await directAccess(second.accessToken)).status).toBe(401);
    const resetId = tokens.readAccessIdentity(reset.accessToken).sessionId;
    expect(cookie).toMatch(new RegExp(`^refreshToken=${resetId}\\.`));
    await expect(auth.login({ email: 'user1@example.test', senha: 'senha-teste' }))
      .rejects.toMatchObject({ response: { status: 401 } });
    const loggedIn = await login(1, 'nova-senha-teste');
    expect((await client.api.get('/protected')).status).toBe(200);
    expect(tokens.readAccessIdentity(loggedIn.accessToken).sessionId).not.toBe(resetId);
    expect(requests.find(r => r.path === '/auth/reset-password')?.credentials).toBe(true);
  });

  it('revogação administrativa bloqueia a sessão alvo sem invalidar a independente', async () => {
    const first = await login();
    const firstCookie = cookie;
    const second = await login();
    const secondCookie = cookie;
    await login(99);
    const firstId = tokens.readAccessIdentity(first.accessToken).sessionId;
    expect((await client.api.delete(`/auth/sessions/${firstId}`)).status).toBe(204);
    cookie = firstCookie;
    client.setAccessToken(first.accessToken);
    await expect(client.api.get('/protected')).rejects.toMatchObject({ response: { status: 401 } });
    expect(client.getAccessToken()).toBe('');
    cookie = secondCookie;
    client.setAccessToken(second.accessToken);
    expect((await client.api.get('/protected')).status).toBe(200);
    expect((await directAccess(first.accessToken)).status).toBe(401);
  });

  it('conta inativa não usa sessão existente e a falha do refresh encerra o estado local', async () => {
    const result = await login();
    const user = db.users.get(result.user.id);
    if (!user) throw new Error('Usuario esperado');
    user.status = 'inativo';
    await expect(client.api.get('/protected')).rejects.toMatchObject({ response: { status: 401 } });
    expect(client.getAccessToken()).toBe('');
    expect(requests.filter(r => r.path === '/auth/refresh')).toHaveLength(1);
    expect(db.sessions.size).toBe(1);
  });
});
