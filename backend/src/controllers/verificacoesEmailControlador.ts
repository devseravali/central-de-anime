import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { verificacoesEmailServico } from '../services/verificacoesEmailServico';
import { usuariosRepositorio } from '../repositories/usuariosRepositorio';
import { ErroApi } from '../errors/ErroApi';

export const solicitarVerificacaoEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      throw ErroApi.unauthorized('Usuário não autenticado.');
    }

    const verificacao = await verificacoesEmailServico.criarVerificacaoEmail(
      Number(usuarioId),
    );

    return res.status(201).json({
      sucesso: true,
      dados: verificacao,
    });
  },
);

export const verificarEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.query.token;

    if (typeof token !== 'string' || !token.trim()) {
      throw ErroApi.badRequest('Token é obrigatório e deve ser uma string.');
    }

    const { usuarioId } = await verificacoesEmailServico.verificarToken(token);

    await usuariosRepositorio.marcarEmailVerificado(usuarioId);

    return res.status(200).json({
      sucesso: true,
      mensagem: 'E-mail verificado com sucesso.',
    });
  },
);
