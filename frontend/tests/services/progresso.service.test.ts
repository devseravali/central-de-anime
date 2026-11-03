import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../src/services/api';
import { progressoService } from '../../src/services/progresso.service';
import { httpResponse, progress } from '../fixtures/userData';

vi.mock('../../src/services/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));

beforeEach(() => {
  vi.resetAllMocks();
});

describe('progressoService', () => {
  it('consulta progresso individual e lista do usuário sem perder metadados', async () => {
    const record = progress();
    vi.mocked(api.get)
      .mockResolvedValueOnce(httpResponse(record))
      .mockResolvedValueOnce(httpResponse([record]));
    await expect(progressoService.obterProgresso(7, 101)).resolves.toEqual(
      record,
    );
    await expect(progressoService.obterProgressosUsuario(7)).resolves.toEqual([
      record,
    ]);
    expect(api.get).toHaveBeenNthCalledWith(
      1,
      '/usuarios/7/episodios/101/progresso',
    );
    expect(api.get).toHaveBeenNthCalledWith(2, '/usuarios/7/progressos');
  });

  it.each([
    [0, false],
    [99, false],
    [100, true],
    [101, true],
  ] as const)(
    'envia porcentagem %s com assistido=%s',
    async (porcentagem, assistido) => {
      const record = { ...progress(), porcentagem, assistido };
      vi.mocked(api.put).mockResolvedValue(httpResponse(record));
      await expect(
        progressoService.atualizarProgresso(101, porcentagem),
      ).resolves.toEqual(record);
      expect(api.put).toHaveBeenCalledWith('/episodios/101/progresso', {
        porcentagem,
        assistido,
      });
    },
  );

  it('conclui episódio e limpa os registros do usuário nos endpoints próprios', async () => {
    vi.mocked(api.post).mockResolvedValue(httpResponse(progress()));
    vi.mocked(api.delete).mockResolvedValue(httpResponse(undefined));
    await expect(progressoService.concluirEpisodio(101)).resolves.toEqual(
      progress(),
    );
    await expect(
      progressoService.deleteProgressoUsuario(7),
    ).resolves.toBeUndefined();
    expect(api.post).toHaveBeenCalledWith('/episodios/101/concluir');
    expect(api.delete).toHaveBeenCalledWith('/usuarios/7/progressos');
  });

  it('lista vazia é sucesso; falhas de consulta e escrita são propagadas', async () => {
    vi.mocked(api.get).mockResolvedValueOnce(httpResponse([]));
    await expect(progressoService.obterProgressosUsuario(7)).resolves.toEqual(
      [],
    );
    const failure = new Error('Falha');
    vi.mocked(api.get).mockRejectedValue(failure);
    vi.mocked(api.put).mockRejectedValue(failure);
    vi.mocked(api.post).mockRejectedValue(failure);
    vi.mocked(api.delete).mockRejectedValue(failure);
    await expect(progressoService.obterProgresso(7, 101)).rejects.toBe(failure);
    await expect(progressoService.obterProgressosUsuario(7)).rejects.toBe(
      failure,
    );
    await expect(progressoService.atualizarProgresso(101, 0)).rejects.toBe(
      failure,
    );
    await expect(progressoService.concluirEpisodio(101)).rejects.toBe(failure);
    await expect(progressoService.deleteProgressoUsuario(7)).rejects.toBe(
      failure,
    );
  });
});
