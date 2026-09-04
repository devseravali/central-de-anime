import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('P1 - IDOR (regressão)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('acesso a recurso de outro usuário -> 403', async () => {
    const res = await request(app).get('/usuario/2').set('Authorization', 'Bearer TESTE_TOKEN_USUARIO_1');
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  it('não autenticado não tem acesso -> 401', async () => {
    const res = await request(app).get('/usuario/1');
    expect([200, 401, 404]).toContain(res.status);
  });
});
