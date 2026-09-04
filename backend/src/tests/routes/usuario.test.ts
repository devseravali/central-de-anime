import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const prismaMocks = vi.hoisted(() => ({
  usuarioFindMany: vi.fn(),
  usuarioFindUnique: vi.fn(),
  usuarioDelete: vi.fn(),
}));

const usuarioServiceMocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  promoteToAdmin: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    usuario: {
      findMany: prismaMocks.usuarioFindMany,
      findUnique: prismaMocks.usuarioFindUnique,
      delete: prismaMocks.usuarioDelete,
    },
  },
}));

vi.mock('../../services/usuarioService', () => ({
  usuarioService: usuarioServiceMocks,
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

    if (header === 'Bearer user-2-token') {
      req.user = { id: 2, role: 'USER', email: 'user2@teste.com', nome: 'User 2' };
      next();
      return;
    }

    res.status(401).json({ message: 'Token inválido ou expirado' });
  },
}));

vi.mock('../../middlewares/adminMiddleware', () => ({
  adminMiddleware: (req: { user?: UsuarioAutenticado }, res: { status: (code: number) => { json: (body: unknown) => unknown } }, next: () => void) => {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    if (req.user.role !== 'ADMIN') {
      res.status(403).json({ message: 'Acesso negado: privilégios de administrador necessários' });
      return;
    }

    next();
  },
}));

import app from '../../app';

