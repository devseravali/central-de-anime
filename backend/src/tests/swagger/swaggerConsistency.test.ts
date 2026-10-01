import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '../../app';
import { swaggerSpec } from '../../config/swagger';

type RouteEntry = {
  method: string;
  path: string;
};

function normalizePath(input: string): string {
  const withColonParams = input.replace(/\{([^}]+)\}/g, ':$1');
  const collapsed = withColonParams.replace(/\/+$/g, '');
  return collapsed || '/';
}

function joinPath(prefix: string, routePath: string): string {
  const a = prefix === '/' ? '' : prefix;
  const b = routePath.startsWith('/') ? routePath : `/${routePath}`;
  return normalizePath(`${a}${b}`.replace(/\/{2,}/g, '/'));
}

function extractBackendRoutes(): RouteEntry[] {
  const currentFilePath = fileURLToPath(import.meta.url);
  const testsDir = path.dirname(currentFilePath);
  const srcDir = path.resolve(testsDir, '..', '..');
  const appPath = path.resolve(srcDir, 'app.ts');
  const routesDir = path.resolve(srcDir, 'routes');

  const appSource = fs.readFileSync(appPath, 'utf8');

  const importRegex = /import\s+([A-Za-z0-9_]+)\s+from\s+'\.\/routes\/([^']+)'/g;
  const importedRouters = new Map<string, string>();

  let importMatch: RegExpExecArray | null;
  while ((importMatch = importRegex.exec(appSource)) !== null) {
    importedRouters.set(importMatch[1], `${importMatch[2]}.ts`);
  }

  const useRegex = /app\.use\(\s*['\"]([^'\"]+)['\"]\s*,\s*([A-Za-z0-9_]+)/g;
  const mounts: Array<{ prefix: string; varName: string }> = [];

  let useMatch: RegExpExecArray | null;
  while ((useMatch = useRegex.exec(appSource)) !== null) {
    mounts.push({
      prefix: useMatch[1],
      varName: useMatch[2],
    });
  }

  const routes: RouteEntry[] = [];
  const routeRegex = /\b[A-Za-z_][A-Za-z0-9_]*\.(get|post|put|patch|delete|options|head)\s*\(\s*(['\"])(.*?)\2/gms;

  for (const mount of mounts) {
    const routeFile = importedRouters.get(mount.varName);

    if (!routeFile) continue;

    const fullPath = path.resolve(routesDir, routeFile);

    if (!fs.existsSync(fullPath)) continue;

    const source = fs.readFileSync(fullPath, 'utf8');
    let routeMatch: RegExpExecArray | null;

    while ((routeMatch = routeRegex.exec(source)) !== null) {
      routes.push({
        method: routeMatch[1].toUpperCase(),
        path: joinPath(mount.prefix, routeMatch[3]),
      });
    }
  }

  const appGetRegex = /app\.get\(\s*['\"]([^'\"]+)['\"]/g;
  let appGetMatch: RegExpExecArray | null;

  while ((appGetMatch = appGetRegex.exec(appSource)) !== null) {
    routes.push({
      method: 'GET',
      path: normalizePath(appGetMatch[1]),
    });
  }

  return routes;
}

function extractSwaggerRoutes(): RouteEntry[] {
  const methods = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head'] as const;
  const routes: RouteEntry[] = [];

  for (const [routePath, routeDoc] of Object.entries(swaggerSpec.paths ?? {})) {
    for (const method of methods) {
      if ((routeDoc as Record<string, unknown>)[method]) {
        routes.push({
          method: method.toUpperCase(),
          path: normalizePath(routePath),
        });
      }
    }
  }

  return routes;
}

describe('Swagger/OpenAPI consistency', () => {
  it('deve ter estrutura mínima da swaggerSpec', () => {
    expect(swaggerSpec).toBeDefined();
    expect(swaggerSpec.openapi).toBeTruthy();
    expect(swaggerSpec.info).toBeDefined();
    expect(swaggerSpec.paths).toBeDefined();
    expect(Object.keys(swaggerSpec.paths ?? {}).length).toBeGreaterThan(0);
  });

  it('deve apontar para o servidor real sem /api no servers.url', () => {
    expect(swaggerSpec.servers?.[0]?.url).toBe('http://localhost:3000');
  });

  it('deve documentar a rota /animes', () => {
    const animesPath = swaggerSpec.paths?.['/animes'];
    expect(animesPath).toBeDefined();
    expect((animesPath as Record<string, unknown>).get).toBeDefined();
  });

  it('deve manter métodos documentados correspondentes às rotas existentes', () => {
    const backend = extractBackendRoutes();
    const swagger = extractSwaggerRoutes();

    const backendSet = new Set(backend.map((r) => `${r.method} ${r.path}`));
    const swaggerSet = new Set(swagger.map((r) => `${r.method} ${r.path}`));

    const missingInSwagger = [...backendSet].filter((key) => !swaggerSet.has(key));

    expect(missingInSwagger).toEqual([]);
  });

  it('deve retornar em /docs/openapi.json a mesma spec usada pelo Swagger UI', async () => {
    const response = await request(app).get('/docs/openapi.json');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(swaggerSpec);
  });
});
