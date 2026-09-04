import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  watchProgressFindUnique: vi.fn(),
  watchProgressUpsert: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    watchProgress: {
      findUnique: prismaMocks.watchProgressFindUnique,
      upsert: prismaMocks.watchProgressUpsert,
    },
  },
}));

import { watchProgressService } from '../../services/watchProgressService';

describe('watchProgressService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve buscar progresso por chave composta', async () => {
    prismaMocks.watchProgressFindUnique.mockResolvedValueOnce({ id: 1 });

    await watchProgressService.getProgress(2, 3);

    expect(prismaMocks.watchProgressFindUnique).toHaveBeenCalledWith({
      where: {
        usuarioId_episodioId: {
          usuarioId: 2,
          episodioId: 3,
        },
      },
    });
  });

  it('deve rejeitar tempo assistido negativo', async () => {
    await expect(
      watchProgressService.updateProgress(1, 2, { segundosAssistidos: -1 })
    ).rejects.toThrow('O tempo assistido não pode ser negativo');

    expect(prismaMocks.watchProgressUpsert).not.toHaveBeenCalled();
  });

  it('deve rejeitar porcentagem fora do intervalo', async () => {
    await expect(
      watchProgressService.updateProgress(1, 2, { porcentagem: 101 })
    ).rejects.toThrow('A porcentagem deve estar entre 0 e 100');

    await expect(
      watchProgressService.updateProgress(1, 2, { porcentagem: -1 })
    ).rejects.toThrow('A porcentagem deve estar entre 0 e 100');

    expect(prismaMocks.watchProgressUpsert).not.toHaveBeenCalled();
  });

  it('deve marcar como assistido automaticamente quando porcentagem for 100', async () => {
    prismaMocks.watchProgressUpsert.mockResolvedValueOnce({ id: 1, assistido: true, porcentagem: 100 });

    await watchProgressService.updateProgress(1, 10, { porcentagem: 100, assistido: false });

    expect(prismaMocks.watchProgressUpsert).toHaveBeenCalledWith({
      where: {
        usuarioId_episodioId: {
          usuarioId: 1,
          episodioId: 10,
        },
      },
      update: {
        porcentagem: 100,
        assistido: true,
      },
      create: {
        usuarioId: 1,
        episodioId: 10,
        segundosAssistidos: 0,
        porcentagem: 100,
        assistido: false,
      },
    });
  });

  it('deve concluir episódio com upsert padronizado', async () => {
    prismaMocks.watchProgressUpsert.mockResolvedValueOnce({ id: 2, assistido: true });

    await watchProgressService.markAsCompleted(4, 8);

    expect(prismaMocks.watchProgressUpsert).toHaveBeenCalledWith({
      where: {
        usuarioId_episodioId: {
          usuarioId: 4,
          episodioId: 8,
        },
      },
      update: {
        assistido: true,
        porcentagem: 100,
      },
      create: {
        usuarioId: 4,
        episodioId: 8,
        assistido: true,
        porcentagem: 100,
        segundosAssistidos: 0,
      },
    });
  });
});