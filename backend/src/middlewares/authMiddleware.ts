import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
}

class AccessAuthenticationError extends Error {}

const verifyAccessToken = (token: string) => {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded === 'string') {
        throw new AccessAuthenticationError();
    }

    const userId =
        typeof decoded.sub === 'string' || typeof decoded.sub === 'number'
            ? Number(decoded.sub)
            : NaN;
    const sessionId = decoded.sid;

    if (
        !Number.isSafeInteger(userId) ||
        userId <= 0 ||
        typeof sessionId !== 'number' ||
        !Number.isSafeInteger(sessionId) ||
        sessionId <= 0 ||
        typeof decoded.exp !== 'number' ||
        !Number.isFinite(decoded.exp)
    ) {
        throw new AccessAuthenticationError();
    }

    return { userId, sessionId };
};

const authenticateSession = async (
    identity: ReturnType<typeof verifyAccessToken>
) => {
    const sessao = await prisma.sessao.findUnique({
        where: { id: identity.sessionId },
        select: {
            usuarioId: true,
            expiraEm: true,
            revogadoEm: true,
            usuario: {
                select: {
                    id: true,
                    email: true,
                    nome: true,
                    status: true,
                    admin: { select: { id: true } },
                },
            },
        },
    });

    if (
        !sessao ||
        sessao.usuarioId !== identity.userId ||
        sessao.revogadoEm !== null ||
        sessao.expiraEm.getTime() <= Date.now() ||
        !sessao.usuario ||
        sessao.usuario.id !== identity.userId ||
        sessao.usuario.status !== 'ativo'
    ) {
        throw new AccessAuthenticationError();
    }

    const usuario = sessao.usuario;
    return {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        role: usuario.admin ? 'ADMIN' : 'USER',
    };
};

const isAuthenticationError = (error: unknown): boolean =>
    error instanceof AccessAuthenticationError ||
    error instanceof jwt.JsonWebTokenError;

export const authMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authorization = req.headers.authorization;

    if (!authorization) {
        res.status(401).json({
            message: 'Token de autenticação não fornecido',
        });
        return;
    }

    if (!authorization.startsWith('Bearer ')) {
        res.status(401).json({
            message: 'Formato do token inválido',
        });
        return;
    }

    const token = authorization.split(' ')[1];

    if (!token) {
        res.status(401).json({
            message: 'Token de autenticação não fornecido',
        });
        return;
    }

    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        console.error('Token com formato inválido (não parece um JWT)');

        res.status(401).json({
            message: 'Formato do token inválido: espere um access token JWT (não use o refreshToken)',
        });
        return;
    }

    try {
        const identity = verifyAccessToken(token);
        req.user = await authenticateSession(identity);
    } catch (error) {
        if (isAuthenticationError(error)) {
            res.status(401).json({ message: 'Token inválido ou expirado' });
            return;
        }

        console.error('Falha de infraestrutura ao autenticar sessão');
        res.status(500).json({ message: 'Erro interno do servidor' });
        return;
    }

    next();
};