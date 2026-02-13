import bcrypt from 'bcrypt';
import { ErroApi } from '../errors/ErroApi';

import { usuariosRepositorio } from '../repositories/usuariosRepositorio';
import { verificacoesEmailServico } from '../services/verificacoesEmailServico';
import { gerarToken } from '../helpers/tokenHelper';

import type {
  AtualizarUsuarioDTO,
  CriarUsuarioDTO,
  LoginDTO,
  TokenResponse,
  UsuarioPublico,
} from '../types/usuario';

export const usuariosServico = {
  listar({ pagina = 1, limite = 20 } = {}): Promise<UsuarioPublico[]> {
    return usuariosRepositorio.listarTodos({ pagina, limite });
  },

  async buscarPorId(id: number): Promise<UsuarioPublico | null> {
    return usuariosRepositorio.buscarPorId(id);
  },

  async registrar(dados: CriarUsuarioDTO): Promise<UsuarioPublico> {
    const existente = await usuariosRepositorio.buscarPorEmail(dados.email);
    if (existente) {
      throw ErroApi.conflict('E-mail já cadastrado.');
    }
    return usuariosRepositorio.criar(dados);
  },

  async loginLocal(dados: LoginDTO): Promise<TokenResponse> {
    const usuario = await usuariosRepositorio.buscarPorEmail(dados.email);
    // LOG: Usuário encontrado no banco
    // eslint-disable-next-line no-console
    console.log('[LOGIN] Usuário encontrado:', usuario ? usuario.email : null);
    if (usuario) {
      // eslint-disable-next-line no-console
      console.log('[LOGIN] Hash no banco:', usuario.senhaHash);
    }
    if (!usuario) {
      // eslint-disable-next-line no-console
      console.log('[LOGIN] Usuário não encontrado para o email informado.');
      throw ErroApi.unauthorized('Credenciais inválidas.');
    }

    const ok = await bcrypt.compare(dados.senha, usuario.senhaHash);
    // LOG: Resultado do bcrypt.compare
    // eslint-disable-next-line no-console
    console.log('[LOGIN] bcrypt.compare:', ok);
    if (!ok) {
      // eslint-disable-next-line no-console
      console.log('[LOGIN] Senha inválida para o email informado.');
      throw ErroApi.unauthorized('Credenciais inválidas.');
    }

    return { token: gerarToken(usuario.id) };
  },

  async loginGoogle(email: string): Promise<UsuarioPublico> {
    const usuario = await usuariosRepositorio.buscarPorEmail(email);
    if (!usuario) {
      throw ErroApi.notFound('Usuário', 'USUARIO_NOT_FOUND');
    }
    // retorna público (sem hash)
    const publico = await usuariosRepositorio.buscarPorId(usuario.id);
    if (!publico) {
      throw ErroApi.notFound('Usuário', 'USUARIO_NOT_FOUND');
    }
    return publico;
  },

  atualizar(id: number, dados: AtualizarUsuarioDTO): Promise<UsuarioPublico> {
    return usuariosRepositorio.atualizar(id, dados);
  },

  async remover(id: number): Promise<void> {
    await usuariosRepositorio.remover(id);
  },

  async criarTokenVerificacaoEmail(
    usuarioId: number,
  ): Promise<{ token: string }> {
    const usuario = await usuariosRepositorio.buscarPorId(usuarioId);
    if (!usuario) {
      throw ErroApi.notFound('Usuário', 'USUARIO_NOT_FOUND');
    }
    const verificacao =
      await verificacoesEmailServico.criarVerificacaoEmail(usuarioId);
    return { token: verificacao.token };
  },

  async verificarEmail(token: string): Promise<void> {
    const { usuarioId } = await verificacoesEmailServico.verificarToken(token);
    await usuariosRepositorio.marcarEmailVerificado(usuarioId);
  },
};
