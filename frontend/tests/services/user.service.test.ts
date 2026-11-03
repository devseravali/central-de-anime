import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../src/services/api';
import { userService } from '../../src/services/user.service';
import { httpResponse, profile } from '../fixtures/userData';

vi.mock('../../src/services/api', () => ({
  api: { get: vi.fn(), put: vi.fn() },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('userService perfil', () => {
  it('busca o perfil autenticado e preserva o envelope usuario', async () => {
    vi.mocked(api.get).mockResolvedValue(httpResponse(profile()));
    await expect(userService.buscarMeuPerfil()).resolves.toEqual(profile());
    expect(api.get).toHaveBeenCalledWith('/usuario/me');
  });

  it.each(['/avatars/novo.jpg', null])(
    'atualiza o avatar para %s sem inventar campos',
    async (avatar) => {
      const updated = profile();
      updated.usuario.avatar = avatar;
      vi.mocked(api.put).mockResolvedValue(httpResponse(updated));
      await expect(userService.atualizarMeuPerfil({ avatar })).resolves.toEqual(
        updated,
      );
      expect(api.put).toHaveBeenCalledWith('/usuario/me', { avatar });
    },
  );

  it('propaga erros ao carregar e atualizar o perfil', async () => {
    const failure = new Error('Sessão expirada');
    vi.mocked(api.get).mockRejectedValue(failure);
    vi.mocked(api.put).mockRejectedValue(failure);
    await expect(userService.buscarMeuPerfil()).rejects.toBe(failure);
    await expect(
      userService.atualizarMeuPerfil({ nome: 'Nova pessoa' }),
    ).rejects.toBe(failure);
  });
});
