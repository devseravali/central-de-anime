export const getApiBaseUrl = (): string => {
  return (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');
};

export const getApiOrigin = (): string | null => {
  const baseUrl = import.meta.env.VITE_API_URL;

  if (typeof baseUrl !== 'string' || baseUrl.trim() === '') {
    return null;
  }

  try {
    return new URL(baseUrl).origin;
  } catch {
    return null;
  }
};