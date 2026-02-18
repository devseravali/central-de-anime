import type { Request, Response, NextFunction } from 'express';
import { ErroApi } from '../errors/ErroApi';
import { adminAuthRepositorio } from '../repositories/adminAuthRepositorio';
import { asyncHandler } from './errorHandler';

type CodigoErro = 'ADMIN_REQUIRED' | 'PERMISSION_REQUIRED';

function getUsuarioId(req: Request): number | null {
  if (typeof req.usuarioId === 'number' && !Number.isNaN(req.usuarioId)) {
    return req.usuarioId;
  }

  const raw = req.usuario?.id;
  if (!raw) return null;

  const parsed = Number(raw);
  return Number.isNaN(parsed) ? null : parsed;
}

function exigirUsuarioId(req: Request, codigoErro: CodigoErro): number {
  const usuarioId = getUsuarioId(req);
  if (!usuarioId) throw ErroApi.forbidden(codigoErro);
  return usuarioId;
}

function isAdminBypass(req: Request): boolean {
  return req.role === 'admin';
}

export const exigirAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdminBypass(req)) return next();

    const usuarioId = exigirUsuarioId(req, 'ADMIN_REQUIRED');

    const ok = await adminAuthRepositorio.usuarioEhAdminOuTemPermissoes(
      usuarioId,
      ['admin:acesso'],
    );

    if (!ok) {
      throw ErroApi.forbidden('ADMIN_REQUIRED');
    }

    return next();
  },
);

export const exigirPermissao = (permissaoChave: string) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdminBypass(req)) return next();

    const usuarioId = exigirUsuarioId(req, 'PERMISSION_REQUIRED');

    const ok = await adminAuthRepositorio.usuarioEhAdminOuTemPermissoes(
      usuarioId,
      [permissaoChave],
    );

    if (!ok) {
      throw ErroApi.forbidden('PERMISSION_REQUIRED');
    }

    return next();
  });

export const exigirAlgumaPermissao = (permissoesChave: string[]) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (isAdminBypass(req)) return next();

    const usuarioId = exigirUsuarioId(req, 'PERMISSION_REQUIRED');

    const ok = await adminAuthRepositorio.usuarioEhAdminOuTemPermissoes(
      usuarioId,
      permissoesChave,
    );

    if (!ok) {
      throw ErroApi.forbidden('PERMISSION_REQUIRED');
    }

    return next();
  });
