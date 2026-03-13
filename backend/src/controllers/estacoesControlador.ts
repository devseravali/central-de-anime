import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { estacoesServico } from '../services/estacoesServico';
import { parseIdParam } from '../helpers/httpParsers';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';
import { estacoesSchema } from '../schemas/estacoesSchema';

const estacaoNaoEncontrada = () =>
  ErroApi.notFound('Estação', 'ESTACAO_NOT_FOUND');

function getQueryString(req: Request, key: string): string {
  const v = req.query[key];

  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0].trim();

  return '';
}

export const listarEstacoes = asyncHandler(
  async (_req: Request, res: Response) => {
    const estacoes = await estacoesServico.listarTodos();
    return respostaLista(res, estacoes);
  },
);

export const buscarEstacaoPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(parseIdParam(req, 'estacao'));

    if (!Number.isInteger(id) || id <= 0) {
      throw ErroApi.badRequest('ID inválido', 'INVALID_ESTACAO_ID');
    }

    const estacao = await estacoesServico.buscarPorId(id);

    if (!estacao) {
      throw estacaoNaoEncontrada();
    }

    return respostaSucesso(res, estacao);
  },
);

export const buscarEstacaoPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = getQueryString(req, 'nome');

    if (!nome) {
      throw ErroApi.badRequest(
        'Nome da estação não fornecido',
        'INVALID_ESTACAO_NAME',
      );
    }

    const estacao = await estacoesServico.buscarPorNome(nome);

    if (!estacao) {
      throw estacaoNaoEncontrada();
    }

    return respostaSucesso(res, estacao);
  },
);

export const criarEstacao = asyncHandler(
  async (req: Request, res: Response) => {
    const parseResult = estacoesSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw ErroApi.badRequest(
        'Dados inválidos para estação',
        'INVALID_ESTACAO_DATA',
      );
    }

    const estacao = await estacoesServico.criar({
      nome: parseResult.data.nome,
    });

    return respostaCriado(res, estacao, 'Estação criada com sucesso');
  },
);

export const atualizarEstacao = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(parseIdParam(req, 'estacao'));

    if (!Number.isInteger(id) || id <= 0) {
      throw ErroApi.badRequest('ID inválido', 'INVALID_ESTACAO_ID');
    }

    const parseResult = estacoesSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw ErroApi.badRequest(
        'Dados inválidos para estação',
        'INVALID_ESTACAO_DATA',
      );
    }

    const estacaoAtualizada = await estacoesServico.atualizar(id, {
      nome: parseResult.data.nome,
    });

    if (!estacaoAtualizada) {
      throw estacaoNaoEncontrada();
    }

    return respostaAtualizado(
      res,
      estacaoAtualizada,
      'Estação atualizada com sucesso',
    );
  },
);

export const removerEstacao = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(parseIdParam(req, 'estacao'));

    if (!Number.isInteger(id) || id <= 0) {
      throw ErroApi.badRequest('ID inválido', 'INVALID_ESTACAO_ID');
    }

    await estacoesServico.remover(id);

    return respostaSucesso(res, {
      mensagem: 'Estação removida com sucesso',
    });
  },
);