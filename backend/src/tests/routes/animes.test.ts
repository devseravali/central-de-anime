import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';

type UsuarioAutenticado = {
  id: number;
  role: 'ADMIN' | 'USER';
  email: string;
  nome: string;
};

const animeControllerMocks = vi.hoisted(() => ({
  list: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json({ items: [] })),
  search: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json({ items: [] })),
  create: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(201).json({ id: 10 })),
  getById: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json({ id: 1 })),
  update: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json({ id: 1, updated: true })),
  remove: vi.fn((_req: unknown, res: { status: (code: number) => { send: () => unknown } }) => res.status(204).send()),
}));

const temporadaControllerMocks = vi.hoisted(() => ({
  list: vi.fn((req: { query: { animeId?: string } }, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json({ animeId: req.query.animeId })),
}));

const personagemControllerMocks = vi.hoisted(() => ({
  list: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json([])),
  getById: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json({ id: 1 })),
  listByAnimeId: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json([])),
}));

const episodioControllerMocks = vi.hoisted(() => ({
  list: vi.fn((req: { query: { temporadaId?: string } }, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json({ temporadaId: req.query.temporadaId })),
  getById: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json({ id: 1 })),
  listByAnimeAndSeasonNumber: vi.fn((_req: unknown, res: { status: (code: number) => { json: (body: unknown) => unknown } }) => res.status(200).json([])),
}));

const prismaMocks = vi.hoisted(() => ({
  animeFindUnique: vi.fn(),
  animeUpdate: vi.fn(),
  capasFindUnique: vi.fn(),
  capasUpdate: vi.fn(),
  capasFindMany: vi.fn(),
  queryRaw: vi.fn(),
}));

vi.mock('../../controllers/animeController', () => ({ animeController: animeControllerMocks }));
vi.mock('../../controllers/temporadaController', () => ({ temporadaController: temporadaControllerMocks }));
vi.mock('../../controllers/personagemController', () => ({ personagemController: personagemControllerMocks }));
vi.mock('../../controllers/episodioController', () => ({ episodioController: episodioControllerMocks }));

vi.mock('../../config/prisma', () => ({
  prisma: {
    anime: {
      findUnique: prismaMocks.animeFindUnique,
      update: prismaMocks.animeUpdate,
    },
    capas: {
      findUnique: prismaMocks.capasFindUnique,
      update: prismaMocks.capasUpdate,
      findMany: prismaMocks.capasFindMany,
    },
    $queryRaw: prismaMocks.queryRaw,
  },
}));

vi.mock('../../middlewares/authMiddleware', () => ({
  authMiddleware: (
    req: { headers: Record<string, string | undefined>; user?: UsuarioAutenticado },
    res: { status: (code: number) => { json: (body: unknown) => unknown } },
    next: () => void
  ) => {
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

    if (header === 'Bearer user-token') {
      req.user = { id: 1, role: 'USER', email: 'user@teste.com', nome: 'User' };
      next();
      return;
    }

    res.status(401).json({ message: 'Token inválido ou expirado' });
  },
}));

