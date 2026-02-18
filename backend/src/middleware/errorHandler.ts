import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ZodError } from 'zod';
import { ErroApi } from '../errors/ErroApi';

function nowIso(): string {
  return new Date().toISOString();
}

function respostaErro(
  res: Response,
  statusCode: number,
  mensagem: string,
  codigo: string,
) {
  return res.status(statusCode).json({
    sucesso: false,
    dados: null,
    erro: {
      mensagem,
      codigo,
      timestamp: nowIso(),
    },
  });
}

export function badRequestHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof SyntaxError && 'body' in (err as object)) {
    return respostaErro(
      res,
      400,
      'JSON inválido no corpo da requisição',
      'INVALID_JSON',
    );
  }
  return next(err);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof ErroApi) {
    return respostaErro(
      res,
      err.statusCode,
      err.mensagem,
      err.codigo || 'ERRO_DESCONHECIDO',
    );
  }

  if (err instanceof ZodError) {
    return respostaErro(res, 400, 'Dados inválidos.', 'BAD_REQUEST');
  }

  if (err instanceof Error) {
    if (err.name === 'JsonWebTokenError') {
      return respostaErro(res, 401, 'Token inválido', 'INVALID_TOKEN');
    }
    if (err.name === 'TokenExpiredError') {
      return respostaErro(res, 401, 'Token expirado', 'TOKEN_EXPIRED');
    }
  }

  console.error('Erro inesperado:', err);
  return respostaErro(res, 500, 'Erro interno do servidor', 'INTERNAL_ERROR');
}

export function notFoundHandler(req: Request, res: Response) {
  return respostaErro(
    res,
    404,
    `Rota não encontrada: ${req.method} ${req.path}`,
    'ROUTE_NOT_FOUND',
  );
}

export const asyncHandler =
  (fn: RequestHandler): RequestHandler =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
