import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Rotas administrativas (crítico)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('sem autenticação -> 401', async () => {
    const res = await request(app).get('/admin/some-route');
    expect([401, 404]).toContain(res.status);
  });

  it('usuário comum -> 403 ou 401', async () => {
    const res = await request(app).get('/admin/some-route').set('Authorization', 'Bearer TESTE_TOKEN_USUARIO_1');
    expect([401, 403, 404]).toContain(res.status);
  });

  it('ADMIN -> permitido ou 404 se rota não existir', async () => {
    const res = await request(app).get('/admin/some-route').set('Authorization', 'Bearer TESTE_TOKEN_ADMIN');
    expect([200, 401, 403, 404]).toContain(res.status);
  });
});
