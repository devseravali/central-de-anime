import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMocks = vi.hoisted(() => ({
  usuarioFindUnique: vi.fn(),
  usuarioCreate: vi.fn(),
  usuarioUpdate: vi.fn(),
  sessaoCreate: vi.fn(),
  sessaoFindUnique: vi.fn(),
  sessaoUpdate: vi.fn(),
  transaction: vi.fn(),
}));

const bcryptMocks = vi.hoisted(() => ({
  hash: vi.fn(),
  compare: vi.fn(),
}));

const jwtMocks = vi.hoisted(() => ({
  sign: vi.fn(),
  verify: vi.fn(),
}));

const cryptoMocks = vi.hoisted(() => ({
  randomBytes: vi.fn(),
}));

const emailMocks = vi.hoisted(() => ({
  sendPasswordResetEmail: vi.fn(),
  sendPasswordResetConfirmationEmail: vi.fn(),
}));

vi.mock('../../config/prisma', () => ({
  prisma: {
    usuario: {
      findUnique: prismaMocks.usuarioFindUnique,
      create: prismaMocks.usuarioCreate,
      update: prismaMocks.usuarioUpdate,
    },
    sessao: {
      create: prismaMocks.sessaoCreate,
      findUnique: prismaMocks.sessaoFindUnique,
      update: prismaMocks.sessaoUpdate,
    },
    $transaction: prismaMocks.transaction,
  },
}));

vi.mock('bcrypt', () => ({
  default: { hash: bcryptMocks.hash, compare: bcryptMocks.compare },
  hash: bcryptMocks.hash,
  compare: bcryptMocks.compare,
}));

vi.mock('jsonwebtoken', () => ({
  default: { sign: jwtMocks.sign, verify: jwtMocks.verify },
  sign: jwtMocks.sign,
  verify: jwtMocks.verify,
}));

vi.mock('crypto', () => ({
  default: { randomBytes: cryptoMocks.randomBytes },
}));

vi.mock('../../services/emailService', () => emailMocks);

