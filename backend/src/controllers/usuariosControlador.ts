import type { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { usuariosServico } from '../services/usuariosServico';
import { sessoesServico } from '../services/sessoesServico';
import { enviarEmail } from '../services/emailServico';
import { respostaSucesso, respostaCriado } from '../helpers/responseHelpers';
import jwt from 'jsonwebtoken';
import { loginSchema, usuariosSchema } from '../schemas/usuariosSchema';
import {
  recuperarSenhaSchema,
  redefinirSenhaSchema,
} from '../schemas/recuperacaoSenhaSchema';

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
    console.log('--- [enviarVerificacaoEmail] chamada ---');
    console.log('req.params:', req.params);
    console.log('req.body:', req.body);
    const idParam = Array.isArray(req.params?.id)
      ? req.params.id[0]
      : req.params?.id;

    const id = parseIdParamOrThrow(idParam, 'INVALID_USUARIO_ID');

    const usuario = await usuariosServico.buscarPorId(id);

    if (!usuario) {
      throw ErroApi.notFound('Usuário', 'USUARIO_NOT_FOUND');
    }

    const { token } = await usuariosServico.criarTokenVerificacaoEmail(id);

    const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verificar-email?token=${token}`;
    const emailEnviado = await enviarEmail(
      usuario.email,
      'Verifique seu e-mail',
      `<p>Olá, ${usuario.nome}! Clique <a href="${link}">aqui</a> para verificar seu e-mail.</p>`,
    ).catch((error: unknown) => {
      console.error('Falha ao enviar e-mail de verificação:', error);
      return false;
    });

    return respostaSucesso(res, null, {
      mensagem: emailEnviado
        ? 'E-mail de verificação enviado com sucesso.'
        : 'Token gerado, mas o e-mail não pôde ser enviado. Verifique a configuração SMTP.',
    });
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

    const { token } = await usuariosServico.criarTokenVerificacaoEmail(novo.id);

    const linkNovo = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verificar-email?token=${token}`;
    const emailEnviado = await enviarEmail(
      novo.email,
      'Verifique seu e-mail',
      `<p>Olá, ${novo.nome}! Clique <a href="${linkNovo}">aqui</a> para verificar seu e-mail.</p>`,
    ).catch((error: unknown) => {
      console.error(
        'Usuário criado, mas houve falha ao enviar e-mail de verificação:',
        error,
      );
      return false;
    });

    return respostaCriado(
      res,
      sanitizarUsuario(novo),
      emailEnviado
        ? 'Usuário criado com sucesso. Verifique seu e-mail para ativar a conta.'
        : 'Usuário criado, mas não foi possível enviar o e-mail de verificação. Verifique a configuração SMTP.',
    );
  },
);

export const loginUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    console.log('[loginUsuario] req.body:', req.body);
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      console.log('[loginUsuario] Dados inválidos:', parseResult.error);
      throw ErroApi.badRequest('Dados inválidos', 'INVALID_LOGIN_DATA');
    }

    const { email, senha } = parseResult.data;
    console.log('[loginUsuario] email:', email, 'senha:', senha);

    const usuario = await usuariosServico.loginLocal({
      email,
      senha,
    });
    console.log('[loginUsuario] usuario encontrado:', usuario);

    const JWT_SECRET = process.env.JWT_SECRET || 'sua-chave-secreta';

    // Expiração do token: 2 dias (48h)
    const token = jwt.sign(
      { usuarioId: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '48h' },
    );

    const expiraEm = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const refreshTokenHash =
      Math.random().toString(36).substring(2) + Date.now();

    const sessao = await sessoesServico.criarSessao({
      usuarioId: usuario.id,
      refreshTokenHash,
      expiraEm,
    });

    // Salva o id do usuário na sessão
    req.session.usuarioId = usuario.id;

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

    console.log('[obterUsuario] req.usuarioId:', req.usuarioId);
    const usuario = await usuariosServico.buscarPorId(id);
    console.log('[obterUsuario] usuario encontrado:', usuario);

    if (!usuario) {
      throw ErroApi.notFound('Usuário', 'USUARIO_NOT_FOUND');
    }

    return respostaSucesso(res, sanitizarUsuario(usuario));
  },
);

export const solicitarRecuperacaoSenha = asyncHandler(
  async (req: Request, res: Response) => {
    const parseResult = recuperarSenhaSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw ErroApi.badRequest('Dados inválidos', 'INVALID_RECUPERACAO_DATA');
    }
    const { email } = parseResult.data;
    const usuario = await usuariosServico.buscarPorEmail(email);
    if (!usuario) {
      throw ErroApi.notFound('Usuário não encontrado.');
    }
    const token = Math.random().toString(36).substring(2) + Date.now();

    const link = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/redefinir-senha?token=${token}`;
    await enviarEmail(
      usuario.email,
      'Recuperação de senha - Central de Anime',
      `
        <h2>Central de Anime</h2>
        <p>Olá, <b>${usuario.nome || 'usuário'}</b>!</p>
        <p>Recebemos uma solicitação para redefinir sua senha.</p>
        <p><a href="${link}">Clique aqui para redefinir sua senha</a></p>
        <p>Se não foi você, ignore este e-mail.</p>
        <hr>
        <small>Equipe Central de Anime</small>
      `,
    );
    return respostaSucesso(res, null, {
      mensagem:
        'E-mail de recuperação enviado. Verifique sua caixa de entrada.',
    });
  },
);

export const redefinirSenha = asyncHandler(
  async (req: Request, res: Response) => {
    const parseResult = redefinirSenhaSchema.safeParse(req.body);
    if (!parseResult.success) {
      throw ErroApi.badRequest('Dados inválidos', 'INVALID_REDEFINIR_DATA');
    }
    const { token, novaSenha } = parseResult.data;
    await usuariosServico.redefinirSenha(token, novaSenha);
    return respostaSucesso(res, null, {
      mensagem: 'Senha redefinida com sucesso.',
    });
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
