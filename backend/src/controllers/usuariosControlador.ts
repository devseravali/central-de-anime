import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { usuariosServico } from '../services/usuariosServico';
import { sessoesServico } from '../services/sessoesServico';
import { respostaSucesso, respostaCriado } from '../helpers/responseHelpers';
import jwt from 'jsonwebtoken';
import { usuariosSchema } from '../schemas/usuariosSchema';

function parseIdParamOrThrow(
  idStr: string | undefined,
  code = 'INVALID_ID',
): number {
  const id = Number(idStr);

  if (!idStr || Number.isNaN(id) || id <= 0) {
    throw ErroApi.badRequest('ID inválido.', code);
  }

  return id;
}

function sanitizarUsuario(usuario: any) {
  const { senha, senhaHash, ...usuarioPublico } = usuario;
  return usuarioPublico;
}

export const enviarVerificacaoEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params?.id)
      ? req.params.id[0]
      : req.params?.id;

    const id = parseIdParamOrThrow(idParam, 'INVALID_USUARIO_ID');

    const { token } = await usuariosServico.criarTokenVerificacaoEmail(id);

    return respostaSucesso(res, { token });
  },
);

export const verificarEmail = asyncHandler(
  async (req: Request, res: Response) => {
    const token =
      typeof req.body?.token === 'string' ? req.body.token.trim() : '';

    if (!token) {
      throw ErroApi.badRequest('Token é obrigatório.', 'INVALID_TOKEN');
    }

    await usuariosServico.verificarEmail(token);

    return respostaSucesso(res, null, {
      mensagem: 'E-mail verificado com sucesso.',
    });
  },
);

export const registrarUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const parseResult = usuariosSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw ErroApi.badRequest('Dados inválidos', 'INVALID_USER_DATA');
    }

    const dados = parseResult.data;

    const novo = await usuariosServico.registrar({
      nome: dados.username,
      email: dados.email,
      senha: dados.senha,
    });

    return respostaCriado(
      res,
      sanitizarUsuario(novo),
      'Usuário criado com sucesso',
    );
  },
);

export const loginUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const parseResult = usuariosSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw ErroApi.badRequest('Dados inválidos', 'INVALID_LOGIN_DATA');
    }

    const { email, senha } = parseResult.data;

    const usuario = await usuariosServico.loginLocal({
      email,
      senha,
    });

    const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

    const expiraEm = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const refreshTokenHash =
      Math.random().toString(36).substring(2) + Date.now();

    const sessao = await sessoesServico.criarSessao({
      usuarioId: usuario.id,
      refreshTokenHash,
      expiraEm,
    });

    const token = jwt.sign(
      { usuarioId: usuario.id, sessaoId: sessao.id },
      JWT_SECRET,
      { expiresIn: '1d' },
    );

    return respostaSucesso(
      res,
      {
        usuario: sanitizarUsuario(usuario),
        token,
      },
      {
        mensagem: 'Login realizado com sucesso.',
      },
    );
  },
);

export const logoutUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.sessaoId) {
      throw ErroApi.unauthorized('Sessão não encontrada.');
    }

    await sessoesServico.encerrarSessao(Number(req.sessaoId));

    return respostaSucesso(res, null, {
      mensagem: 'Logout realizado com sucesso.',
    });
  },
);

export const listarUsuarios = asyncHandler(
  async (req: Request, res: Response) => {
    const pagina = Number(req.query.pagina ?? 1);
    const limite = Number(req.query.limite ?? 20);

    const usuarios = await usuariosServico.listar({
      pagina,
      limite,
    });

    const usuariosPublicos = usuarios.map(sanitizarUsuario);

    return respostaSucesso(res, usuariosPublicos);
  },
);

export const obterUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params?.id)
      ? req.params.id[0]
      : req.params?.id;

    const id =
      typeof req.usuarioId === 'number'
        ? req.usuarioId
        : parseIdParamOrThrow(idParam, 'INVALID_USUARIO_ID');

    const usuario = await usuariosServico.buscarPorId(id);

    if (!usuario) {
      throw ErroApi.notFound('Usuário', 'USUARIO_NOT_FOUND');
    }

    return respostaSucesso(res, sanitizarUsuario(usuario));
  },
);

export const atualizarUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    if (typeof req.usuarioId !== 'number') {
      throw ErroApi.unauthorized('Usuário não autenticado.');
    }

    const parseResult = usuariosSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw ErroApi.badRequest('Dados inválidos', 'INVALID_USER_DATA');
    }

    const atualizado = await usuariosServico.atualizar(
      req.usuarioId,
      parseResult.data,
    );

    return respostaSucesso(res, sanitizarUsuario(atualizado), {
      mensagem: 'Usuário atualizado com sucesso.',
    });
  },
);

export const removerUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const idParam = Array.isArray(req.params?.id)
      ? req.params.id[0]
      : req.params?.id;

    const id = parseIdParamOrThrow(idParam, 'INVALID_USUARIO_ID');

    await usuariosServico.remover(id);

    return res.json({
      sucesso: true,
      mensagem: 'Usuário removido com sucesso.',
    });
  },
);