import { authService } from '../../services/authService';

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cryptoMocks.randomBytes.mockReturnValue({ toString: () => 'token-aleatorio' });
  });

  it('deve impedir registro com email duplicado', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({ id: 1 });

    await expect(authService.register('Luffy', 'luffy@teste.com', '123456')).rejects.toThrow('Email já cadastrado');
  });

  it('deve normalizar dados e remover senha do retorno no registro', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce(null);
    bcryptMocks.hash.mockResolvedValueOnce('hash');
    prismaMocks.usuarioCreate.mockResolvedValueOnce({
      id: 1,
      nome: 'Luffy',
      email: 'luffy@teste.com',
      senha: 'hash',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });

    const resultado = await authService.register('  Luffy ', ' LUFFY@teste.com ', '123456');

    expect(prismaMocks.usuarioCreate).toHaveBeenCalledWith({
      data: {
        nome: 'Luffy',
        email: 'luffy@teste.com',
        senha: 'hash',
      },
    });
    expect((resultado as Record<string, unknown>).senha).toBeUndefined();
  });

  it('deve rejeitar login quando a senha não confere', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({ id: 1, email: 'a@teste.com', senha: 'hash' });
    bcryptMocks.compare.mockResolvedValueOnce(false);

    await expect(authService.login('a@teste.com', '123456')).rejects.toThrow('Email ou senha inválidos');
  });

  it('deve criar access token e refresh token no login', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 1,
      nome: 'Luffy',
      email: 'luffy@teste.com',
      senha: 'hash',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });
    bcryptMocks.compare.mockResolvedValueOnce(true);
    jwtMocks.sign.mockReturnValueOnce('access-token');
    bcryptMocks.hash.mockResolvedValueOnce('refresh-hash');
    prismaMocks.sessaoCreate.mockResolvedValueOnce({ id: 5, expiraEm: new Date('2026-10-03T00:00:00.000Z') });

    const resultado = await authService.login('LUFFY@teste.com', '123456', 'Chrome', '127.0.0.1', 'Vitest');

    expect(jwtMocks.sign).toHaveBeenCalled();
    expect(prismaMocks.sessaoCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        refreshTokenHash: 'refresh-hash',
        dispositivo: 'Chrome',
        ip: '127.0.0.1',
        userAgent: 'Vitest',
      }),
    });
    expect(resultado.accessToken).toBe('access-token');
    expect(resultado.refreshToken).toBe('5.token-aleatorio');
  });

  it('deve rejeitar refresh token revogado', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce({ revogadoEm: new Date(), expiraEm: new Date(Date.now() + 1000), refreshTokenHash: 'hash', usuario: { id: 1 } });

    await expect(authService.refresh('5.token-aleatorio')).rejects.toThrow('Refresh token revogado');
  });

  it('deve rotacionar sessão no refresh válido', async () => {
    const sessaoAtual = {
      id: 5,
      revogadoEm: null,
      expiraEm: new Date(Date.now() + 60_000),
      refreshTokenHash: 'hash-antigo',
      dispositivo: 'Chrome',
      ip: '127.0.0.1',
      userAgent: 'Vitest',
      usuario: {
        id: 1,
        nome: 'Luffy',
        email: 'luffy@teste.com',
        senha: 'hash',
        avatar: null,
        status: 'ACTIVE',
        criadoEm: new Date('2026-09-03T00:00:00.000Z'),
      },
    };
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce(sessaoAtual);
    bcryptMocks.compare.mockResolvedValueOnce(true);
    jwtMocks.sign.mockReturnValueOnce('novo-access-token');
    bcryptMocks.hash.mockResolvedValueOnce('novo-hash-refresh');
    prismaMocks.transaction.mockImplementationOnce(async (callback: (tx: { sessao: { update: typeof prismaMocks.sessaoUpdate; create: typeof prismaMocks.sessaoCreate } }) => Promise<{ token: string; sessao: { expiraEm: Date } }>) => {
      return callback({
        sessao: {
          update: prismaMocks.sessaoUpdate,
          create: prismaMocks.sessaoCreate,
        },
      });
    });
    prismaMocks.sessaoCreate.mockResolvedValueOnce({ id: 6, expiraEm: new Date('2026-10-03T00:00:00.000Z') });

    const resultado = await authService.refresh('5.token-aleatorio');

    expect(prismaMocks.sessaoUpdate).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { revogadoEm: expect.any(Date) },
    });
    expect(resultado.refreshToken).toBe('6.token-aleatorio');
    expect(resultado.accessToken).toBe('novo-access-token');
  });

  it('deve retornar null ao pedir reset para usuário inexistente', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce(null);

    const resultado = await authService.requestPasswordReset('naoexiste@teste.com');

    expect(resultado).toBeNull();
    expect(emailMocks.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('deve gerar token e enviar email no pedido de reset', async () => {
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({ id: 1, email: 'a@teste.com' });
    jwtMocks.sign.mockReturnValueOnce('jwt-reset');
    bcryptMocks.hash.mockResolvedValueOnce('hash-reset');
    prismaMocks.usuarioUpdate.mockResolvedValueOnce({ id: 1 });
    emailMocks.sendPasswordResetEmail.mockResolvedValueOnce(undefined);

    const resultado = await authService.requestPasswordReset(' A@teste.com ');

    expect(prismaMocks.usuarioUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: expect.objectContaining({ resetSenhaTokenHash: 'hash-reset' }),
    });
    expect(emailMocks.sendPasswordResetEmail).toHaveBeenCalledWith('a@teste.com', 'jwt-reset');
    expect(resultado).toBe('jwt-reset');
  });

  it('deve revogar refresh token válido no logout', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce({ id: 5, revogadoEm: null, refreshTokenHash: 'hash' });
    bcryptMocks.compare.mockResolvedValueOnce(true);
    prismaMocks.sessaoUpdate.mockResolvedValueOnce({ id: 5 });

    await authService.logout('5.token-aleatorio');

    expect(prismaMocks.sessaoUpdate).toHaveBeenCalledWith({
      where: { id: 5 },
      data: { revogadoEm: expect.any(Date) },
    });
  });

  it('deve gerar hash de senha usando bcrypt', async () => {
    bcryptMocks.hash.mockResolvedValueOnce('hash-senha-teste');

    const resultado = await authService.hashPassword('senha123');

    expect(bcryptMocks.hash).toHaveBeenCalledWith('senha123', expect.any(Number));
    expect(resultado).toBe('hash-senha-teste');
  });

  it('deve rejeitar refresh token em formato inválido', async () => {
    await expect(authService.refresh('')).rejects.toThrow('Refresh token inválido');
    await expect(authService.refresh('tokenSemPonto')).rejects.toThrow('Refresh token inválido');
    await expect(authService.refresh('abc.token')).rejects.toThrow('Refresh token inválido');
    await expect(authService.refresh('-1.token')).rejects.toThrow('Refresh token inválido');
    await expect(authService.refresh('1.')).rejects.toThrow('Refresh token inválido');
  });

  it('deve rejeitar refresh quando sessão não existe no banco', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce(null);

    await expect(authService.refresh('10.token-aleatorio')).rejects.toThrow('Sessão não encontrada');
  });

  it('deve rejeitar refresh quando a sessão está expirada', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce({
      id: 10,
      revogadoEm: null,
      expiraEm: new Date(Date.now() - 10_000),
      refreshTokenHash: 'hash',
      usuario: { id: 1 },
    });

    await expect(authService.refresh('10.token-aleatorio')).rejects.toThrow('Refresh token expirado');
  });

  it('deve rejeitar refresh quando o hash do token não confere', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce({
      id: 10,
      revogadoEm: null,
      expiraEm: new Date(Date.now() + 60_000),
      refreshTokenHash: 'hash-esperado',
      usuario: { id: 1 },
    });
    bcryptMocks.compare.mockResolvedValueOnce(false);

    await expect(authService.refresh('10.token-errado')).rejects.toThrow('Refresh token inválido');
  });

  it('deve ignorar revogação de sessão que já está revogada', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce({
      id: 8,
      revogadoEm: new Date(),
      refreshTokenHash: 'hash',
    });

    await authService.revoke('8.token-aleatorio');

    expect(bcryptMocks.compare).not.toHaveBeenCalled();
    expect(prismaMocks.sessaoUpdate).not.toHaveBeenCalled();
  });

  it('deve lançar erro ao revogar sessão inexistente', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce(null);

    await expect(authService.revoke('99.token-aleatorio')).rejects.toThrow('Sessão não encontrada');
  });

  it('deve lançar erro ao revogar quando hash do token não confere', async () => {
    prismaMocks.sessaoFindUnique.mockResolvedValueOnce({
      id: 9,
      revogadoEm: null,
      refreshTokenHash: 'hash',
    });
    bcryptMocks.compare.mockResolvedValueOnce(false);

    await expect(authService.revoke('9.token-incorreto')).rejects.toThrow('Refresh token inválido');
  });

  it('deve rejeitar redefinição de senha com token JWT inválido ou corrompido', async () => {
    jwtMocks.verify.mockImplementationOnce(() => {
      throw new Error('jwt malformed');
    });

    await expect(authService.resetPassword('token-invalido', 'novaSenha123')).rejects.toThrow('Token de recuperação inválido');
  });

  it('deve rejeitar redefinição de senha com token vazio', async () => {
    await expect(authService.resetPassword('', 'novaSenha123')).rejects.toThrow('Token de recuperação inválido');
  });

  it('deve rejeitar redefinição de senha quando usuário não tem token salvo ou já expirou', async () => {
    jwtMocks.verify.mockReturnValueOnce({ usuarioId: 1 });
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 1,
      resetSenhaTokenHash: null,
      resetSenhaExpiraEm: null,
    });

    await expect(authService.resetPassword('jwt-valido', 'novaSenha123')).rejects.toThrow('Token de recuperação expirado ou inválido');
  });

  it('deve rejeitar redefinição de senha quando prazo de expiração já passou', async () => {
    jwtMocks.verify.mockReturnValueOnce({ usuarioId: 1 });
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 1,
      resetSenhaTokenHash: 'hash-token',
      resetSenhaExpiraEm: new Date(Date.now() - 5000),
    });

    await expect(authService.resetPassword('jwt-valido', 'novaSenha123')).rejects.toThrow('Token de recuperação expirado ou inválido');
  });

  it('deve rejeitar redefinição de senha quando hash do token não confere', async () => {
    jwtMocks.verify.mockReturnValueOnce({ usuarioId: 1 });
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 1,
      resetSenhaTokenHash: 'hash-token',
      resetSenhaExpiraEm: new Date(Date.now() + 60_000),
    });
    bcryptMocks.compare.mockResolvedValueOnce(false);

    await expect(authService.resetPassword('jwt-valido', 'novaSenha123')).rejects.toThrow('Token de recuperação expirado ou inválido');
  });

  it('deve redefinir senha com sucesso, atualizar banco e enviar email de confirmação', async () => {
    jwtMocks.verify.mockReturnValueOnce({ usuarioId: 1 });
    prismaMocks.usuarioFindUnique.mockResolvedValueOnce({
      id: 1,
      email: 'usuario@teste.com',
      resetSenhaTokenHash: 'hash-token',
      resetSenhaExpiraEm: new Date(Date.now() + 60_000),
    });
    bcryptMocks.compare.mockResolvedValueOnce(true);
    bcryptMocks.hash
      .mockResolvedValueOnce('nova-senha-hash')
      .mockResolvedValueOnce('novo-refresh-hash');
    prismaMocks.usuarioUpdate.mockResolvedValueOnce({
      id: 1,
      nome: 'Usuario Teste',
      email: 'usuario@teste.com',
      senha: 'nova-senha-hash',
      avatar: null,
      status: 'ACTIVE',
      criadoEm: new Date('2026-09-03T00:00:00.000Z'),
    });
    jwtMocks.sign.mockReturnValueOnce('novo-access-token');
    prismaMocks.sessaoCreate.mockResolvedValueOnce({
      id: 20,
      expiraEm: new Date('2026-10-03T00:00:00.000Z'),
    });
    emailMocks.sendPasswordResetConfirmationEmail.mockResolvedValueOnce(undefined);

    const resultado = await authService.resetPassword('jwt-valido', 'novaSenha123');

    expect(prismaMocks.usuarioUpdate).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        senha: 'nova-senha-hash',
        resetSenhaTokenHash: null,
        resetSenhaExpiraEm: null,
      },
    });
    expect(resultado.accessToken).toBe('novo-access-token');
    expect(resultado.refreshToken).toBe('20.token-aleatorio');
    expect(resultado.user.email).toBe('usuario@teste.com');
  });
});