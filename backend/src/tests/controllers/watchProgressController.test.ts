import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const watchProgressServiceMocks = vi.hoisted(() => ({
  getProgress: vi.fn(),
  updateProgress: vi.fn(),
  markAsCompleted: vi.fn(),
}));

vi.mock('../../services/watchProgressService', () => ({
  watchProgressService: watchProgressServiceMocks,
}));

import { watchProgressController } from '../../controllers/watchProgressController';

type RequisicaoGetProgress = Parameters<typeof watchProgressController.getProgress>[0];
type RequisicaoUpdateProgress = Parameters<typeof watchProgressController.updateProgress>[0];
type RequisicaoMarkCompleted = Parameters<typeof watchProgressController.markAsCompleted>[0];

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));
  return { res: { status, json } as unknown as Response, status, json };
}

describe('watchProgressController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve rejeitar consulta sem ids válidos', async () => {
    const req = { params: { usuarioId: '', episodioId: '' }, user: { id: 1, role: 'USER' } } as unknown as RequisicaoGetProgress;
    const { res, status, json } = criarResponse();

    await watchProgressController.getProgress(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      message: 'usuarioId e episodioId são obrigatórios',
    });
  });

  it('deve bloquear acesso ao progresso de outro usuário', async () => {
    const req = { params: { usuarioId: '2', episodioId: '10' }, user: { id: 1, role: 'USER' } } as unknown as RequisicaoGetProgress;
    const { res, status, json } = criarResponse();

    await watchProgressController.getProgress(req, res);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({ message: 'Acesso não autorizado' });
    expect(watchProgressServiceMocks.getProgress).not.toHaveBeenCalled();
  });

  it('deve retornar payload padrão quando não existir progresso', async () => {
    const req = { params: { usuarioId: '1', episodioId: '10' }, user: { id: 1, role: 'USER' } } as unknown as RequisicaoGetProgress;
    const { res, status, json } = criarResponse();
    watchProgressServiceMocks.getProgress.mockResolvedValueOnce(null);

    await watchProgressController.getProgress(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({
      usuarioId: 1,
      episodioId: 10,
      segundosAssistidos: 0,
      porcentagem: 0,
      assistido: false,
    });
  });

  it('deve repassar erro conhecido do service ao atualizar progresso', async () => {
    const req = { params: { episodioId: 10 }, user: { id: 1, role: 'USER' }, body: { porcentagem: 101 } } as unknown as RequisicaoUpdateProgress;
    const { res, status, json } = criarResponse();
    watchProgressServiceMocks.updateProgress.mockRejectedValueOnce(new Error('A porcentagem deve estar entre 0 e 100'));

    await watchProgressController.updateProgress(req, res);

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith({
      message: 'A porcentagem deve estar entre 0 e 100',
    });
  });

  it('deve concluir episódio com o usuário autenticado quando usuarioId não vier nos params', async () => {
    const req = { params: { episodioId: 12 }, user: { id: 3, role: 'USER' } } as unknown as RequisicaoMarkCompleted;
    const { res, status, json } = criarResponse();
    watchProgressServiceMocks.markAsCompleted.mockResolvedValueOnce({ episodioId: 12, usuarioId: 3, assistido: true });

    await watchProgressController.markAsCompleted(req, res);

    expect(watchProgressServiceMocks.markAsCompleted).toHaveBeenCalledWith(3, 12);
    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ episodioId: 12, usuarioId: 3, assistido: true });
  });
});