import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { prisma } from '../config/prisma';
import { sendPasswordResetEmail, sendPasswordResetConfirmationEmail } from './emailService';
import type {
    UsuarioModel,
    SessaoModel,
} from '../../generated/prisma/models';

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
    register(
        nome: string,
        email: string,
        senha: string
    ): Promise<SafeUsuario>;
    login(
        email: string,
        password: string,
        dispositivo?: string | null,
        ip?: string | null,
        userAgent?: string | null
    ): Promise<LoginResult>;
    refresh(refreshToken: string): Promise<RefreshResult>;
    requestPasswordReset(email: string): Promise<string | null>;
    resetPassword(token: string, newPassword: string): Promise<LoginResult>;
    revoke(refreshToken: string): Promise<void>;
    logout(refreshToken: string): Promise<void>;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
}

const ACCESS_TOKEN_EXPIRES =
    process.env.ACCESS_TOKEN_EXPIRES ?? '15m';

const REFRESH_TOKEN_EXPIRES_DAYS = Number(
    process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30
);

const BCRYPT_SALT_ROUNDS = Number(
    process.env.BCRYPT_SALT_ROUNDS ?? 10
);

const PASSWORD_RESET_EXPIRES_MINUTES = Number(
    process.env.PASSWORD_RESET_EXPIRES_MINUTES ?? 30
);

const hashPassword = async (
    password: string
): Promise<string> => {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

const generateAccessToken = (
    user: SafeUsuario
): string => {
    return jwt.sign(
        {
            sub: user.id,
            email: user.email,
            nome: user.nome,
        },
        JWT_SECRET,
        {
            expiresIn:
                ACCESS_TOKEN_EXPIRES as jwt.SignOptions['expiresIn'],
        }
    );
};

const generateRefreshTokenForUser = async (
    usuarioId: number,
    dispositivo?: string | null,
    ip?: string | null,
    userAgent?: string | null
): Promise<{
    token: string;
    sessao: SessaoModel;
}> => {
    const tokenPlain = crypto
        .randomBytes(64)
        .toString('hex');

    const refreshTokenHash = await bcrypt.hash(
        tokenPlain,
        BCRYPT_SALT_ROUNDS
    );

    const expiraEm = new Date(
        Date.now() +
            REFRESH_TOKEN_EXPIRES_DAYS *
                24 *
                60 *
                60 *
                1000
    );

    const sessao = await prisma.sessao.create({
        data: {
            refreshTokenHash,
            dispositivo: dispositivo ?? null,
            ip: ip ?? null,
            userAgent: userAgent ?? null,
            expiraEm,
            usuario: {
                connect: {
                    id: usuarioId,
                },
            },
        },
    });

    return {
        token: `${sessao.id}.${tokenPlain}`,
        sessao,
    };
};

const parseRefreshToken = (
    token: string
): {
    sessionId: number;
    tokenPlain: string;
} => {
    if (!token || typeof token !== 'string') {
        throw new Error('Refresh token inválido');
    }

    const separatorIndex = token.indexOf('.');

    if (separatorIndex <= 0) {
        throw new Error('Refresh token inválido');
    }

    const sessionId = Number(
        token.slice(0, separatorIndex)
    );

    const tokenPlain = token.slice(
        separatorIndex + 1
    );

    if (
        !Number.isSafeInteger(sessionId) ||
        sessionId <= 0 ||
        !tokenPlain
    ) {
        throw new Error('Refresh token inválido');
    }

    return {
        sessionId,
        tokenPlain,
    };
};

const parsePasswordResetToken = (
    token: string
): { usuarioId: number; tokenPlain: string } => {
    if (!token || typeof token !== 'string') {
        throw new Error('Token de recuperação inválido');
    }

    try {
        const payloadRaw = jwt.verify(token, JWT_SECRET) as unknown;

        if (typeof payloadRaw === 'string') {
            throw new Error('Token de recuperação inválido');
        }

        const payload = payloadRaw as { usuarioId?: number; sub?: number; id?: number };

        const usuarioId = Number(payload.usuarioId ?? payload.sub ?? payload.id);

        if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
            throw new Error('Token de recuperação inválido');
        }

        return { usuarioId, tokenPlain: token };
    } catch (err) {
        throw new Error('Token de recuperação inválido');
    }
};

