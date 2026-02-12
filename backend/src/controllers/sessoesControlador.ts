import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { sessoesServico } from '../services/sessoesServico';
import { respostaSucesso, respostaCriado } from '../helpers/responseHelpers';

const DURACAO_SESSAO_MS = 24 * 60 * 60 * 1000;

export const criarSessao = asyncHandler(async (req: Request, res: Response) => {
  const usuarioId = req.usuarioId;
  const token = req.token;

  if (!usuarioId || !token) {
    throw ErroApi.unauthorized('Dados de autenticação inválidos.');
  }

  const expiraEm = new Date(Date.now() + DURACAO_SESSAO_MS);

  const sessao = await sessoesServico.criarSessao({
    usuarioId,
    token,
    expiraEm,
  });

  return respostaCriado(res, {
    id: sessao.id,
    token: sessao.token,
    expiraEm: sessao.expiraEm,
  });
});

export const validarSessao = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.token;

    if (!token) {
      throw ErroApi.unauthorized('Token não fornecido.');
    }

    const sessao = await sessoesServico.validarSessao(token);

    return respostaSucesso(res, {
      id: sessao.id,
      usuarioId: sessao.usuarioId,
      expiraEm: sessao.expiraEm,
    });
  },
);

export const encerrarSessaoAtiva = asyncHandler(
  async (req: Request, res: Response) => {
    const sessaoId = req.sessaoId;

    if (!sessaoId) {
      throw ErroApi.badRequest(
        'ID de sessão não fornecido.',
        'SESSION_ID_MISSING',
      );
    }

    await sessoesServico.encerrarSessao(Number(sessaoId));

    return respostaSucesso(res, { mensagem: 'Sessão encerrada com sucesso.' });
  },
);

export const encerrarTodasSessoes = asyncHandler(
  async (req: Request, res: Response) => {
    const usuarioId = req.usuarioId;

    if (!usuarioId) {
      throw ErroApi.unauthorized('Usuário não autenticado.');
    }

    await sessoesServico.encerrarTodasSessoes(usuarioId);

    return respostaSucesso(res, {
      mensagem: 'Todas as sessões foram encerradas.',
    });
  },
);
