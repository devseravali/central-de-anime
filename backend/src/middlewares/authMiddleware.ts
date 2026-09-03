import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { authService } from '../services/authService';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
}

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
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        const userId = decoded.sub ? Number(decoded.sub) : NaN;

        if (Number.isNaN(userId)) {
            res.status(401).json({ message: 'Token inválido: sub inválido' });
            return;
        }

        const usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            include: { admin: true },
        });

        if (!usuario) {
            res.status(401).json({ message: 'Usuário não encontrado' });
            return;
        }

        req.user = {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            role: usuario.admin ? 'ADMIN' : 'USER',
        };


        next();
    } catch (error) {
        console.error('Erro ao validar JWT:', error instanceof Error ? error.message : String(error));

        if (error && typeof error === 'object' && (error as any).name === 'TokenExpiredError') {
            const headerRefresh = req.headers['x-refresh-token'] as string | undefined;
            const cookieRefresh = (req as any).cookies && (req as any).cookies.refreshToken;
            const refreshToken = headerRefresh ?? cookieRefresh;

            if (refreshToken && typeof refreshToken === 'string') {
                try {
                    const result = await authService.refresh(refreshToken);

                    res.setHeader('x-access-token', result.accessToken);
                    res.setHeader('x-refresh-token', result.refreshToken);

                    const usuario = await prisma.usuario.findUnique({ where: { id: result.user.id }, include: { admin: true } });

                    if (!usuario) {
                        res.status(401).json({ message: 'Usuário não encontrado após refresh' });
                        return;
                    }

                    req.user = {
                        id: usuario.id,
                        email: usuario.email,
                        nome: usuario.nome,
                        role: usuario.admin ? 'ADMIN' : 'USER',
                    };

                    next();
                    return;
                    } catch (refreshErr) {
                    console.error('Falha ao renovar token via refresh:', refreshErr instanceof Error ? refreshErr.message : String(refreshErr));
                    res.status(401).json({ message: 'Token expirado e refresh falhou' });
                    return;
                }
            }

            res.status(401).json({ message: 'Token expirado' });
            return;
        }

        res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};