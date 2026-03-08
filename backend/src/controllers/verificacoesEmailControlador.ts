import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { prisma } from '../lib/prisma';
import { verificacoesEmailServico } from '../services/verificacoesEmailServico';
import { emailSchema } from '../schemas/emailSchema';

export const enviarVerificacaoEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const { email } = emailSchema.parse(req.body);

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!usuario) {
      throw ErroApi.notFound('Usuário não encontrado.');
    }

    const verificacao = await verificacoesEmailServico.criarVerificacaoEmail(
      usuario.id,
    );

    return res.status(201).json({
      sucesso: true,
      dados: verificacao,
    });
  },
);

export const solicitarVerificacaoEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const usuarioId = req.usuarioId;

    if (!usuarioId || typeof usuarioId !== 'number') {
      throw ErroApi.unauthorized('Usuário não autenticado.');
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: {
        id: true,
        emailVerificado: true,
      },
    });

    if (!usuario) {
      throw ErroApi.notFound('Usuário não encontrado.');
    }

    if (usuario.emailVerificado) {
      throw ErroApi.badRequest(
        'E-mail já verificado.',
        'EMAIL_ALREADY_VERIFIED',
      );
    }

    const verificacao =
      await verificacoesEmailServico.criarVerificacaoEmail(usuarioId);

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
      throw ErroApi.badRequest(
        'Token é obrigatório e deve ser uma string.',
        'INVALID_TOKEN',
      );
    }

    const tokenLimpo = token.trim();

    const verificacao = await prisma.verificacao.findFirst({
      where: { valor: tokenLimpo },
    });

    if (!verificacao) {
      throw ErroApi.badRequest('Token inválido.', 'INVALID_TOKEN');
    }

    if (verificacao.usadoEm) {
      throw ErroApi.badRequest('Token já utilizado.', 'TOKEN_ALREADY_USED');
    }

    if (verificacao.expiraEm && verificacao.expiraEm < new Date()) {
      throw ErroApi.badRequest('Token expirado.', 'TOKEN_EXPIRED');
    }

    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: verificacao.usuarioId },
        data: { emailVerificado: true },
      }),
      prisma.verificacao.update({
        where: { id: verificacao.id },
        data: { usadoEm: new Date() },
      }),
    ]);

    return res.status(200).json({
      sucesso: true,
      mensagem: 'E-mail verificado com sucesso.',
    });
  },
);