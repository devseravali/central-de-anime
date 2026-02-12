import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { statusServico } from '../services/statusServico';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';

import {
  statusCriacaoDTO,
  statusAtualizacaoDTO,
} from '../types/dtos/statusDTO';

export const listarStatus = asyncHandler(
  async (_req: Request, res: Response) => {
    const lista = await statusServico.listar();
    return respostaLista(res, lista);
  },
);

export const buscarTodosStatus = listarStatus;

export const buscarStatusPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw ErroApi.badRequest('ID do status inválido', 'INVALID_STATUS_ID');
    }

    const item = await statusServico.buscarPorId(id);
    if (!item) {
      throw ErroApi.notFound('Status', 'STATUS_NOT_FOUND');
    }

    return respostaSucesso(res, item);
  },
);

export const buscarStatusPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const { nome } = req.params;
    if (!nome || typeof nome !== 'string' || nome.trim() === '') {
      throw ErroApi.badRequest(
        'Nome do status inválido',
        'INVALID_STATUS_NAME',
      );
    }

    const item = await statusServico.buscarPorNome(nome);
    if (!item) {
      throw ErroApi.notFound('Status', 'STATUS_NOT_FOUND');
    }

    return respostaSucesso(res, item);
  },
);

export const criarStatus = asyncHandler(async (req: Request, res: Response) => {
  const dados = statusCriacaoDTO.parse(req.body);
  const criado = await statusServico.criar(dados);
  return respostaCriado(res, criado, 'Status criado com sucesso');
});

export const adicionarStatus = criarStatus;

export const atualizarStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw ErroApi.badRequest('ID do status inválido', 'INVALID_STATUS_ID');
    }

    const dados = statusAtualizacaoDTO.parse(req.body);
    const atualizado = await statusServico.atualizar(id, dados);

    if (!atualizado) {
      throw ErroApi.notFound('Status', 'STATUS_NOT_FOUND');
    }

    return respostaAtualizado(res, atualizado, 'Status atualizado com sucesso');
  },
);

export const deletarStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      throw ErroApi.badRequest('ID do status inválido', 'INVALID_STATUS_ID');
    }

    const deletado = await statusServico.deletar(id);
    if (!deletado) {
      throw ErroApi.notFound('Status', 'STATUS_NOT_FOUND');
    }

    return respostaSucesso(res, null, {
      mensagem: 'Status removido com sucesso',
    });
  },
);
