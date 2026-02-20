import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('openapi.json - documentação geral', () => {
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

  it('deve conter info básica de documentação', () => {
    expect(openapi.openapi).toBeDefined();
    expect(openapi.info).toBeDefined();
    expect(openapi.info.title).toBeTruthy();
    expect(openapi.info.version).toBeTruthy();
    expect(openapi.info.description).toBeTruthy();
    expect(openapi.paths).toBeDefined();
  });

  it('deve conter pelo menos uma rota documentada', () => {
    expect(Object.keys(openapi.paths).length).toBeGreaterThan(0);
  });
});
