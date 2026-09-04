import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { adminMiddleware } from '../../middlewares/adminMiddleware';

function criarResponse() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  return { res: { status } as unknown as Response, status, json };
}

describe('adminMiddleware', () => {
  it('deve retornar 401 quando não houver usuário autenticado', () => {
    const req = {} as Request;
    const { res, status, json } = criarResponse();
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      message: 'Usuário não autenticado',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve retornar 403 para usuário sem papel de administrador', () => {
    const req = {
      user: { id: 1, role: 'USER' },
    } as Request;
    const { res, status, json } = criarResponse();
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    expect(status).toHaveBeenCalledWith(403);
    expect(json).toHaveBeenCalledWith({
      message: 'Acesso negado: privilégios de administrador necessários',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve permitir passagem para administrador', () => {
    const req = {
      user: { id: 1, role: 'ADMIN' },
    } as Request;
    const { res } = criarResponse();
    const next = vi.fn() as NextFunction;

    adminMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});