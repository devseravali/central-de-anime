import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET não configurado');
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
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

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

        const userId = decoded.sub ? Number(decoded.sub) : NaN;

        req.user = {
            id: Number.isNaN(userId) ? 0 : userId,
            email: typeof decoded.email === 'string' ? decoded.email : undefined,
            nome: typeof decoded.nome === 'string' ? decoded.nome : undefined,
            role: typeof decoded.role === 'string' ? decoded.role : undefined,
        };

        next();
    } catch (error) {
        console.error('Erro ao validar JWT:', error);

        res.status(401).json({
            message: 'Token inválido ou expirado',
        });
    }
};