import type { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            message: 'Usuário não autenticado'
        });
        return;
    }

    if (req.user.role !== 'ADMIN') {
        res.status(403).json({
            message: 'Acesso negado: privilégios de administrador necessários'
        });
        return;
    }

    next();
};