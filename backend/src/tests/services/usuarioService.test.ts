import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  usuarioFindUnique: vi.fn(),
  usuarioCreate: vi.fn(),
  usuarioUpdate: vi.fn(),
  adminUpsert: vi.fn(),
}));

const bcryptMocks = vi.hoisted(() => ({
  hash: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    usuario: {
      findUnique: prismaMocks.usuarioFindUnique,
      create: prismaMocks.usuarioCreate,
      update: prismaMocks.usuarioUpdate,
    },
    admin: {
      upsert: prismaMocks.adminUpsert,
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: bcryptMocks.hash,
  },
  hash: bcryptMocks.hash,
}));

import { usuarioService } from '../../services/usuarioService';

describe('usuarioService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve retornar perfil sem a senha', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 1,
      nome: 'Luffy',
      email: 'luffy@teste.com',
      senha: 'hash',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });

    const resultado = await usuarioService.getProfile(1);

    expect(resultado).toEqual({
      id: 1,
      nome: 'Luffy',
      email: 'luffy@teste.com',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });
  });

  it('deve rejeitar atualização de usuário inexistente', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce(null);

    await expect(usuarioService.updateProfile(1, { nome: 'Novo' })).rejects.toThrow('Usuário não encontrado');
  });

  it('deve rejeitar email já em uso por outro usuário', async () => {
    prismaMocks.usuarioFindUnique
      .mockResolvedValueOnce({ id: 1, email: 'atual@teste.com' })
      .mockResolvedValueOnce({ id: 2, email: 'novo@teste.com' });

    await expect(
      usuarioService.updateProfile(1, { email: 'novo@teste.com' })
    ).rejects.toThrow('Email já em uso');

    expect(prismaMocks.usuarioUpdate).not.toHaveBeenCalled();
  });

  it('deve normalizar email, aparar nome e hash de senha ao atualizar perfil', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 1,
      email: 'atual@teste.com',
    });
    bcryptMocks.hash.mockResolvedValueOnce('senha-hash');
    prismaMocks.usuarioUpdate.mockResolvedValueOnce({
      id: 1,
      nome: 'Novo Nome',
      email: 'novo@teste.com',
      senha: 'senha-hash',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });

    const resultado = await usuarioService.updateProfile(1, {
      nome: '  Novo Nome  ',
      email: '  NOVO@teste.com ',
      senha: '123456',
      avatar: null,
    });

    expect(prismaMocks.usuarioUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        nome: 'Novo Nome',
        email: 'novo@teste.com',
        senha: 'senha-hash',
        avatar: null,
      },
    });
    expect((resultado as Record<string, unknown>).senha).toBeUndefined();
  });

  it('deve retornar null se usuário não existir no getProfile', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce(null);

    const resultado = await usuarioService.getProfile(999);

    expect(resultado).toBeNull();
  });

  it('deve atualizar avatar e status no updateProfile', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 2,
      email: 'user2@teste.com',
    });
    prismaMocks.usuarioUpdate.mockResolvedValueOnce({
      id: 2,
      nome: 'User 2',
      email: 'user2@teste.com',
      senha: 'hash',
      avatar: 'http://avatar.png',
      status: 'SUSPENDED',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });

    const resultado = await usuarioService.updateProfile(2, {
      avatar: 'http://avatar.png',
      status: 'SUSPENDED',
    });

    expect(prismaMocks.usuarioUpdate).toHaveBeenCalledWith({
      where: { id: 2 },
      data: {
        avatar: 'http://avatar.png',
        status: 'SUSPENDED',
      },
    });
    expect(resultado.avatar).toBe('http://avatar.png');
    expect(resultado.status).toBe('SUSPENDED');
  });

  it('deve lançar erro ao tentar promover usuário inexistente a admin', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce(null);

    await expect(usuarioService.promoteToAdmin(999)).rejects.toThrow('Usuário não encontrado');
    expect(prismaMocks.adminUpsert).not.toHaveBeenCalled();
  });

  it('deve promover usuário existente a admin com nível padrão', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({ id: 9 });
    prismaMocks.adminUpsert.mockResolvedValueOnce({ id: 1 });

    await usuarioService.promoteToAdmin(9);

    expect(prismaMocks.adminUpsert).toHaveBeenCalledWith({
      where: { usuarioId: 9 },
      update: { nivel: 'moderador' },
      create: {
        usuario: {
          connect: { id: 9 },
        },
        nivel: 'moderador',
      },
    });
  });
});