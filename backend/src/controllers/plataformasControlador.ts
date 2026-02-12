import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { plataformaServico } from '../services/plataformasServico';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';
import {
  plataformaCriacaoDTO,
  plataformaAtualizacaoDTO,
} from '../types/dtos/plataformaDTO';

function exigirId(req: Request): number {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    throw ErroApi.badRequest(
      'ID da plataforma inválido',
      'INVALID_PLATAFORMA_ID',
    );
  }
  return id;
}

function exigirNomeParam(req: Request): string {
  const nome =
    typeof req.params.nome === 'string' ? req.params.nome.trim() : '';
  if (!nome) {
    throw ErroApi.badRequest(
      'Nome da plataforma inválido',
      'INVALID_PLATAFORMA_NAME',
    );
  }
  return nome;
}

export const listarPlataformas = asyncHandler(
  async (_req: Request, res: Response) => {
    const plataformas = await plataformaServico.listar();
    return respostaLista(res, plataformas);
  },
);

export const obterTodasPlataformas = listarPlataformas;

export const buscarPlataformaPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = exigirId(req);

    const plataforma = await plataformaServico.buscarPorId(id);
    if (!plataforma) {
      throw ErroApi.notFound('Plataforma', 'PLATAFORMA_NOT_FOUND');
    }

    return respostaSucesso(res, plataforma);
  },
);

export const obterPlataformaPorId = buscarPlataformaPorId;

export const buscarPlataformaPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = exigirNomeParam(req);

    const plataforma = await plataformaServico.buscarPorNome(nome);
    if (!plataforma) {
      throw ErroApi.notFound('Plataforma', 'PLATAFORMA_NOT_FOUND');
    }

    return respostaSucesso(res, plataforma);
  },
);

export const listarAnimesPorPlataforma = asyncHandler(
  async (req: Request, res: Response) => {
    const id = exigirId(req);

    const animes = await plataformaServico.listarAnimes(id);
    if (!animes || animes.length === 0) {
      throw ErroApi.notFound(
        'Plataforma sem animes cadastrados',
        'NO_ANIMES_FOR_PLATAFORMA',
      );
    }

    return respostaLista(res, animes);
  },
);

export const criarPlataforma = asyncHandler(
  async (req: Request, res: Response) => {
    const dados = plataformaCriacaoDTO.parse(req.body);

    const existente = await plataformaServico.buscarPorNome(dados.nome);
    if (existente) {
      throw ErroApi.conflict(
        'Plataforma já existe no banco de dados',
        'PLATAFORMA_ALREADY_EXISTS',
      );
    }

    const criada = await plataformaServico.criar(dados);
    return respostaCriado(res, criada, 'Plataforma criada com sucesso');
  },
);

export const atualizarPlataforma = asyncHandler(
  async (req: Request, res: Response) => {
    const id = exigirId(req);
    const dados = plataformaAtualizacaoDTO.parse(req.body);

    if (dados.nome) {
      const existente = await plataformaServico.buscarPorNome(dados.nome);
      if (existente && existente.id !== id) {
        throw ErroApi.conflict(
          'Nome de plataforma já existe',
          'PLATAFORMA_ALREADY_EXISTS',
        );
      }
    }

    const atualizada = await plataformaServico.atualizar(id, dados);
    if (!atualizada) {
      throw ErroApi.notFound('Plataforma', 'PLATAFORMA_NOT_FOUND');
    }

    return respostaAtualizado(
      res,
      atualizada,
      'Plataforma atualizada com sucesso',
    );
  },
);

export const deletarPlataforma = asyncHandler(
  async (req: Request, res: Response) => {
    const id = exigirId(req);

    const deletada = await plataformaServico.deletar(id);
    if (!deletada) {
      throw ErroApi.notFound('Plataforma', 'PLATAFORMA_NOT_FOUND');
    }

    return respostaSucesso(res, null, {
      mensagem: 'Plataforma removida com sucesso',
    });
  },
);
