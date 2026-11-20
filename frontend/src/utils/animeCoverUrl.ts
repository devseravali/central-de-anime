import { getApiBaseUrl } from './apiUrl';

export function resolveAnimeCoverUrl(
  capaUrl: string | null | undefined
): string {
  if (!capaUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(capaUrl)) {
    return capaUrl;
  }

  const cleanedPath = capaUrl
    .trim()
    .replace(/\\/g, '/')
    .replace(/^(?:\.\.\/)+/, '')
    .replace(/^\/+/, '');

  return `${getApiBaseUrl()}/${cleanedPath}`;
}
