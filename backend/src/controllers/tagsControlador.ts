import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { tagServico } from '../services/tagsServico';
import { parseIdParam } from '../utils/parsers';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';
import { tagCriacaoDTO, tagAtualizacaoDTO } from '../types/dtos/tagDTO';

export const listarTags = asyncHandler(async (_req: Request, res: Response) => {
  const tags = await tagServico.listar();
  return respostaLista(res, tags);
});

export const buscarTagPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req);
    if (id === null) {
      throw ErroApi.badRequest('ID da tag inválido', 'INVALID_TAG_ID');
    }

    const tag = await tagServico.buscarPorId(id);
    if (!tag) {
      throw ErroApi.notFound('Tag', 'TAG_NOT_FOUND');
    }

    return respostaSucesso(res, tag);
  },
);

export const listarTagsPorId = buscarTagPorId;

export const buscarTagPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = String(req.query.nome ?? '').trim();
    if (!nome) {
      throw ErroApi.badRequest('Nome inválido', 'INVALID_TAG_NAME');
    }

    const tags = await tagServico.buscarPorNome(nome);
    return respostaLista(res, tags);
  },
);

export const buscarPorNome = buscarTagPorNome;

export const criarTag = asyncHandler(async (req: Request, res: Response) => {
  const dados = tagCriacaoDTO.parse(req.body);
  const nova = await tagServico.criar(dados);
  return respostaCriado(res, nova, 'Tag criada com sucesso');
});

export const adicionarTag = criarTag;

export const atualizarTag = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req);
    if (id === null) {
      throw ErroApi.badRequest('ID da tag inválido', 'INVALID_TAG_ID');
    }

    const dados = tagAtualizacaoDTO.parse(req.body);
    const atualizada = await tagServico.atualizar(id, dados);

    if (!atualizada) {
      throw ErroApi.notFound('Tag', 'TAG_NOT_FOUND');
    }

    return respostaAtualizado(res, atualizada, 'Tag atualizada com sucesso');
  },
);

export const deletarTag = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req);
  if (id === null) {
    throw ErroApi.badRequest('ID da tag inválido', 'INVALID_TAG_ID');
  }

  const removida = await tagServico.deletar(id);
  if (!removida) {
    throw ErroApi.notFound('Tag', 'TAG_NOT_FOUND');
  }

  return respostaSucesso(res, { mensagem: 'Tag removida com sucesso' });
});

export const removerTag = deletarTag;
