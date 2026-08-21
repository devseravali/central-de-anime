import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

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

    // validação rápida do formato: access tokens JWT têm 3 partes separadas por '.'
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        console.error('Token com formato inválido (não parece um JWT):', token);

        res.status(401).json({
            message: 'Formato do token inválido: espere um access token JWT (não use o refreshToken)',
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        console.log('AUTH DECODED:', decoded);

        const userId = decoded.sub ? Number(decoded.sub) : NaN;

        if (Number.isNaN(userId)) {
            res.status(401).json({ message: 'Token inválido: sub inválido' });
            return;
        }

        // buscar usuário no banco para anexar dados atuais (incluindo admin)
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

        console.log('AUTH USER:', req.user);

        next();
    } catch (error) {
        console.error('Erro ao validar JWT:', error);

        res.status(401).json({
            message: 'Token inválido ou expirado',
        });
    }
};