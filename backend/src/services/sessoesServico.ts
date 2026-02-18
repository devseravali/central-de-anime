import { sessoesRepositorio } from '../repositories/sessoesRepositorio';
import { ErroApi } from '../errors/ErroApi';
import type { CriarSessaoInput, Sessao } from '../types/sessoes';

function assertPositiveInt(value: number, field: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw ErroApi.badRequest(
      `${field} inválido.`,
      `INVALID_${field.toUpperCase()}`,
    );
  }
}

function assertNonEmptyString(value: string, field: string) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw ErroApi.badRequest(
      `${field} inválido.`,
      `INVALID_${field.toUpperCase()}`,
    );
  }
}

function assertValidDate(value: Date, field: string) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw ErroApi.badRequest(
      `${field} inválido.`,
      `INVALID_${field.toUpperCase()}`,
    );
  }
}

export const sessoesServico = {
  async criarSessao(input: CriarSessaoInput): Promise<Sessao> {
    assertPositiveInt(input.usuarioId, 'usuarioId');
    assertNonEmptyString(input.token, 'token');
    assertValidDate(input.expiraEm, 'expiraEm');

    const agora = new Date();
    if (input.expiraEm.getTime() <= agora.getTime()) {
      throw ErroApi.badRequest(
        'expiraEm deve ser uma data futura.',
        'INVALID_EXPIRAEM',
      );
    }

    return sessoesRepositorio.criarSessao(input);
  },

  async validarSessao(token: string): Promise<Sessao> {
    assertNonEmptyString(token, 'token');

    const sessao = await sessoesRepositorio.obterSessao(token);
    if (!sessao) {
      throw ErroApi.unauthorized('Sessão inválida ou expirada.');
    }

    if (Date.now() > sessao.expiraEm.getTime()) {
      await sessoesRepositorio.deletarSessao(sessao.id);
      throw ErroApi.unauthorized('Sessão expirada.');
    }

    return sessao;
  },

  async encerrarSessao(sessaoId: number): Promise<void> {
    assertPositiveInt(sessaoId, 'sessaoId');
    await sessoesRepositorio.deletarSessao(sessaoId);
  },

  async encerrarTodasSessoes(usuarioId: number): Promise<void> {
    assertPositiveInt(usuarioId, 'usuarioId');
    await sessoesRepositorio.deletarSessoesPorUsuario(usuarioId);
  },
};
