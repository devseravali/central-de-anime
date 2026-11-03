import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AxiosHeaders, type AxiosResponse } from 'axios';
import { api } from '../../src/services/api';
import { personagemService } from '../../src/services/personagem.service';
import type { Personagem } from '../../src/types/Personagem';

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

const apiGet = vi.mocked(api.get);
const response = <T>(data: T): AxiosResponse<T> => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: new AxiosHeaders(),
  config: { headers: new AxiosHeaders() },
});
const character: Personagem = { id: 1, nome: 'Personagem de teste' };

describe('personagemService', () => {
  beforeEach(() => {
    apiGet.mockReset();
  });

  it('lista personagens sem filtro usando o endpoint e retorna a lista vazia', async () => {
    apiGet.mockResolvedValue(response([]));

    await expect(personagemService.listarPersonagens()).resolves.toEqual([]);
    expect(apiGet).toHaveBeenCalledWith('/personagens', {
      params: undefined,
    });
  });

  it('encaminha animeId e urlBase ao listar personagens', async () => {
    apiGet.mockResolvedValue(response([character]));

    await expect(
      personagemService.listarPersonagens('42', '/animes/personagens'),
    ).resolves.toEqual([character]);
    expect(apiGet).toHaveBeenCalledWith('/animes/personagens', {
      params: { animeId: '42' },
    });
  });

  it('consulta uma URL customizada e retorna os dados sem transformar a resposta', async () => {
    apiGet.mockResolvedValue(response([character]));

    await expect(
      personagemService.listarPersonagensPorUrl(
        'https://api.example.test/personagens?animeId=4',
      ),
    ).resolves.toEqual([character]);
    expect(apiGet).toHaveBeenCalledWith(
      'https://api.example.test/personagens?animeId=4',
    );
  });

  it('codifica o ID e remove a barra final da URL base ao buscar por ID', async () => {
    apiGet.mockResolvedValue(response(character));

    await expect(
      personagemService.listarPersonagensPorId('id/externo', '/personagens/'),
    ).resolves.toEqual(character);
    expect(apiGet).toHaveBeenCalledWith('/personagens/id%2Fexterno');
  });

  it('usa a URL base padrão ao buscar personagem por ID numérico', async () => {
    apiGet.mockResolvedValue(response(character));

    await personagemService.listarPersonagensPorId(17);

    expect(apiGet).toHaveBeenCalledWith('/personagens/17');
  });

  it('busca um personagem por URL customizada', async () => {
    apiGet.mockResolvedValue(response(character));

    await expect(
      personagemService.buscarPersonagemPorUrl('/personagens/1?include=animes'),
    ).resolves.toEqual(character);
    expect(apiGet).toHaveBeenCalledWith('/personagens/1?include=animes');
  });

  it('propaga falhas do cliente HTTP sem substituí-las', async () => {
    const failure = new Error('Falha de comunicação');
    apiGet.mockRejectedValue(failure);

    await expect(personagemService.listarPersonagens()).rejects.toBe(failure);
    await expect(personagemService.listarPersonagensPorId(1)).rejects.toBe(
      failure,
    );
    await expect(personagemService.buscarPersonagemPorUrl('/personagens/1'))
      .rejects.toBe(failure);
  });
});
