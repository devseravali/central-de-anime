import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (
    err,
    _req,
    res,
    _next
) => {
    if (err instanceof Error) {
        console.error('Erro no middleware de erro:', err.message);
    } else {
        console.error('Erro desconhecido:', err);
    }

    res.status(500).json({
        message: 'Erro interno do servidor',
    });
};