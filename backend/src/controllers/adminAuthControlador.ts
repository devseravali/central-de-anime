import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { usuariosRepositorio } from '../repositories/usuariosRepositorio';
import { usuarioLoginDTO } from '../types/dtos/usuarioDTO';
import { gerarToken } from '../helpers/tokenHelper';
import { respostaSucesso } from '../helpers/responseHelpers';
import {
  looksLikeGoogleJwt,
  verifyGoogleIdToken,
} from '../infra/googleIdToken';

function getBearer(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length ? token : null;
}

export const autenticarAdmin = asyncHandler(
  async (req: Request, res: Response) => {
    const bearer = getBearer(req);

    if (bearer && looksLikeGoogleJwt(bearer)) {
      const payload = await verifyGoogleIdToken(bearer);
      const email = (payload.email ?? '').trim();
      if (!email) {
        throw ErroApi.unauthorized('Email não encontrado no provider.');
      }

      const usuario = await usuariosRepositorio.buscarPorEmail(email);
      if (!usuario) {
        throw new ErroApi(
          401,
          'Credenciais inválidas.',
          'INVALID_ADMIN_CREDENTIALS',
        );
      }

      const token = gerarToken(usuario.id, '1h', 'admin');
      return respostaSucesso(
        res,
        { token },
        { mensagem: 'Admin autenticado com sucesso' },
      );
    }

    if (
      !req.body ||
      typeof req.body !== 'object' ||
      !('email' in req.body) ||
      !('senha' in req.body)
    ) {
      throw ErroApi.badRequest(
        'Email e senha são obrigatórios.',
        'MISSING_CREDENTIALS',
      );
    }

    let dados;
    try {
      dados = usuarioLoginDTO.parse(req.body);
    } catch (e) {
      throw ErroApi.badRequest(
        'Dados de login inválidos.',
        'INVALID_LOGIN_DTO',
      );
    }

    const usuario = await usuariosRepositorio.buscarPorEmail(dados.email);

    if (!usuario) {
      throw new ErroApi(
        401,
        'Credenciais inválidas.',
        'INVALID_ADMIN_CREDENTIALS',
      );
    }

    const token = gerarToken(usuario.id, '1h', 'admin');

    return respostaSucesso(
      res,
      { token },
      { mensagem: 'Admin autenticado com sucesso (sem validação de senha)' },
    );
  },
);
