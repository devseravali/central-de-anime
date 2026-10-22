import { getApiBaseUrl } from './apiUrl';

export function resolveApiMediaUrl(
  value: string | null | undefined
): string | null {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const normalizedPath = String(value)
    .trim()
    .replace(/^(?:\.\.\/)+/, '')
    .replace(/^\/+/, '');

  return `${getApiBaseUrl()}/${normalizedPath}`.replace(/\\/g, '/');
}
