import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Rotas de imagens no openapi.json', () => {
  const openapiPath = path.join(__dirname, '../src/config/openapi.json');
  let openapi;

  beforeAll(() => {
    const raw = fs.readFileSync(openapiPath, 'utf-8');
    openapi = JSON.parse(raw);
  });

  it('deve documentar as rotas de imagens corretamente', () => {
    const paths = openapi.paths;
    expect(paths['/upload/capa/{nome}']).toBeDefined();
    expect(paths['/upload/capa/{nome}'].get).toBeDefined();
    expect(paths['/upload/personagem/{nome}']).toBeDefined();
    expect(paths['/upload/personagem/{nome}'].get).toBeDefined();
  });

  it('as rotas de imagens não devem estar duplicadas', () => {
    const seen = new Set();
    ['/upload/capa/{nome}', '/upload/personagem/{nome}'].forEach((route) => {
      if (openapi.paths[route]) {
        Object.keys(openapi.paths[route]).forEach((method) => {
          const key = `${route}:${method}`;
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        });
      }
    });
  });
});
