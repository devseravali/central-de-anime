import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios';

const ACCESS_TOKEN_STORAGE_KEY = 'accessToken';
const AUTH_SESSION_HINT_STORAGE_KEY = 'authSessionHint';
const AUTH_STATE_CHANGED_EVENT = 'auth-state-changed';

export const subscribeToAuthSessionChanges = (
  onSessionChange: () => void,
  onOtherStorageChange?: (event: StorageEvent) => void,
): (() => void) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === ACCESS_TOKEN_STORAGE_KEY || event.key === null) {
      onSessionChange();
      return;
    }

    onOtherStorageChange?.(event);
  };

  window.addEventListener(AUTH_STATE_CHANGED_EVENT, onSessionChange);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED_EVENT, onSessionChange);
    window.removeEventListener('storage', handleStorage);
  };
};

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  _skipAuthRefresh?: boolean;
};

const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
];

const buildAuthHeaders = (token: string): AxiosHeaders => {
  const headers = new AxiosHeaders();
  headers.set('Authorization', `Bearer ${token}`);
  return headers;
};

const getPathname = (url?: string): string => {
  if (!url) {
    return '';
  }

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  }

  return url;
};

const isAuthEndpoint = (url?: string): boolean => {
  const pathname = getPathname(url);
  return AUTH_ENDPOINTS.some((endpoint) =>
    pathname.startsWith(endpoint)
  );
};

const dispatchAuthStateChanged = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(AUTH_STATE_CHANGED_EVENT));
};

export const getAccessToken = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  return localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) ?? '';
};

const hasAuthSessionHint = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  return localStorage.getItem(AUTH_SESSION_HINT_STORAGE_KEY) === '1';
};

export const setAccessToken = (token: string) => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  localStorage.setItem(AUTH_SESSION_HINT_STORAGE_KEY, '1');
  dispatchAuthStateChanged();
};

export const clearAuthSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_SESSION_HINT_STORAGE_KEY);
  localStorage.removeItem('refreshToken');
  dispatchAuthStateChanged();
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const response = await api.post<{ accessToken?: string }>(
      '/auth/refresh',
      undefined,
      {
        withCredentials: true,
        _skipAuthRefresh: true,
      } as RetriableRequestConfig
    );

    const accessToken =
      typeof response.data?.accessToken === 'string'
        ? response.data.accessToken
        : '';

    if (!accessToken) {
      clearAuthSession();
      return null;
    }

    setAccessToken(accessToken);
    return accessToken;
  } catch {
    clearAuthSession();
    return null;
  }
};

const queueRefreshToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
};

export const bootstrapAuthSession = async (): Promise<void> => {
  const token = getAccessToken();

  if (token || !hasAuthSessionHint()) {
    return;
  }

  await queueRefreshToken();
};

api.interceptors.request.use((config) => {
  const requestConfig = config as RetriableRequestConfig;

  if (requestConfig._skipAuthRefresh) {
    return requestConfig;
  }

  const token = getAccessToken();

  if (!token) {
    return requestConfig;
  }

  if (!requestConfig.headers) {
    requestConfig.headers = buildAuthHeaders(token);
    return requestConfig;
  }

  const headers = new AxiosHeaders(requestConfig.headers);
  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  requestConfig.headers = headers;

  return requestConfig;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const requestConfig = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;

    if (!requestConfig || status !== 401) {
      return Promise.reject(error);
    }

    if (requestConfig._retry || requestConfig._skipAuthRefresh) {
      return Promise.reject(error);
    }

    if (isAuthEndpoint(requestConfig.url)) {
      return Promise.reject(error);
    }

    if (!getAccessToken() && !hasAuthSessionHint()) {
      return Promise.reject(error);
    }

    requestConfig._retry = true;

    const newAccessToken = await queueRefreshToken();

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    const headers = new AxiosHeaders(requestConfig.headers);
    headers.set('Authorization', `Bearer ${newAccessToken}`);
    requestConfig.headers = headers;

    return api(requestConfig);
  }
);