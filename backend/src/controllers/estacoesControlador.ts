import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { estacoesServico } from '../services/estacoesServico';
import { validarEstacaoPayload } from '../utils/validacao';
import { parseIdParam } from '../helpers/httpParsers';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
} from '../helpers/responseHelpers';

function getQueryString(req: Request, key: string) {
  const v = req.query[key];
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0].trim();
  return '';
}

const estacaoNaoEncontrada = () =>
  ErroApi.notFound('Estação', 'ESTACAO_NOT_FOUND');

export const listarEstacoes = asyncHandler(
  async (_req: Request, res: Response) => {
    const estacoes = await estacoesServico.listarEstacoes();
    return respostaLista(res, estacoes);
  },
);

export const listarEstacaoPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req, 'estação');

    const estacao = await estacoesServico.listarEstacaoPorId(id);
    if (!estacao) throw estacaoNaoEncontrada();

    return respostaSucesso(res, estacao);
  },
);

export const listarEstacaoPorNome = asyncHandler(
  async (req: Request, res: Response) => {
    const nome = getQueryString(req, 'nome');
    if (!nome) {
      throw ErroApi.badRequest(
        'Nome da estação não fornecido',
        'INVALID_ESTACAO_NAME',
      );
    }

    const estacao = await estacoesServico.listarEstacaoPorNome(nome);
    if (!estacao) throw estacaoNaoEncontrada();

    return respostaSucesso(res, estacao);
  },
);

export const adicionarEstacao = asyncHandler(
  async (req: Request, res: Response) => {
    const validado = validarEstacaoPayload(req.body);
    if (!validado) {
      throw ErroApi.badRequest(
        'Dados inválidos para estação',
        'INVALID_ESTACAO_DATA',
      );
    }

    const estacao = await estacoesServico.adicionarEstacao(validado);
    return respostaCriado(res, estacao, 'Estação criada com sucesso');
  },
);

export const atualizarEstacao = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req, 'estação');

    const validado = validarEstacaoPayload(req.body);
    if (!validado) {
      throw ErroApi.badRequest(
        'Dados inválidos para estação',
        'INVALID_ESTACAO_DATA',
      );
    }

    const estacaoAtualizada = await estacoesServico.atualizarEstacao(
      Number(id),
      validado,
    );
    if (!estacaoAtualizada) throw estacaoNaoEncontrada();

    return respostaAtualizado(
      res,
      estacaoAtualizada,
      'Estação atualizada com sucesso',
    );
  },
);

export const removerEstacao = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req, 'estação');

    const existe = await estacoesServico.listarEstacaoPorId(id);
    if (!existe) throw estacaoNaoEncontrada();

    await estacoesServico.removerEstacao(Number(id));
    return respostaSucesso(res, { mensagem: 'Estação removida com sucesso' });
  },
);
