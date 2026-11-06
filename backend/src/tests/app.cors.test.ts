import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

vi.mock('../config/prisma', () => ({ prisma: {} }));
vi.mock('../config/swagger.js', () => ({
  swaggerSpec: { openapi: '3.0.0', info: { title: 'Teste CORS', version: '1.0.0' }, paths: {} },
}));

describe('CORS de produção', () => {
  let app: typeof import('../app')['default'];
  const originalEnvironment = {
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,
    FRONTEND_ALLOWED_ORIGINS: process.env.FRONTEND_ALLOWED_ORIGINS,
  };

  beforeAll(async () => {
    vi.resetModules();
    const { loadEnvironment } = await import('../config/environment');
    loadEnvironment();
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_URL = 'https://centraldeanime.com';
    delete process.env.FRONTEND_ALLOWED_ORIGINS;
    app = (await import('../app')).default;
  }, 20000);

  afterAll(() => {
    for (const [key, value] of Object.entries(originalEnvironment)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }

    vi.resetModules();
  });

  it('permite a origem configurada com credenciais e não inclui localhost', async () => {
    const allowedResponse = await request(app)
      .get('/health')
      .set('Origin', 'https://centraldeanime.com');
    const localResponse = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');
    const preflight = await request(app)
      .options('/auth/login')
      .set('Origin', 'https://centraldeanime.com')
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'content-type,authorization');
    const rejected = await request(app)
      .options('/auth/refresh')
      .set('Origin', 'https://untrusted.example.test')
      .set('Access-Control-Request-Method', 'POST');

    expect(allowedResponse.status).toBe(200);
    expect(allowedResponse.headers['access-control-allow-origin']).toBe(
      'https://centraldeanime.com'
    );
    expect(allowedResponse.headers['access-control-allow-credentials']).toBe(
      'true'
    );
    expect(localResponse.headers['access-control-allow-origin']).toBeUndefined();
    expect(preflight.status).toBe(204);
    expect(preflight.headers['access-control-allow-origin']).toBe('https://centraldeanime.com');
    expect(preflight.headers['access-control-allow-credentials']).toBe('true');
    expect(preflight.headers['access-control-allow-methods']).toContain('POST');
    expect(preflight.headers['access-control-allow-headers']).toContain('authorization');
    expect(rejected.headers['access-control-allow-origin']).toBeUndefined();
  }, 20000);
});
