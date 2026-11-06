import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';

const login = vi.hoisted(() => vi.fn());
vi.mock('../../services/authService', () => ({
  authService: { login },
}));

import app from '../../app';

describe('P1 - Não vazar emails/senhas em respostas e logs (segurança)', () => {
  beforeEach(() => login.mockReset());

  it('respostas não devem incluir senha', async () => {
    login.mockResolvedValueOnce({
      user: { id: 1, nome: 'Teste', email: 'test@example.com' },
      accessToken: 'access-token-teste',
      refreshToken: 'refresh-token-teste',
      refreshExpiraEm: new Date('2030-01-01T00:00:00.000Z'),
    });
    const res = await request(app).post('/auth/login').send({ email: 'test@example.com', senha: 'password' });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('test@example.com');
    expect(res.body.accessToken).toBe('access-token-teste');
    expect(JSON.stringify(res.body).toLowerCase()).not.toMatch(/senha|password|refresh-token-teste/);
    expect(login).toHaveBeenCalledOnce();
  });
});
