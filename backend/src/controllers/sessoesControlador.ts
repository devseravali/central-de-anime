import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { sessoesServico } from '../services/sessoesServico';
import { respostaSucesso, respostaCriado } from '../helpers/responseHelpers';
import { sessoesSchema } from '../schemas/sessoesSchema';

const DURACAO_SESSAO_MS = 7 * 24 * 60 * 60 * 1000;

export const criarSessao = asyncHandler(async (req: Request, res: Response) => {
  const parsed = sessoesSchema.safeParse(req.body);

  if (!parsed.success) {
    throw ErroApi.badRequest('Dados inválidos.', 'INVALID_SESSION_DATA');
  }

  const { email, senha } = parsed.data;

  const usuario = await sessoesServico.autenticarUsuario(email, senha);

  if (!usuario) {
    throw ErroApi.unauthorized('Credenciais inválidas.');
  }

  const expiraEm = new Date(Date.now() + DURACAO_SESSAO_MS);
  const refreshTokenHash = Math.random().toString(36).substring(2) + Date.now();

  const sessao = await sessoesServico.criarSessao({
    usuarioId: usuario.id,
    refreshTokenHash,
    dispositivo: req.headers['user-agent'],
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    expiraEm,
  });

  return respostaCriado(res, {
    id: sessao.id,
    refreshTokenHash,
    expiraEm: sessao.expiraEm,
    usuario: {
      id: usuario.id,
      email: usuario.email,
    },
  });
});

export const validarSessao = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshTokenHash =
      req.refreshTokenHash ??
      (typeof req.body?.refreshTokenHash === 'string'
        ? req.body.refreshTokenHash
        : undefined) ??
      (typeof req.headers['x-refresh-token'] === 'string'
        ? req.headers['x-refresh-token']
        : undefined);

    if (!refreshTokenHash) {
      throw ErroApi.unauthorized('Refresh token não fornecido.');
    }

    const sessao = await sessoesServico.validarSessao(refreshTokenHash);

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

    return respostaSucesso(res, {
      mensagem: 'Sessão encerrada com sucesso.',
    });
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