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

  it('preserva os sete nomes originais sem substituir por aliases', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');
    for (const filename of [
      'kimetsu-no-yaiba-mugen-t2.jpg',
      'kimetsu-no-yaiba-t4.jpg',
      'kimetsu-no-yaiba-t5.jpg',
      'kimetsu-no-yaiba-filme-1-akaza-sairai.jpg',
      'jujutsu-kaisen-inventario-oculto.jpg',
      'jujutsu-kaisen-incidente-de-shibuya.jpg',
      'made-in-abyss-the-retsujitsu-no-ougonkyou.jpg',
    ]) {
      const source = `..\\..\\images\\capas\\${filename}`;
      expect(resolveAnimeCoverUrl(source)).toBe(`https://api.example.test/images/capas/${filename}`);
      expect(source).toBe(`..\\..\\images\\capas\\${filename}`);
    }
  });

  it('não altera capitalização nem nomes das temporadas de Naruto Shippuden', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');

    expect(resolveAnimeCoverUrl('naruto-shippuden-4.jpg')).toBe(
      'https://api.example.test/naruto-shippuden-4.jpg',
    );
    expect(resolveAnimeCoverUrl('NARUTO-SHIPPUDEN-t12.jpg')).toBe(
      'https://api.example.test/NARUTO-SHIPPUDEN-t12.jpg',
    );
  });

  it('preserva nomes de arquivos sem regra de compatibilidade', () => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.test');

    expect(resolveAnimeCoverUrl('/capas/novo-anime.jpg')).toBe(
      'https://api.example.test/capas/novo-anime.jpg',
    );
  });
});
