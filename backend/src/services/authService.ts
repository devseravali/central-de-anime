import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

import { prisma } from '../config/prisma';
import {
    sendPasswordResetEmail,
    sendPasswordResetConfirmationEmail,
    sendRegisterConfirmationEmail,
} from './emailService';
import type {
    UsuarioModel,
    SessaoModel,
} from '../../generated/prisma/models';

type SafeUsuario = Pick<
    UsuarioModel,
    | 'id'
    | 'nome'
    | 'email'
    | 'avatar'
    | 'status'
    | 'criadoEm'
    | 'atualizadoEm'
>;

const safeUsuarioSelect = {
    id: true,
    nome: true,
    email: true,
    avatar: true,
    status: true,
    criadoEm: true,
    atualizadoEm: true,
} as const;

function toSafeUsuario(
    usuario: Pick<SafeUsuario, keyof SafeUsuario>
): SafeUsuario {
    return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        avatar: usuario.avatar,
        status: usuario.status,
        criadoEm: usuario.criadoEm,
        atualizadoEm: usuario.atualizadoEm,
    };
}

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
    verifyEmail(token: string): Promise<void>;
    resetPassword(token: string, newPassword: string): Promise<LoginResult>;
    revoke(refreshToken: string): Promise<void>;
    logout(refreshToken: string): Promise<void>;
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
}

const ACCESS_TOKEN_EXPIRES =
    process.env.ACCESS_TOKEN_EXPIRES ?? '12h';

const REFRESH_TOKEN_EXPIRES_DAYS = Number(
    process.env.REFRESH_TOKEN_EXPIRES_DAYS ?? 30
);

const BCRYPT_SALT_ROUNDS = Number(
    process.env.BCRYPT_SALT_ROUNDS ?? 10
);

const PASSWORD_RESET_EXPIRES_MINUTES = Number(
    process.env.PASSWORD_RESET_EXPIRES_MINUTES ?? 30
);

const EMAIL_VERIFICATION_EXPIRES_MINUTES = Number(
    process.env.EMAIL_VERIFICATION_EXPIRES_MINUTES ?? 1440
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
        throw new Error('Token de recuperação expirado ou inválido');
    }

    try {
        const payloadRaw = jwt.verify(token, JWT_SECRET) as unknown;

        if (typeof payloadRaw === 'string') {
            throw new Error('Token de recuperação expirado ou inválido');
        }

        const payload = payloadRaw as { usuarioId?: number; sub?: number; id?: number };

        const usuarioId = Number(payload.usuarioId ?? payload.sub ?? payload.id);

        if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
            throw new Error('Token de recuperação expirado ou inválido');
        }

        return { usuarioId, tokenPlain: token };
    } catch {
        throw new Error('Token de recuperação expirado ou inválido');
    }
};

