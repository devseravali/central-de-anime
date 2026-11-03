import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveAnimeCoverUrl } from '../../src/utils/animeCoverUrl';

describe('resolveAnimeCoverUrl', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('retorna string vazia quando não existe capa', () => {
    expect(resolveAnimeCoverUrl(null)).toBe('');
    expect(resolveAnimeCoverUrl(undefined)).toBe('');
    expect(resolveAnimeCoverUrl('')).toBe('');
  });

  it('preserva URLs absolutas', () => {
    const url = 'https://cdn.example.test/anime/capa.jpg';

    expect(resolveAnimeCoverUrl(url)).toBe(url);
  });

  it('normaliza caminhos relativos com base na API', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test/');

    expect(resolveAnimeCoverUrl('../uploads/anime/capa.jpg')).toBe(
      'https://api.example.test/uploads/anime/capa.jpg',
    );
  });

  it('corrige nomes de capas cadastrados no mapa de compatibilidade', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');

    expect(resolveAnimeCoverUrl('/capas/kimetsu-no-yaiba-mugen-t2.jpg')).toBe(
      'https://api.example.test/capas/kimestu-no-yaiba-t2.jpg',
    );
    expect(
      resolveAnimeCoverUrl('capas/jujutsu-kaisen-incidente-de-shibuya.jpg'),
    ).toBe(
      'https://api.example.test/capas/jujutsu-kaisen-shibuya-x-shimetsu.jpg',
    );
  });

  it('normaliza variações conhecidas do nome das temporadas de Naruto Shippuden', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');

    expect(resolveAnimeCoverUrl('naruto-shippuden-4.jpg')).toBe(
      'https://api.example.test/naruto-shippuden-t4.jpg',
    );
    expect(resolveAnimeCoverUrl('NARUTO-SHIPPUDEN-t12.jpg')).toBe(
      'https://api.example.test/naruto-shippuden-t12.jpg',
    );
  });

  it('preserva nomes de arquivos sem regra de compatibilidade', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');

    expect(resolveAnimeCoverUrl('/capas/novo-anime.jpg')).toBe(
      'https://api.example.test/capas/novo-anime.jpg',
    );
  });
});
