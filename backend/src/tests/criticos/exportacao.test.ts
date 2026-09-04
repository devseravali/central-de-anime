import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Exportação (crítico)', () => {
  it('deve manter a rota real de exportação protegida sem autenticação', async () => {
    const response = await request(app).get('/export/usuarios/1');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token de autenticação não fornecido' });
  });
});