vi.mock('../../middlewares/adminMiddleware', () => ({
  adminMiddleware: (
    req: { user?: UsuarioAutenticado },
    res: { status: (code: number) => { json: (body: unknown) => unknown } },
    next: () => void
  ) => {
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

describe('Rotas de animes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve delegar listagem ao animeController', async () => {
    const response = await request(app).get('/animes');

    expect(response.status).toBe(200);
    expect(animeControllerMocks.list).toHaveBeenCalled();
  });

  it('deve exigir autenticação para criar anime', async () => {
    const response = await request(app).post('/animes').send({ titulo: 'Naruto' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token de autenticação não fornecido' });
    expect(animeControllerMocks.create).not.toHaveBeenCalled();
  });

  it('deve bloquear usuário comum ao criar anime', async () => {
    const response = await request(app)
      .post('/animes')
      .set('Authorization', 'Bearer user-token')
      .send({ titulo: 'Naruto' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      message: 'Acesso negado: privilégios de administrador necessários',
    });
    expect(animeControllerMocks.create).not.toHaveBeenCalled();
  });

  it('deve permitir criação de anime para admin', async () => {
    const response = await request(app)
      .post('/animes')
      .set('Authorization', 'Bearer admin-token')
      .send({ titulo: 'Naruto' });

    expect(response.status).toBe(201);
    expect(animeControllerMocks.create).toHaveBeenCalled();
  });

  it('deve rejeitar id inválido ao cadastrar capa', async () => {
    const response = await request(app)
      .post('/animes/capa')
      .set('Authorization', 'Bearer admin-token')
      .send({ animeId: 'abc' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'ID de anime inválido' });
  });

  it('deve rejeitar criação de capa sem body com id ausente', async () => {
    const response = await request(app)
      .post('/animes/capa')
      .set('Authorization', 'Bearer admin-token');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'ID de anime inválido' });
  });

  it('deve validar campos obrigatórios ao cadastrar capa', async () => {
    const response = await request(app)
      .post('/animes/capa')
      .set('Authorization', 'Bearer admin-token')
      .send({ animeId: 1, nome_original: 'capa.jpg' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'nome_original, nome_salvo, caminho e mime_type são obrigatórios',
    });
  });

  it('deve retornar 404 ao cadastrar capa para anime inexistente', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/animes/capa')
      .set('Authorization', 'Bearer admin-token')
      .send({
        animeId: 1,
        nome_original: 'capa.jpg',
        nome_salvo: 'capa-salva.jpg',
        caminho: '/img/capa.jpg',
        mime_type: 'image/jpeg',
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: 'Anime não encontrado' });
  });

  it('deve atualizar capa existente e vincular ao anime', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 1 });
    prismaMocks.capasFindUnique.mockResolvedValueOnce({ id: 5, caminho: '/img/capa.jpg' });
    prismaMocks.capasUpdate.mockResolvedValueOnce({ id: 5, caminho: '/img/capa.jpg' });
    prismaMocks.animeUpdate.mockResolvedValueOnce({ id: 1, capaUrl: '/img/capa.jpg' });

    const response = await request(app)
      .post('/animes/capa')
      .set('Authorization', 'Bearer admin-token')
      .send({
        animeId: 1,
        nome_original: 'capa.jpg',
        nome_salvo: 'capa-salva.jpg',
        caminho: '/img/capa.jpg',
        mime_type: 'image/jpeg',
      });

    expect(response.status).toBe(201);
    expect(prismaMocks.capasUpdate).toHaveBeenCalledWith({
      where: { id: 5 },
      data: {
        nome_original: 'capa.jpg',
        nome_salvo: 'capa-salva.jpg',
        mime_type: 'image/jpeg',
      },
    });
    expect(prismaMocks.animeUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { capaUrl: '/img/capa.jpg' },
    });
  });

  it('deve criar capa nova com upsert raw quando não existir registro prévio', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 1 });
    prismaMocks.capasFindUnique.mockResolvedValueOnce(null);
    prismaMocks.queryRaw.mockResolvedValueOnce([
      {
        id: 8,
        nome_original: 'nova-capa.jpg',
        nome_salvo: 'nova-capa-salva.jpg',
        caminho: '/img/nova-capa.jpg',
        mime_type: 'image/jpeg',
      },
    ]);
    prismaMocks.animeUpdate.mockResolvedValueOnce({ id: 1, capaUrl: '/img/nova-capa.jpg' });

    const response = await request(app)
      .post('/animes/capa')
      .set('Authorization', 'Bearer admin-token')
      .send({
        animeId: 1,
        nome_original: 'nova-capa.jpg',
        nome_salvo: 'nova-capa-salva.jpg',
        caminho: '/img/nova-capa.jpg',
        mime_type: 'image/jpeg',
      });

    expect(response.status).toBe(201);
    expect(prismaMocks.queryRaw).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual({
      message: 'Capa cadastrada com sucesso',
      capa: {
        id: 8,
        nome_original: 'nova-capa.jpg',
        nome_salvo: 'nova-capa-salva.jpg',
        caminho: '/img/nova-capa.jpg',
        mime_type: 'image/jpeg',
      },
      animeId: 1,
    });
  });

  it('deve retornar 500 quando o upsert de capa falhar', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ id: 1 });
    prismaMocks.capasFindUnique.mockResolvedValueOnce(null);
    prismaMocks.queryRaw.mockRejectedValueOnce(new Error('falha no banco'));

    const response = await request(app)
      .post('/animes/capa')
      .set('Authorization', 'Bearer admin-token')
      .send({
        animeId: 1,
        nome_original: 'erro.jpg',
        nome_salvo: 'erro-salvo.jpg',
        caminho: '/img/erro.jpg',
        mime_type: 'image/jpeg',
      });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao criar capa' });
  });

  it('deve encaminhar listagem de temporadas pelo id do anime', async () => {
    const response = await request(app).get('/animes/7/temporadas');
    const requisicaoEncaminhada = temporadaControllerMocks.list.mock.calls[0]?.[0] as {
      query?: { animeId?: string };
    } | undefined;

    expect(response.status).toBe(200);
    expect(temporadaControllerMocks.list).toHaveBeenCalled();
    expect(requisicaoEncaminhada?.query?.animeId).toBe('7');
  });

  it('deve retornar lista vazia quando o anime não tiver capa associada', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ capaUrl: null });

    const response = await request(app).get('/animes/1/capas');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(prismaMocks.capasFindMany).not.toHaveBeenCalled();
  });

  it('deve retornar as capas associadas quando o anime possuir capaUrl', async () => {
    prismaMocks.animeFindUnique.mockResolvedValueOnce({ capaUrl: '/img/capa.jpg' });
    prismaMocks.capasFindMany.mockResolvedValueOnce([
      { id: 1, caminho: '/img/capa.jpg', nome_salvo: 'capa.jpg' },
    ]);

    const response = await request(app).get('/animes/1/capas');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, caminho: '/img/capa.jpg', nome_salvo: 'capa.jpg' },
    ]);
    expect(prismaMocks.capasFindMany).toHaveBeenCalledWith({
      where: {
        caminho: '/img/capa.jpg',
      },
    });
  });

  it('deve retornar erro 400 para id inválido ao buscar capas', async () => {
    const response = await request(app).get('/animes/abc/capas');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'ID de anime inválido' });
  });

  it('deve retornar 500 quando houver falha ao buscar capas', async () => {
    prismaMocks.animeFindUnique.mockRejectedValueOnce(new Error('falha ao consultar anime'));

    const response = await request(app).get('/animes/1/capas');

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Erro ao buscar capas' });
  });

  it('deve delegar busca de animes para animeController.search', async () => {
    const response = await request(app).get('/animes/search?q=One');

    expect(response.status).toBe(200);
    expect(animeControllerMocks.search).toHaveBeenCalledTimes(1);
  });

  it('deve delegar getById para animeController.getById', async () => {
    const response = await request(app).get('/animes/10');

    expect(response.status).toBe(200);
    expect(animeControllerMocks.getById).toHaveBeenCalledTimes(1);
  });

  it('deve exigir autenticação e privilégios de admin para atualizar anime (PUT /animes/:id)', async () => {
    const resSemToken = await request(app).put('/animes/10').send({ titulo: 'Update' });
    expect(resSemToken.status).toBe(401);

    const resUserComum = await request(app)
      .put('/animes/10')
      .set('Authorization', 'Bearer user-token')
      .send({ titulo: 'Update' });
    expect(resUserComum.status).toBe(403);

    const resAdmin = await request(app)
      .put('/animes/10')
      .set('Authorization', 'Bearer admin-token')
      .send({ titulo: 'Update' });
    expect(resAdmin.status).toBe(200);
    expect(animeControllerMocks.update).toHaveBeenCalledTimes(1);
  });

  it('deve exigir autenticação e privilégios de admin para remover anime (DELETE /animes/:id)', async () => {
    const resSemToken = await request(app).delete('/animes/10');
    expect(resSemToken.status).toBe(401);

    const resUserComum = await request(app)
      .delete('/animes/10')
      .set('Authorization', 'Bearer user-token');
    expect(resUserComum.status).toBe(403);

    const resAdmin = await request(app)
      .delete('/animes/10')
      .set('Authorization', 'Bearer admin-token');
    expect(resAdmin.status).toBe(204);
    expect(animeControllerMocks.remove).toHaveBeenCalledTimes(1);
  });

  it('deve delegar /animes/:id/personagens para personagemController.listByAnimeId', async () => {
    const response = await request(app).get('/animes/5/personagens');

    expect(response.status).toBe(200);
    expect(personagemControllerMocks.listByAnimeId).toHaveBeenCalledTimes(1);
  });

  it('deve delegar /animes/:id/temporadas/:temporadaId/episodios para episodioController.list com temporadaId', async () => {
    const response = await request(app).get('/animes/2/temporadas/1/episodios');

    expect(response.status).toBe(200);
    expect(episodioControllerMocks.list).toHaveBeenCalled();
    expect(response.body).toEqual({ temporadaId: '1' });
  });
});
