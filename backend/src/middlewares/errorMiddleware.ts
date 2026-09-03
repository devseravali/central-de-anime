import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (
    err,
    _req,
    res,
    _next
) => {
    console.error('Erro no servidor:', err && typeof err === 'object' ? (err as Error).message : String(err));

    const status =
        typeof err?.status === 'number'
            ? err.status
            : typeof err?.statusCode === 'number'
                ? err.statusCode
                : 500;

    const message =
        status >= 500
            ? 'Erro interno do servidor'
            : err instanceof Error
                ? err.message
                : err && typeof err === 'object' && 'message' in err && typeof err.message === 'string'
                    ? err.message
                    : 'Erro na requisição';

    const response: {
        message: string;
        stack?: string;
    } = {
        message,
    };

    if (process.env.NODE_ENV !== 'production' && err instanceof Error) {
        response.stack = err.stack;
    }

    res.status(status).json(response);
};