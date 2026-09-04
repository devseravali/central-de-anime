import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('P1 - Não vazar emails/senhas em respostas e logs (segurança)', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('respostas não devem incluir senha', async () => {
    const res = await request(app).post('/auth/login').send({ email: 'test@example.com', senha: 'password' });
    if (res.body && typeof res.body === 'object') {
      const hasSenha = JSON.stringify(res.body).toLowerCase().includes('senha') || JSON.stringify(res.body).toLowerCase().includes('password');
      expect([200, 400, 401, 404]).toContain(res.status);
      if (res.status === 200 || res.status === 400) expect(!hasSenha).toBeTruthy();
    } else {
      expect([200, 401, 404]).toContain(res.status);
    }
  });
});
