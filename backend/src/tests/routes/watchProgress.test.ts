import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const watchProgressServiceMocks = vi.hoisted(() => ({
  getProgress: vi.fn(),
  updateProgress: vi.fn(),
  markAsCompleted: vi.fn(),
}));

vi.mock('../../services/watchProgressService', () => ({
  watchProgressService: watchProgressServiceMocks,
}));

vi.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (req: { headers: Record<string, string | undefined>; user?: UsuarioAutenticado }, res: { status: (code: number) => { json: (body: unknown) => unknown } }, next: () => void) => {
    const header = req.headers.authorization;

    if (!header) {
      res.status(401).json({ message: 'Token de autenticação não fornecido' });
      return;
    }

    if (header === 'Bearer admin-token') {
      req.user = { id: 99, role: 'ADMIN', email: 'admin@teste.com', nome: 'Admin' };
      next();
      return;
    }

    if (header === 'Bearer user-1-token') {
      req.user = { id: 1, role: 'USER', email: 'user1@teste.com', nome: 'User 1' };
      next();
      return;
    }

    res.status(401).json({ message: 'Token inválido ou expirado' });
  },
}));

import app from '../../app';

describe('Rotas de progresso por episódio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve bloquear leitura do progresso de outro usuário', async () => {
    const response = await request(app)
      .get('/usuarios/2/episodios/10/progresso')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso não autorizado' });
    expect(watchProgressServiceMocks.getProgress).not.toHaveBeenCalled();
  });

  it('deve retornar progresso zerado quando não existir registro', async () => {
    watchProgressServiceMocks.getProgress.mockResolvedValueOnce(null);

    const response = await request(app)
      .get('/usuarios/1/episodios/10/progresso')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      usuarioId: 1,
      episodioId: 10,
      segundosAssistidos: 0,
      porcentagem: 0,
      assistido: false,
    });
    expect(watchProgressServiceMocks.getProgress).toHaveBeenCalledWith(1, 10);
  });

  it('deve rejeitar payload inválido no update sem executar o service', async () => {
    const response = await request(app)
      .put('/episodios/10/progresso')
      .set('Authorization', 'Bearer user-1-token')
      .send({ porcentagem: 101, usuarioId: 99 });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(watchProgressServiceMocks.updateProgress).not.toHaveBeenCalled();
  });

  it('deve atualizar progresso usando o usuário autenticado', async () => {
    watchProgressServiceMocks.updateProgress.mockResolvedValueOnce({
      usuarioId: 1,
      episodioId: 10,
      segundosAssistidos: 720,
      porcentagem: 75,
      assistido: false,
    });

    const response = await request(app)
      .put('/episodios/10/progresso')
      .set('Authorization', 'Bearer user-1-token')
      .send({ segundosAssistidos: 720, porcentagem: 75, assistido: false });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      usuarioId: 1,
      episodioId: 10,
      segundosAssistidos: 720,
      porcentagem: 75,
      assistido: false,
    });
    expect(watchProgressServiceMocks.updateProgress).toHaveBeenCalledWith(1, 10, {
      segundosAssistidos: 720,
      porcentagem: 75,
      assistido: false,
    });
  });

  it('deve marcar episódio como concluído', async () => {
    watchProgressServiceMocks.markAsCompleted.mockResolvedValueOnce({
      usuarioId: 1,
      episodioId: 10,
      segundosAssistidos: 1440,
      porcentagem: 100,
      assistido: true,
    });

    const response = await request(app)
      .post('/episodios/10/concluir')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body.assistido).toBe(true);
    expect(watchProgressServiceMocks.markAsCompleted).toHaveBeenCalledWith(1, 10);
  });
});
