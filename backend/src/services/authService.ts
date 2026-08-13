import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import type { UsuarioModel, SessaoModel } from '../../generated/prisma/models';

type SafeUsuario = Omit<UsuarioModel, 'senha'>;

export type LoginResult = {
  user: SafeUsuario;
  accessToken: string;
  refreshToken: string;
  refreshExpiraEm: Date;
};

export type RefreshResult = {
  accessToken: string;
  refreshToken: string;
  user: SafeUsuario;
  refreshExpiraEm: Date;
};

export interface AuthService {
  hashPassword(password: string): Promise<string>;
  register(nome: string, email: string, senha: string): Promise<SafeUsuario>;
  login(
    email: string,
    password: string,
    dispositivo?: string | null,
    ip?: string | null,
    userAgent?: string | null,
  ): Promise<LoginResult>;
  refresh(refreshToken: string): Promise<RefreshResult>;
  revoke(refreshToken: string): Promise<void>;
}

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET ?? 'dev-secret';
const ACCESS_TOKEN_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES ?? '15m';
const REFRESH_TOKEN_EXPIRES_DAYS = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30);
const BCRYPT_SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS ?? 10);

const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

const generateAccessToken = (user: SafeUsuario) => {
  const options: jwt.SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES as unknown as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ sub: user.id, email: user.email, nome: user.nome }, JWT_SECRET, options);
};

const generateRefreshTokenForUser = async (
  usuarioId: number,
  dispositivo?: string | null,
  ip?: string | null,
  userAgent?: string | null,
): Promise<{ token: string; sessao: SessaoModel }> => {
  const random = crypto.randomBytes(64).toString('hex');
  const refreshHash = await bcrypt.hash(random, BCRYPT_SALT_ROUNDS);
  const expiraEm = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  const sessao = await prisma.sessao.create({
    data: {
      refreshTokenHash: refreshHash,
      dispositivo: dispositivo ?? null,
      ip: ip ?? null,
      userAgent: userAgent ?? null,
      expiraEm,
      usuario: { connect: { id: usuarioId } },
    },
  });

  const token = `${sessao.id}.${random}`;

  return { token, sessao } as { token: string; sessao: SessaoModel };
};

const parseRefreshToken = (token: string): { sessionId: number; tokenPlain: string } => {
  const parts = token.split('.');
  if (parts.length !== 2) throw new Error('Refresh token inválido');
  const sessionId = Number(parts[0]);
  if (!Number.isFinite(sessionId)) throw new Error('Refresh token inválido');
  return { sessionId, tokenPlain: parts[1] } as { sessionId: number; tokenPlain: string };
};

export const authService: AuthService = {
  hashPassword,

  register: async (nome: string, email: string, senha: string): Promise<SafeUsuario> => {
    const existing = await prisma.usuario.findUnique({ where: { email } });
    if (existing) throw new Error('Email já cadastrado');

    const senhaHash = await hashPassword(senha);

    const user = await prisma.usuario.create({
      data: { nome, email, senha: senhaHash },
    });

    const { senha: _, ...safeUser } = user;
    return safeUser;
  },

  login: async (
    email: string,
    password: string,
    dispositivo?: string | null,
    ip?: string | null,
    userAgent?: string | null,
  ): Promise<LoginResult> => {
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) throw new Error('Email ou senha inválidos');

    const passwordMatch = await bcrypt.compare(password, user.senha);
    if (!passwordMatch) throw new Error('Email ou senha inválidos');

    const { senha: _, ...safeUser } = user;

    const accessToken = generateAccessToken(safeUser);
    const { token: refreshToken, sessao } = await generateRefreshTokenForUser(user.id, dispositivo, ip, userAgent);

    return { user: safeUser, accessToken, refreshToken, refreshExpiraEm: sessao.expiraEm };
  },

  refresh: async (
    refreshToken: string,
  ): Promise<RefreshResult> => {
    const { sessionId, tokenPlain } = parseRefreshToken(refreshToken);

    const sessao = await prisma.sessao.findUnique({ where: { id: sessionId }, include: { usuario: true } });
    if (!sessao) throw new Error('Sessão não encontrada');
    if (sessao.revogadoEm) throw new Error('Refresh token revogado');
    if (sessao.expiraEm.getTime() < Date.now()) throw new Error('Refresh token expirado');

    const match = await bcrypt.compare(tokenPlain, sessao.refreshTokenHash);
    if (!match) throw new Error('Refresh token inválido');

    await prisma.sessao.update({ where: { id: sessionId }, data: { revogadoEm: new Date() } });

    const usuario = sessao.usuario as UsuarioModel;
    const { senha: _, ...safeUser } = usuario;

    const { token: newRefreshToken, sessao: newSessao } = await generateRefreshTokenForUser(usuario.id, sessao.dispositivo ?? null, sessao.ip ?? null, sessao.userAgent ?? null);

    const accessToken = generateAccessToken(safeUser);

    return { accessToken, refreshToken: newRefreshToken, user: safeUser, refreshExpiraEm: newSessao.expiraEm };
  },

  revoke: async (refreshToken: string): Promise<void> => {
    const { sessionId } = parseRefreshToken(refreshToken);
    await prisma.sessao.update({ where: { id: sessionId }, data: { revogadoEm: new Date() } });
  },
};