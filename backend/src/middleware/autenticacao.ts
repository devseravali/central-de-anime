import type { Request, Response, NextFunction } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import {
  looksLikeGoogleJwt,
  verifyGoogleIdToken,
  type GoogleIdTokenPayload,
} from '../infra/googleIdToken';

const DEBUG_AUTH = process.env.DEBUG_AUTH === 'true';

function debug(...args: unknown[]) {
  if (DEBUG_AUTH) console.log('[auth]', ...args);
}

declare global {
  namespace Express {
    interface Request {
      usuario?: { id: string };

      usuarioId?: number;
      token?: string;
      authProvider?: 'local' | 'google';
      googleSub?: string;
      email?: string;
      role?: string;
    }
  }
}

type LocalTokenPayload = JwtPayload & {
  usuarioId: number;
  role?: string;
};

type AuthPayload = LocalTokenPayload | GoogleIdTokenPayload;

function isLocalPayload(payload: AuthPayload): payload is LocalTokenPayload {
  return typeof (payload as LocalTokenPayload).usuarioId === 'number';
}

function isGooglePayload(
  payload: AuthPayload,
): payload is GoogleIdTokenPayload {
  return typeof (payload as GoogleIdTokenPayload).sub === 'string';
}

function getBearer(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length ? token : null;
}

async function verifyLocalJwt(token: string): Promise<LocalTokenPayload> {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET não configurado');

  const payload = jwt.verify(token, secret) as LocalTokenPayload;

  if (
    typeof payload.usuarioId !== 'number' ||
    Number.isNaN(payload.usuarioId)
  ) {
    throw new Error('Token local sem usuarioId');
  }

  return payload;
}

async function verifyEither(token: string): Promise<AuthPayload> {
  const looksGoogle = looksLikeGoogleJwt(token);

  try {
    return looksGoogle
      ? await verifyGoogleIdToken(token)
      : await verifyLocalJwt(token);
  } catch (firstErr) {
    try {
      return looksGoogle
        ? await verifyLocalJwt(token)
        : await verifyGoogleIdToken(token);
    } catch {
      throw firstErr;
    }
  }
}

function attachToReq(req: Request, payload: AuthPayload): void {
  if (isLocalPayload(payload)) {
    req.authProvider = 'local';
    req.usuarioId = payload.usuarioId;
    req.role = payload.role;
    req.usuario = { id: String(payload.usuarioId) };
    return;
  }

  if (isGooglePayload(payload)) {
    req.authProvider = 'google';
    req.googleSub = payload.sub;
    req.email = payload.email;
    req.usuario = { id: payload.sub };
  }
}

function respondAuthError(res: Response, status: number, mensagem: string) {
  return res.status(status).json({ sucesso: false, mensagem });
}

export const autenticacao = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = getBearer(req);

  if (!token) {
    return respondAuthError(res, 401, 'Token ausente ou inválido');
  }

  req.token = token;

  try {
    debug('Validando token...');
    const payload = await verifyEither(token);
    attachToReq(req, payload);

    if (!req.usuario?.id) {
      return respondAuthError(
        res,
        401,
        'Token inválido: usuário não identificado',
      );
    }

    debug('Autenticado com sucesso:', req.authProvider);
    return next();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido';
    debug('Falha ao verificar token:', message);

    if (message.includes('Token malformado')) {
      return respondAuthError(res, 400, 'Token malformado');
    }

    if (message.includes('Token local sem usuarioId')) {
      return respondAuthError(
        res,
        401,
        'Token inválido: usuário não identificado',
      );
    }

    return respondAuthError(res, 401, 'Token inválido');
  }
};

export const autenticacaoOpcional = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const token = getBearer(req);
  if (!token) return next();

  req.token = token;

  try {
    const payload = await verifyEither(token);
    attachToReq(req, payload);
  } catch {
  }

  return next();
};

export const autenticacaoMiddleware = autenticacao;
export const autenticacaoOpcionalMiddleware = autenticacaoOpcional;