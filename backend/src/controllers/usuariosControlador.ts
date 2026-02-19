import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { usuariosServico } from '../services/usuariosServico';
import { respostaSucesso, respostaCriado } from '../helpers/responseHelpers';

import {
  usuarioCriacaoDTO,
  usuarioLoginDTO,
  usuarioAtualizacaoDTO,
} from '../types/dtos/usuarioDTO';

function parseIdParamOrThrow(idStr: string | undefined, code: string): number {
  const id = Number(idStr);
  if (!idStr || Number.isNaN(id) || id <= 0) {
    throw ErroApi.badRequest('ID inválido.', code);
  }
  return id;
}

export const enviarVerificacaoEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const idStr = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseIdParamOrThrow(idStr, 'INVALID_USUARIO_ID');
    const { token } = await usuariosServico.criarTokenVerificacaoEmail(id);

    return respostaSucesso(res, { token });
  },
);

export const verificarEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const token =
      typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    if (!token)
      throw ErroApi.badRequest('Token é obrigatório.', 'INVALID_TOKEN');

    await usuariosServico.verificarEmail(token);

    return respostaSucesso(res, null, {
      mensagem: 'E-mail verificado com sucesso.',
    });
  },
);

export const registrarUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const dados = usuarioCriacaoDTO.parse(req.body);
    const novo = await usuariosServico.registrar(dados);

    return respostaCriado(res, novo, 'Usuário criado com sucesso');
  },
);

export const logoutUsuario = asyncHandler(
  async (_req: Request, res: Response) => {
    return respostaSucesso(res, null, {
      mensagem: 'Logout realizado com sucesso.',
    });
  },
);

export const listarUsuarios = asyncHandler(
  async (req: Request, res: Response) => {
    const pagina = parseInt(String(req.query.pagina ?? 1), 10);
    const limite = parseInt(String(req.query.limite ?? 20), 10);
    const usuarios = await usuariosServico.listar({ pagina, limite });
    return respostaSucesso(res, usuarios);
  },
);

export const obterUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const idValue =
      req.usuario?.id ??
      (typeof req.usuarioId === 'number' ? String(req.usuarioId) : undefined) ??
      req.params?.id;

    const idStr = Array.isArray(idValue) ? idValue[0] : idValue;

    const id = parseIdParamOrThrow(idStr, 'INVALID_USUARIO_ID');

    const usuario = await usuariosServico.buscarPorId(id);
    if (!usuario) throw ErroApi.notFound('Usuário', 'USUARIO_NOT_FOUND');

    return respostaSucesso(res, usuario);
  },
);

export const atualizarUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const idValue =
      req.usuario?.id ??
      (typeof req.usuarioId === 'number' ? String(req.usuarioId) : undefined);
    const idStr = Array.isArray(idValue) ? idValue[0] : idValue;
    const id = parseIdParamOrThrow(idStr, 'INVALID_USUARIO_ID');

    const dados = usuarioAtualizacaoDTO.parse(req.body);

    const atualizado = await usuariosServico.atualizar(id, dados);
    return respostaSucesso(res, atualizado, {
      mensagem: 'Usuário atualizado com sucesso.',
    });
  },
);

export const removerUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const idStr = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const id = parseIdParamOrThrow(idStr, 'INVALID_USUARIO_ID');

    await usuariosServico.remover(id);

    return respostaSucesso(res, null, {
      mensagem: 'Usuário removido com sucesso.',
    });
  },
);
