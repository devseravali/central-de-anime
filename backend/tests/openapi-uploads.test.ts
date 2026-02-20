import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('openapi.json - uploads de imagens', () => {
  const openapiPath = path.join(__dirname, '../src/config/openapi.json');
  let openapi: {
    openapi: string;
    info: { title: string; version: string; description: string };
    paths: Record<string, Record<string, unknown>>;
  };

  beforeAll(() => {
    const raw = fs.readFileSync(openapiPath, 'utf-8');
    openapi = JSON.parse(raw);
  });

  it('deve documentar as rotas de upload corretamente', () => {
    const paths = openapi.paths;
    expect(paths['/upload/capa']).toBeDefined();
    expect(paths['/upload/capa'].get).toBeDefined();
    expect(paths['/upload/personagem']).toBeDefined();
    expect(paths['/upload/personagem'].get).toBeDefined();
  });

  it('as rotas de upload não devem estar duplicadas', () => {
    const seen = new Set();
    ['/upload/capa', '/upload/personagem'].forEach((route) => {
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
