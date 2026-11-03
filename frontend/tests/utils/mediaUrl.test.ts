import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveApiMediaUrl } from '../../src/utils/mediaUrl';

describe('resolveApiMediaUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('retorna null para valores ausentes', () => {
    expect(resolveApiMediaUrl(null)).toBeNull();
    expect(resolveApiMediaUrl(undefined)).toBeNull();
    expect(resolveApiMediaUrl('')).toBeNull();
  });

  it('preserva URLs HTTP absolutas', () => {
    const url = 'https://cdn.example.test/capa.jpg';

    expect(resolveApiMediaUrl(url)).toBe(url);
    expect(resolveApiMediaUrl('HTTP://cdn.example.test/capa.jpg')).toBe(
      'HTTP://cdn.example.test/capa.jpg',
    );
  });

  it('resolve caminho relativo contra a base configurada e remove prefixo relativo', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test///');

    expect(resolveApiMediaUrl('../uploads/capa.jpg')).toBe(
      'https://api.example.test/uploads/capa.jpg',
    );
    expect(resolveApiMediaUrl('  /uploads/capa.jpg  ')).toBe(
      'https://api.example.test/uploads/capa.jpg',
    );
  });

  it('usa caminho relativo à raiz quando a variável configurada está vazia', () => {
    vi.stubEnv('VITE_API_URL', '');

    expect(resolveApiMediaUrl('uploads/capa.jpg')).toBe(
      '/uploads/capa.jpg',
    );
  });

  it('normaliza barras invertidas em caminhos de mídia', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');

    expect(resolveApiMediaUrl('uploads\\animes\\capa.jpg')).toBe(
      'https://api.example.test/uploads/animes/capa.jpg',
    );
  });
});
