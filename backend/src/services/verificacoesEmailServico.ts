import { randomBytes } from 'crypto';
import { verificacoesEmailRepositorio } from '../repositories/verificacoesEmailRepositorio';
import { usuariosRepositorio } from '../repositories/usuariosRepositorio';
import { ErroApi } from '../errors/ErroApi';

import type { VerificacaoEmailResultado } from '../types/verificacaoEmail';

const TOKEN_BYTES = 32;
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function gerarToken(): string {
  return randomBytes(TOKEN_BYTES).toString('hex');
}

function calcularExpiracao(): Date {
  return new Date(Date.now() + TOKEN_TTL_MS);
}

async function validarUsuario(usuarioId: number) {
  const usuario = await usuariosRepositorio.buscarPorId(usuarioId);

  if (!usuario) {
    throw ErroApi.notFound('Usuário não encontrado.');
  }

  if (usuario.emailVerificado) {
    throw ErroApi.badRequest('E-mail já verificado.');
  }

  return usuario;
}

export const verificacoesEmailServico = {
  async criarVerificacaoEmail(usuarioId: number) {
    await validarUsuario(usuarioId);

    return verificacoesEmailRepositorio.criar({
      usuarioId,
      token: gerarToken(),
      expiraEm: calcularExpiracao(),
    });
  },

  async verificarToken(token: string): Promise<VerificacaoEmailResultado> {
    const tokenNormalizado = token?.trim();

    if (!tokenNormalizado) {
      throw ErroApi.badRequest('Token inválido ou expirado.');
    }

    const verificacao =
      await verificacoesEmailRepositorio.buscarAtivoPorToken(tokenNormalizado);

    if (!verificacao) {
      throw ErroApi.badRequest('Token inválido ou expirado.');
    }

    await verificacoesEmailRepositorio.marcarComoUsado(verificacao.id);

    return { usuarioId: verificacao.usuarioId };
  },
};
