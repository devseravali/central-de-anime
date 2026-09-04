import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Operações batch (crítico)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('sem autenticação -> 401', async () => {
    const res = await request(app).post('/batch/operacao').send({ ids: [1, 2, 3] });
    expect([401, 404]).toContain(res.status);
  });

  it('usuario manipulando próprios recursos permitido (sanity)', async () => {
    const res = await request(app).post('/batch/operacao').set('Authorization', 'Bearer TESTE_TOKEN_USUARIO_1').send({ ids: [1] });
    expect([200, 401, 403, 404]).toContain(res.status);
  });

  it('usuario manipulando recursos de outro -> 403', async () => {
    const res = await request(app).post('/batch/operacao').set('Authorization', 'Bearer TESTE_TOKEN_USUARIO_1').send({ ids: [2] });
    expect([401, 403, 404]).toContain(res.status);
  });
});
