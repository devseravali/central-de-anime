import type { NextFunction, Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { paginationMiddleware } from '../../middlewares/paginationMiddleware';

describe('paginationMiddleware', () => {
  it('deve aplicar valores padrão quando page e limit não forem válidos', () => {
    const req = {
      query: { page: '0', limit: '999' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    paginationMiddleware(req, res, next);

    expect(req.pagination).toEqual({
      page: 1,
      limit: 100,
      offset: 0,
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('deve calcular offset corretamente com parâmetros válidos', () => {
    const req = {
      query: { page: '3', limit: '15' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn() as NextFunction;

    paginationMiddleware(req, res, next);

    expect(req.pagination).toEqual({
      page: 3,
      limit: 15,
      offset: 30,
    });
    expect(next).toHaveBeenCalledTimes(1);
  });
});