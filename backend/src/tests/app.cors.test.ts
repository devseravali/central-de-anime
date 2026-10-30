import { afterEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

describe('CORS de produção', () => {
  const originalEnvironment = {
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL: process.env.FRONTEND_URL,
    FRONTEND_ALLOWED_ORIGINS: process.env.FRONTEND_ALLOWED_ORIGINS,
  };

  afterEach(() => {
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
    process.env.NODE_ENV = 'production';
    process.env.FRONTEND_URL = 'https://centraldeanime.com';
    delete process.env.FRONTEND_ALLOWED_ORIGINS;
    vi.resetModules();

    const { default: app } = await import('../app');
    const allowedResponse = await request(app)
      .get('/health')
      .set('Origin', 'https://centraldeanime.com');
    const localResponse = await request(app)
      .get('/health')
      .set('Origin', 'http://localhost:5173');

    expect(allowedResponse.headers['access-control-allow-origin']).toBe(
      'https://centraldeanime.com'
    );
    expect(allowedResponse.headers['access-control-allow-credentials']).toBe(
      'true'
    );
    expect(localResponse.headers['access-control-allow-origin']).toBeUndefined();
  }, 20000);
});
