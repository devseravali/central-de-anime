import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

const TRUSTED_API_URL = 'https://api.central.test';

type AdapterBehavior = (
  config: InternalAxiosRequestConfig,
  requestIndex: number,
) => AxiosResponse | Promise<AxiosResponse>;

const createResponse = (
  config: InternalAxiosRequestConfig,
  data: unknown,
  status = 200,
): AxiosResponse => ({
  data,
  status,
  statusText: status === 401 ? 'Unauthorized' : 'OK',
  headers: new AxiosHeaders(),
  config,
});

const createAdapter = (
  behavior: AdapterBehavior,
  requests: InternalAxiosRequestConfig[],
): AxiosAdapter => async (config) => {
  requests.push({
    ...config,
    headers: new AxiosHeaders(config.headers),
  });
  const response = await behavior(config, requests.length);

  if (response.status >= 400) {
    throw new AxiosError(
      `Request failed with status code ${response.status}`,
      AxiosError.ERR_BAD_REQUEST,
      config,
      undefined,
      response,
    );
  }

  return response;
};

const loadApi = async (baseUrl = TRUSTED_API_URL) => {
  vi.stubEnv('VITE_API_URL', baseUrl);
  vi.resetModules();
  return import('../../src/services/api');
};

describe('api interceptors', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();

    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    vi.stubGlobal('window', {
      dispatchEvent: vi.fn(),
    });
    vi.stubEnv('VITE_API_URL', TRUSTED_API_URL);
  });

  afterEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('adiciona o token a uma URL relativa da API confiável', async () => {
    const { api } = await loadApi();
    const requests: InternalAxiosRequestConfig[] = [];
    api.defaults.adapter = createAdapter(
      (config) => createResponse(config, { ok: true }),
      requests,
    );
    localStorage.setItem('accessToken', 'token-de-teste');

    await api.get('/animes');

    expect(requests).toHaveLength(1);
    expect(requests[0].headers.get('Authorization')).toBe(
      'Bearer token-de-teste',
    );
  });

  it('adiciona o token a uma URL absoluta da origem confiável', async () => {
    const { api } = await loadApi();
    const requests: InternalAxiosRequestConfig[] = [];
    api.defaults.adapter = createAdapter(
      (config) => createResponse(config, { ok: true }),
      requests,
    );
    localStorage.setItem('accessToken', 'token-de-teste');

    await api.get(`${TRUSTED_API_URL}/animes`);

    expect(requests).toHaveLength(1);
    expect(requests[0].headers.get('Authorization')).toBe(
      'Bearer token-de-teste',
    );
  });

  it('remove o token Bearer de uma URL externa', async () => {
    const { api } = await loadApi();
    const requests: InternalAxiosRequestConfig[] = [];
    api.defaults.adapter = createAdapter(
      (config) => createResponse(config, { ok: true }),
      requests,
    );
    localStorage.setItem('accessToken', 'token-de-teste');

    await api.get('https://external.test/data', {
      headers: { Authorization: 'Bearer credencial-manual' },
    });

    expect(requests[0].headers.get('Authorization')).toBeUndefined();
  });

  it('não atualiza nem repete uma requisição externa que retorna 401', async () => {
    const { api } = await loadApi();
    const requests: InternalAxiosRequestConfig[] = [];
    api.defaults.adapter = createAdapter(
      (config) => createResponse(config, { message: 'Unauthorized' }, 401),
      requests,
    );
    localStorage.setItem('accessToken', 'token-de-teste');

    await expect(api.get('https://external.test/data')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(requests).toHaveLength(1);
    expect(requests.some(({ url }) => url === '/auth/refresh')).toBe(false);
  });

  it('atualiza o token e repete uma requisição confiável após 401', async () => {
    const { api } = await loadApi();
    const requests: InternalAxiosRequestConfig[] = [];
    api.defaults.adapter = createAdapter((config, requestIndex) => {
      if (config.url === '/auth/refresh') {
        return createResponse(config, { accessToken: 'token-renovado' });
      }

      if (requestIndex === 1) {
        return createResponse(config, { message: 'Unauthorized' }, 401);
      }

      return createResponse(config, { ok: true });
    }, requests);
    localStorage.setItem('accessToken', 'token-expirado');
    localStorage.setItem('authSessionHint', '1');

    const response = await api.get('/animes');

    expect(response.data).toEqual({ ok: true });
    expect(requests.map(({ url }) => url)).toEqual([
      '/animes',
      '/auth/refresh',
      '/animes',
    ]);
    expect(requests[1].withCredentials).toBe(true);
    expect(api.defaults.withCredentials).not.toBe(true);
    expect(requests[0].headers.get('Authorization')).toBe(
      'Bearer token-expirado',
    );
    expect(requests[2].headers.get('Authorization')).toBe(
      'Bearer token-renovado',
    );
  });

  it('remove a credencial de uma URL cujo texto apenas começa pela origem confiável', async () => {
    const { api } = await loadApi();
    const requests: InternalAxiosRequestConfig[] = [];
    api.defaults.adapter = createAdapter(
      (config) => createResponse(config, { ok: true }),
      requests,
    );
    localStorage.setItem('accessToken', 'token-de-teste');

    await api.get('https://api.central.test.attacker.example/animes');

    expect(requests).toHaveLength(1);
    expect(requests[0].headers.get('Authorization')).toBeUndefined();
  });

  it('não expõe credenciais quando a URL base configurada é inválida', async () => {
    const { api } = await loadApi('not a valid URL');
    const requests: InternalAxiosRequestConfig[] = [];
    api.defaults.adapter = createAdapter(
      (config) => createResponse(config, { ok: true }),
      requests,
    );
    localStorage.setItem('accessToken', 'token-de-teste');

    await api.get('https://api.central.test/animes', {
      headers: { Authorization: 'Bearer credencial-manual' },
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].headers.get('Authorization')).toBeUndefined();
  });

  it('não expõe credenciais quando a URL base da API não está configurada', async () => {
    const { api } = await loadApi('');
    const requests: InternalAxiosRequestConfig[] = [];
    api.defaults.adapter = createAdapter(
      (config) => createResponse(config, { ok: true }),
      requests,
    );
    localStorage.setItem('accessToken', 'token-de-teste');

    await api.get(`${TRUSTED_API_URL}/animes`, {
      headers: { Authorization: 'Bearer credencial-manual' },
    });

    expect(requests).toHaveLength(1);
    expect(requests[0].headers.get('Authorization')).toBeUndefined();
  });

  it('limpa a sessão e não repete a requisição quando o refresh falha', async () => {
    const { api } = await loadApi();
    const requests: InternalAxiosRequestConfig[] = [];
    api.defaults.adapter = createAdapter(
      (config) => createResponse(config, { message: 'Unauthorized' }, 401),
      requests,
    );
    localStorage.setItem('accessToken', 'token-expirado');
    localStorage.setItem('authSessionHint', '1');
    localStorage.setItem('refreshToken', 'refresh-token');

    await expect(api.get('/animes')).rejects.toMatchObject({
      response: { status: 401 },
    });

    expect(requests.map(({ url }) => url)).toEqual([
      '/animes',
      '/auth/refresh',
    ]);
    expect(localStorage.getItem('accessToken')).toBeNull();
    expect(localStorage.getItem('authSessionHint')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(requests[1].withCredentials).toBe(true);
  });

  it('compartilha um único refresh entre requisições simultâneas que retornam 401', async () => {
    const { api } = await loadApi();
    const requests: InternalAxiosRequestConfig[] = [];
    let initial401Count = 0;
    let resolveRefreshStarted!: () => void;
    let resolveBothInitialRequests!: () => void;
    let resolveRefreshResponse!: (response: AxiosResponse) => void;
    let refreshRequestConfig: InternalAxiosRequestConfig | undefined;
    const refreshStarted = new Promise<void>((resolve) => {
      resolveRefreshStarted = resolve;
    });
    const bothInitialRequestsFailed = new Promise<void>((resolve) => {
      resolveBothInitialRequests = resolve;
    });
    const refreshResponse = new Promise<AxiosResponse>((resolve) => {
      resolveRefreshResponse = resolve;
    });

    api.defaults.adapter = createAdapter((config) => {
      if (config.url === '/auth/refresh') {
        refreshRequestConfig = config;
        resolveRefreshStarted();
        return refreshResponse;
      }

      if (initial401Count < 2) {
        initial401Count += 1;
        if (initial401Count === 2) {
          resolveBothInitialRequests();
        }
        return createResponse(config, { message: 'Unauthorized' }, 401);
      }

      return createResponse(config, { ok: true });
    }, requests);
    localStorage.setItem('accessToken', 'token-expirado');
    localStorage.setItem('authSessionHint', '1');

    const pendingRequests = [api.get('/animes/1'), api.get('/animes/2')];

    await Promise.all([refreshStarted, bothInitialRequestsFailed]);
    expect(refreshRequestConfig?.withCredentials).toBe(true);
    expect(requests.filter(({ url }) => url === '/auth/refresh')).toHaveLength(
      1,
    );
    resolveRefreshResponse(
      createResponse(refreshRequestConfig!, { accessToken: 'token-renovado' }),
    );

    const responses = await Promise.all(pendingRequests);

    expect(responses.map(({ data }) => data)).toEqual([{ ok: true }, { ok: true }]);
    expect(requests.filter(({ url }) => url === '/auth/refresh')).toHaveLength(
      1,
    );
    expect(requests.filter(({ url }) => url?.startsWith('/animes/'))).toHaveLength(
      4,
    );
  });
});
