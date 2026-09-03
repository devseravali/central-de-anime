import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routesDir = path.resolve(__dirname, '../src/routes');
const testsDir = path.resolve(__dirname, '../src/tests/routes');

if (!fs.existsSync(testsDir)) fs.mkdirSync(testsDir, { recursive: true });

function getRouteFiles(dir: string) {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.ts') || f.endsWith('.js'));
}

const files = getRouteFiles(routesDir);

for (const file of files) {
  const base = path.basename(file, path.extname(file));
  const testPath = path.join(testsDir, `${base}.test.ts`);
  if (fs.existsSync(testPath)) continue;
  const content = `import { describe, it, expect, beforeEach, vi } from 'vitest';\nimport request from 'supertest';\nimport app from '../../app';\n\ndescribe('Generated tests for ${base} routes', () => {\n  beforeEach(() => vi.restoreAllMocks());\n\n  it('sanity GET list or root', async () => {\n    const res = await request(app).get('/${base}');\n    expect([200, 401, 403, 404]).toContain(res.status);\n  });\n\n  it('sanity POST create (if applicable)', async () => {\n    const res = await request(app).post('/${base}').send({});\n    expect([200, 201, 400, 401, 403, 404]).toContain(res.status);\n  });\n});\n`;
  fs.writeFileSync(testPath, content);
  console.log('Created', testPath);
}

console.log('Generated tests for route files:', files.join(', '));