const parseEmailVerificationToken = (
    token: string
): { usuarioId: number; tokenPlain: string } => {
    if (!token || typeof token !== 'string') {
        throw new Error('Token de confirmacao invalido');
    }

    try {
        const payloadRaw = jwt.verify(token, JWT_SECRET) as unknown;

        if (typeof payloadRaw === 'string') {
            throw new Error('Token de confirmacao invalido');
        }

        const payload = payloadRaw as { usuarioId?: number; sub?: number; id?: number };
        const usuarioId = Number(payload.usuarioId ?? payload.sub ?? payload.id);

        if (!Number.isSafeInteger(usuarioId) || usuarioId <= 0) {
            throw new Error('Token de confirmacao invalido');
        }

        return { usuarioId, tokenPlain: token };
    } catch (_err) {
        throw new Error('Token de confirmacao invalido');
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
                select: {
                    id: true,
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
                    status: 'pendente',
                },
                select: safeUsuarioSelect,
            });

        const verificationToken = jwt.sign(
            { usuarioId: user.id },
            JWT_SECRET,
            {
                expiresIn: `${EMAIL_VERIFICATION_EXPIRES_MINUTES}m`,
            }
        );

        const verificaEmailTokenHash = await bcrypt.hash(
            verificationToken,
            BCRYPT_SALT_ROUNDS
        );

        const verificaEmailExpiraEm = new Date(
            Date.now() + EMAIL_VERIFICATION_EXPIRES_MINUTES * 60 * 1000
        );

        await prisma.usuario.update({
            where: { id: user.id },
            data: {
                verificaEmailTokenHash,
                verificaEmailExpiraEm,
            },
        });

        try {
            await sendRegisterConfirmationEmail(
                normalizedEmail,
                user.nome,
                verificationToken
            );
        } catch {
            console.error('Falha ao enviar email de confirmação de cadastro');
        }

        return toSafeUsuario(user);
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
                select: {
                    ...safeUsuarioSelect,
                    senha: true,
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

        if (user.status !== 'ativo') {
            throw new Error('Email ou senha inválidos');
        }

        const safeUser = toSafeUsuario(user);

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
                select: {
                    id: true,
                    refreshTokenHash: true,
                    dispositivo: true,
                    ip: true,
                    userAgent: true,
                    expiraEm: true,
                    revogadoEm: true,
                    usuario: {
                        select: safeUsuarioSelect,
                    },
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

        if (!usuario || usuario.status !== 'ativo') {
            throw new Error('Refresh token inválido');
        }

        const safeUser = toSafeUsuario(usuario);

        const newRefreshSession =
            await prisma.$transaction(
                async (tx) => {
                    const consumedSession = await tx.sessao.updateMany({
                        where: {
                            id: sessionId,
                            refreshTokenHash: sessao.refreshTokenHash,
                            revogadoEm: null,
                            expiraEm: { gt: new Date() },
                        },
                        data: {
                            revogadoEm:
                                new Date(),
                        },
                    });

                    if (consumedSession.count !== 1) {
                        throw new Error('Refresh token inválido');
                    }

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

    verifyEmail: async (token: string): Promise<void> => {
        const { usuarioId, tokenPlain } = parseEmailVerificationToken(token);

        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                status: true,
                verificaEmailTokenHash: true,
                verificaEmailExpiraEm: true,
            },
        });

        if (!usuario) {
            throw new Error('Usuario nao encontrado');
        }

        if (usuario.status === 'ativo') {
            return;
        }

        if (
            !usuario.verificaEmailTokenHash ||
            !usuario.verificaEmailExpiraEm ||
            usuario.verificaEmailExpiraEm.getTime() <= Date.now()
        ) {
            throw new Error('Token de confirmacao expirado ou invalido');
        }

        const tokenMatch = await bcrypt.compare(
            tokenPlain,
            usuario.verificaEmailTokenHash
        );

        if (!tokenMatch) {
            throw new Error('Token de confirmacao expirado ou invalido');
        }

        await prisma.usuario.update({
            where: { id: usuario.id },
            data: {
                status: 'ativo',
                verificaEmailTokenHash: null,
                verificaEmailExpiraEm: null,
            },
        });
    },

    resetPassword: async (
        token: string,
        newPassword: string
    ): Promise<LoginResult> => {
        const { usuarioId, tokenPlain } = parsePasswordResetToken(token);
        const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            select: {
                id: true,
                email: true,
                resetSenhaTokenHash: true,
                resetSenhaExpiraEm: true,
            },
        });

        if (
            !usuario?.resetSenhaTokenHash ||
            !usuario.resetSenhaExpiraEm ||
            usuario.resetSenhaExpiraEm.getTime() <= Date.now()
        ) {
            throw new Error('Token de recuperação expirado ou inválido');
        }

        const tokenMatch = await bcrypt.compare(tokenPlain, usuario.resetSenhaTokenHash);

        if (!tokenMatch) {
            throw new Error('Token de recuperação expirado ou inválido');
        }

        const senha = await hashPassword(newPassword);
        const now = new Date();
        const resetResult = await prisma.$transaction(async (tx) => {
            const consumedToken = await tx.usuario.updateMany({
                where: {
                    id: usuario.id,
                    resetSenhaTokenHash: usuario.resetSenhaTokenHash,
                    resetSenhaExpiraEm: { gt: now },
                },
                data: {
                    senha,
                    resetSenhaTokenHash: null,
                    resetSenhaExpiraEm: null,
                },
            });

            if (consumedToken.count !== 1) {
                throw new Error('Token de recuperação expirado ou inválido');
            }

            await tx.sessao.updateMany({
                where: {
                    usuarioId: usuario.id,
                    revogadoEm: null,
                },
                data: { revogadoEm: now },
            });

            const updatedUser = await tx.usuario.findUnique({
                where: { id: usuario.id },
                select: safeUsuarioSelect,
            });

            if (!updatedUser) {
                throw new Error('Token de recuperação expirado ou inválido');
            }

            const newTokenPlain = crypto
                .randomBytes(64)
                .toString('hex');
            const refreshTokenHash = await bcrypt.hash(
                newTokenPlain,
                BCRYPT_SALT_ROUNDS
            );
            const expiraEm = new Date(
                Date.now() +
                    REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
            );
            const sessao = await tx.sessao.create({
                data: {
                    refreshTokenHash,
                    expiraEm,
                    usuario: { connect: { id: usuario.id } },
                },
                select: {
                    id: true,
                    expiraEm: true,
                },
            });

            return {
                user: toSafeUsuario(updatedUser),
                refreshToken: `${sessao.id}.${newTokenPlain}`,
                refreshExpiraEm: sessao.expiraEm,
            };
        });

        const accessToken = generateAccessToken(resetResult.user);

        void sendPasswordResetConfirmationEmail(usuario.email).catch(() => {
            console.error('Falha ao enviar email de confirmação de senha');
        });

        return {
            user: resetResult.user,
            accessToken,
            refreshToken: resetResult.refreshToken,
            refreshExpiraEm: resetResult.refreshExpiraEm,
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

    await prisma.sessao.updateMany({
        where: {
            id: sessionId,
            refreshTokenHash: sessao.refreshTokenHash,
            revogadoEm: null,
        },
        data: { revogadoEm: new Date() },
    });
}