describe('Rotas de usuário', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve listar usuários sem expor senha', async () => {
    prismaMocks.usuarioFindMany.mockResolvedValueOnce([
      {
        id: 1,
        nome: 'Luffy',
        email: 'luffy@teste.com',
        avatar: null,
        status: 'ACTIVE',
        criadoEm: new Date('2026-09-03T00:00:00.000Z'),
      },
    ]);

    const response = await request(app).get('/usuario');

    expect(response.status).toBe(200);
    expect(response.body.users).toHaveLength(1);
    expect(response.body.users[0].senha).toBeUndefined();
    expect(prismaMocks.usuarioFindMany).toHaveBeenCalledWith({
      select: {
        id: true,
        nome: true,
        email: true,
        avatar: true,
        status: true,
        criadoEm: true,
      },
      take: 200,
    });
  });

  it('deve retornar 500 quando falhar ao listar usuários', async () => {
    prismaMocks.usuarioFindMany.mockRejectedValueOnce(new Error('falha no banco'));

    const response = await request(app).get('/usuario');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao listar usuários' });
  });

  it('deve exigir autenticação para carregar o próprio perfil', async () => {
    const response = await request(app).get('/usuario/me');

    expect(response.status).toBe(401);
    expect(usuarioServiceMocks.getProfile).not.toHaveBeenCalled();
  });

  it('deve rejeitar token inválido ao carregar o próprio perfil', async () => {
    const response = await request(app)
      .get('/usuario/me')
      .set('Authorization', 'Bearer token-invalido');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token inválido ou expirado' });
    expect(usuarioServiceMocks.getProfile).not.toHaveBeenCalled();
  });

  it('deve carregar o próprio perfil autenticado', async () => {
    usuarioServiceMocks.getProfile.mockResolvedValueOnce({
      id: 1,
      nome: 'Luffy',
      email: 'luffy@teste.com',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });

    const response = await request(app)
      .get('/usuario/me')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Perfil carregado');
    expect(usuarioServiceMocks.getProfile).toHaveBeenCalledWith(1);
  });

  it('deve bloquear atualização de outro usuário', async () => {
    const response = await request(app)
      .put('/usuario/2')
      .set('Authorization', 'Bearer user-1-token')
      .send({ nome: 'Tentativa indevida' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(usuarioServiceMocks.updateProfile).not.toHaveBeenCalled();
  });

  it('deve buscar usuário por id com payload seguro', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 2,
      nome: 'Nami',
      email: 'nami@teste.com',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });

    const response = await request(app).get('/usuario/2');

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('OK');
    expect(response.body.user.senha).toBeUndefined();
    expect(prismaMocks.usuarioFindUnique).toHaveBeenCalledWith({
      where: { id: 2 },
      select: {
        id: true,
        nome: true,
        email: true,
        avatar: true,
        status: true,
        criadoEm: true,
      },
    });
  });

  it('deve rejeitar id inválido ao buscar usuário por id', async () => {
    const response = await request(app).get('/usuario/abc');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(prismaMocks.usuarioFindUnique).not.toHaveBeenCalled();
  });

  it('deve retornar 404 quando o usuário consultado não existir', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce(null);

    const response = await request(app).get('/usuario/2');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Usuário não encontrado' });
  });

  it('deve mascarar falha interna ao buscar usuário por id', async () => {
    prismaMocks.usuarioFindUnique.mockRejectedValueOnce(new Error('falha no banco'));

    const response = await request(app).get('/usuario/2');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao buscar usuário' });
  });

  it('deve rejeitar payload com campo extra para evitar mass assignment', async () => {
    const response = await request(app)
      .put('/usuario/me')
      .set('Authorization', 'Bearer user-1-token')
      .send({ nome: 'Luffy', role: 'ADMIN' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(usuarioServiceMocks.updateProfile).not.toHaveBeenCalled();
  });

  it('deve impedir que usuário comum altere o status pelo endpoint de id', async () => {
    const response = await request(app)
      .put('/usuario/1')
      .set('Authorization', 'Bearer user-1-token')
      .send({ status: 'BANNED' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'Alteração de status não permitida neste endpoint',
    });
    expect(usuarioServiceMocks.updateProfile).not.toHaveBeenCalled();
  });

  it('deve atualizar o próprio perfil com campos permitidos', async () => {
    usuarioServiceMocks.updateProfile.mockResolvedValueOnce({
      id: 1,
      nome: 'Monkey D. Luffy',
      email: 'luffy@teste.com',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });

    const response = await request(app)
      .put('/usuario/1')
      .set('Authorization', 'Bearer user-1-token')
      .send({ nome: 'Monkey D. Luffy', avatar: null });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('OK');
    expect(usuarioServiceMocks.updateProfile).toHaveBeenCalledWith(1, {
      nome: 'Monkey D. Luffy',
      avatar: null,
    });
  });

  it('deve permitir que admin atualize outro usuário com campos permitidos', async () => {
    usuarioServiceMocks.updateProfile.mockResolvedValueOnce({
      id: 2,
      nome: 'Nami Atualizada',
      email: 'nami@teste.com',
      avatar: 'nami.png',
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });

    const response = await request(app)
      .put('/usuario/2')
      .set('Authorization', 'Bearer admin-token')
      .send({
        nome: 'Nami Atualizada',
        email: 'nami@teste.com',
        senha: 'senha-segura',
        avatar: 'nami.png',
      });

    expect(response.status).toBe(200);
    expect(usuarioServiceMocks.updateProfile).toHaveBeenCalledWith(2, {
      nome: 'Nami Atualizada',
      email: 'nami@teste.com',
      senha: 'senha-segura',
      avatar: 'nami.png',
    });
  });

  it('deve retornar 400 para id inválido sem executar o service', async () => {
    const response = await request(app)
      .put('/usuario/abc')
      .set('Authorization', 'Bearer user-1-token')
      .send({ nome: 'Teste' });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(usuarioServiceMocks.updateProfile).not.toHaveBeenCalled();
  });

  it('deve mapear usuário inexistente para 404 ao atualizar', async () => {
    usuarioServiceMocks.updateProfile.mockRejectedValueOnce(new Error('Usuário não encontrado'));

    const response = await request(app)
      .put('/usuario/1')
      .set('Authorization', 'Bearer user-1-token')
      .send({ nome: 'Luffy' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Usuário não encontrado' });
  });

  it('deve mapear conflito de email para 409 ao atualizar', async () => {
    usuarioServiceMocks.updateProfile.mockRejectedValueOnce(new Error('Email já em uso'));

    const response = await request(app)
      .put('/usuario/1')
      .set('Authorization', 'Bearer user-1-token')
      .send({ email: 'duplicado@teste.com' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: 'Email já em uso' });
  });

  it('deve retornar 400 para erro de domínio ao atualizar', async () => {
    usuarioServiceMocks.updateProfile.mockRejectedValueOnce(new Error('Avatar inválido'));

    const response = await request(app)
      .put('/usuario/1')
      .set('Authorization', 'Bearer user-1-token')
      .send({ avatar: 'ftp://invalido' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Avatar inválido' });
  });

  it('deve impedir exclusão de outro usuário', async () => {
    const response = await request(app)
      .delete('/usuario/2')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Acesso negado' });
    expect(prismaMocks.usuarioDelete).not.toHaveBeenCalled();
  });

  it('deve excluir o próprio usuário quando autorizado', async () => {
    prismaMocks.usuarioDelete.mockResolvedValueOnce({ id: 1 });

    const response = await request(app)
      .delete('/usuario/1')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(204);
    expect(prismaMocks.usuarioDelete).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('deve rejeitar id inválido ao excluir usuário', async () => {
    const response = await request(app)
      .delete('/usuario/abc')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Dados de entrada inválidos');
    expect(prismaMocks.usuarioDelete).not.toHaveBeenCalled();
  });

  it('deve mapear usuário inexistente para 404 ao excluir', async () => {
    prismaMocks.usuarioDelete.mockRejectedValueOnce({ code: 'P2025' });

    const response = await request(app)
      .delete('/usuario/1')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Usuário não encontrado' });
  });

  it('deve mapear conflito de dependências para 409 ao excluir', async () => {
    prismaMocks.usuarioDelete.mockRejectedValueOnce({ code: 'P2003' });

    const response = await request(app)
      .delete('/usuario/1')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: 'Não é possível deletar usuário devido a dependências externas',
    });
  });

  it('deve retornar 500 ao excluir usuário quando ocorrer falha inesperada', async () => {
    prismaMocks.usuarioDelete.mockRejectedValueOnce(new Error('falha inesperada'));

    const response = await request(app)
      .delete('/usuario/1')
      .set('Authorization', 'Bearer user-1-token');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao deletar usuário' });
  });
});