export const authService: AuthService = {
    hashPassword,

    register: async (
        nome: string,
        email: string,
        senha: string
    ): Promise<SafeUsuario> => {
        const normalizedEmail =
            email.trim().toLowerCase();

        const existing =
            await prisma.usuario.findUnique({
                where: {
                    email: normalizedEmail,
                },
            });

        if (existing) {
            throw new Error('Email já cadastrado');
        }

        const senhaHash =
            await hashPassword(senha);

        const user =
            await prisma.usuario.create({
                data: {
                    nome: nome.trim(),
                    email: normalizedEmail,
                    senha: senhaHash,
                },
            });

        const {
            senha: _senha,
            ...safeUser
        } = user;

        return safeUser;
    },

    login: async (
        email: string,
        password: string,
        dispositivo,
        ip,
        userAgent
    ): Promise<LoginResult> => {
        const normalizedEmail =
            email.trim().toLowerCase();

        const user =
            await prisma.usuario.findUnique({
                where: {
                    email: normalizedEmail,
                },
            });

        if (!user) {
            throw new Error(
                'Email ou senha inválidos'
            );
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.senha
            );

        if (!passwordMatch) {
            throw new Error(
                'Email ou senha inválidos'
            );
        }

        const {
            senha: _senha,
            ...safeUser
        } = user;

        const accessToken =
            generateAccessToken(safeUser);

        const {
            token: refreshToken,
            sessao,
        } = await generateRefreshTokenForUser(
            user.id,
            dispositivo,
            ip,
            userAgent
        );

        return {
            user: safeUser,
            accessToken,
            refreshToken,
            refreshExpiraEm:
                sessao.expiraEm,
        };
    },

    refresh: async (
        refreshToken: string
    ): Promise<RefreshResult> => {
        const {
            sessionId,
            tokenPlain,
        } = parseRefreshToken(refreshToken);

        const sessao =
            await prisma.sessao.findUnique({
                where: {
                    id: sessionId,
                },
                include: {
                    usuario: true,
                },
            });

        if (!sessao) {
            throw new Error(
                'Sessão não encontrada'
            );
        }

        if (sessao.revogadoEm) {
            throw new Error(
                'Refresh token revogado'
            );
        }

        if (
            sessao.expiraEm.getTime() <=
            Date.now()
        ) {
            throw new Error(
                'Refresh token expirado'
            );
        }

        const tokenMatch =
            await bcrypt.compare(
                tokenPlain,
                sessao.refreshTokenHash
            );

        if (!tokenMatch) {
            throw new Error(
                'Refresh token inválido'
            );
        }

        const usuario = sessao.usuario;

        const {
            senha: _senha,
            ...safeUser
        } = usuario;

        const newRefreshSession =
            await prisma.$transaction(
                async (tx) => {
                    await tx.sessao.update({
                        where: {
                            id: sessionId,
                        },
                        data: {
                            revogadoEm:
                                new Date(),
                        },
                    });

                    const newTokenPlain =
                        crypto
                            .randomBytes(64)
                            .toString('hex');

                    const refreshTokenHash =
                        await bcrypt.hash(
                            newTokenPlain,
                            BCRYPT_SALT_ROUNDS
                        );

                    const expiraEm =
                        new Date(
                            Date.now() +
                                REFRESH_TOKEN_EXPIRES_DAYS *
                                    24 *
                                    60 *
                                    60 *
                                    1000
                        );

                    const newSession =
                        await tx.sessao.create({
                            data: {
                                refreshTokenHash,
                                dispositivo:
                                    sessao.dispositivo,
                                ip: sessao.ip,
                                userAgent:
                                    sessao.userAgent,
                                expiraEm,
                                usuario: {
                                    connect: {
                                        id: usuario.id,
                                    },
                                },
                            },
                        });

                    return {
                        token: `${newSession.id}.${newTokenPlain}`,
                        sessao: newSession,
                    };
                }
            );

        const accessToken =
            generateAccessToken(safeUser);

        return {
            accessToken,
            refreshToken:
                newRefreshSession.token,
            user: safeUser,
            refreshExpiraEm:
                newRefreshSession.sessao
                    .expiraEm,
        };
    },

    requestPasswordReset: async (
        email: string
    ): Promise<string | null> => {
        const normalizedEmail = email.trim().toLowerCase();
        const usuario = await prisma.usuario.findUnique({
            where: { email: normalizedEmail },
        });

        if (!usuario) {
            return null;
        }

        // Gerar token JWT com expiração curta
        const jwtToken = jwt.sign({ usuarioId: usuario.id }, JWT_SECRET, {
            expiresIn: `${PASSWORD_RESET_EXPIRES_MINUTES}m`,
        });

        const resetSenhaTokenHash = await bcrypt.hash(
            jwtToken,
            BCRYPT_SALT_ROUNDS
        );

        const resetSenhaExpiraEm = new Date(
            Date.now() + PASSWORD_RESET_EXPIRES_MINUTES * 60 * 1000
        );

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: { resetSenhaTokenHash, resetSenhaExpiraEm },
        });

        await sendPasswordResetEmail(normalizedEmail, jwtToken);

        return jwtToken;
    },

    resetPassword: async (
        token: string,
        newPassword: string
    ): Promise<LoginResult> => {
        const { usuarioId, tokenPlain } = parsePasswordResetToken(token);
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
        });

        if (
            !usuario?.resetSenhaTokenHash ||
            !usuario.resetSenhaExpiraEm ||
            usuario.resetSenhaExpiraEm.getTime() <= Date.now()
        ) {
            throw new Error('Token de recuperação expirado ou inválido');
        }

        // tokenPlain é o JWT completo; verificamos assinatura acima no parse
        const tokenMatch = await bcrypt.compare(tokenPlain, usuario.resetSenhaTokenHash);

        if (!tokenMatch) {
            throw new Error('Token de recuperação expirado ou inválido');
        }

        const senha = await hashPassword(newPassword);

        const updatedUser = await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                senha,
                resetSenhaTokenHash: null,
                resetSenhaExpiraEm: null,
            },
        });

        const { senha: _senha, ...safeUser } = updatedUser;

        const accessToken = generateAccessToken(safeUser as SafeUsuario);

        const { token: refreshToken, sessao } = await generateRefreshTokenForUser(updatedUser.id);

        // Envia email de confirmação de alteração de senha (não bloquear o fluxo em caso de falha)
        (async () => {
            try {
                await sendPasswordResetConfirmationEmail(updatedUser.email);
            } catch (err) {
                console.error('Falha ao enviar email de confirmação de senha:', err);
            }
        })();

        return {
            user: safeUser as SafeUsuario,
            accessToken,
            refreshToken,
            refreshExpiraEm: sessao.expiraEm,
        };
    },

    revoke: revokeRefreshToken,
    logout: revokeRefreshToken,
};

async function revokeRefreshToken(
    refreshToken: string
): Promise<void> {
    const { sessionId, tokenPlain } =
        parseRefreshToken(refreshToken);

    const sessao = await prisma.sessao.findUnique({
        where: { id: sessionId },
    });

    if (!sessao) {
        throw new Error('Sessão não encontrada');
    }

    if (sessao.revogadoEm) {
        return;
    }

    const tokenMatch = await bcrypt.compare(
        tokenPlain,
        sessao.refreshTokenHash
    );

    if (!tokenMatch) {
        throw new Error('Refresh token inválido');
    }

    await prisma.sessao.update({
        where: { id: sessionId },
        data: { revogadoEm: new Date() },
    });
}