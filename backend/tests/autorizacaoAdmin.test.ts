import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { exigirAdmin, exigirPermissao } from '../src/middleware/permissoes';
import { adminAuthRepositorio } from '../src/repositories/adminAuthRepositorio';
import { ErroApi } from '../src/errors/ErroApi';

vi.mock('../src/repositories/adminAuthRepositorio', () => {
  return {
    adminAuthRepositorio: {
      usuarioEhAdminOuTemPermissoes: vi.fn(),
    },
  };
});

const adminRepo = adminAuthRepositorio as unknown as {
  usuarioEhAdminOuTemPermissoes: ReturnType<typeof vi.fn>;
};

const createReq = (overrides: Partial<Request> = {}): Request => {
  return overrides as Request;
};

const createRes = (): Response => {
  return {} as Response;
};

// Ajustando o tipo de `createNext` para retornar um mock com a propriedade `mock` acessível
const createNext = (): ReturnType<typeof vi.fn> & NextFunction => {
  const next = vi.fn((err?: any) => {});
  return next as unknown as ReturnType<typeof vi.fn> & NextFunction;
};

describe('Autorizacao Admin', () => {
  beforeEach(() => {
    adminRepo.usuarioEhAdminOuTemPermissoes.mockReset();
  });

  it('exigirAdmin permite role admin direto', async () => {
    const req = createReq({ role: 'admin' });
    const res = createRes();
    const next = createNext();

    await exigirAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeUndefined();
    expect(adminRepo.usuarioEhAdminOuTemPermissoes).not.toHaveBeenCalled();
  });

  it('exigirAdmin bloqueia sem usuario autenticado', async () => {
    const req = createReq({});
    const res = createRes();
    const next = createNext();

    await exigirAdmin(req, res, next);

    const erro = next.mock.calls[0]?.[0] as ErroApi;
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro.statusCode).toBe(403);
    expect(erro.codigo).toBe('ADMIN_REQUIRED');
  });

  it('exigirAdmin permite quando usuario tem role admin', async () => {
    adminRepo.usuarioEhAdminOuTemPermissoes.mockResolvedValue(true);
    const req = createReq({ usuarioId: 10 });
    const res = createRes();
    const next = createNext();

    await exigirAdmin(req, res, next);

    expect(adminRepo.usuarioEhAdminOuTemPermissoes).toHaveBeenCalledWith(10, [
      'admin:acesso',
    ]);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeUndefined();
  });

  it('exigirPermissao bloqueia sem permissao', async () => {
    adminRepo.usuarioEhAdminOuTemPermissoes.mockResolvedValue(false);
    const req = createReq({ usuarioId: 10 });
    const res = createRes();
    const next = createNext();

    const middleware = exigirPermissao('anime:criar');
    await middleware(req, res, next);

    const erro = next.mock.calls[0]?.[0] as ErroApi;
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro.statusCode).toBe(403);
    expect(erro.codigo).toBe('PERMISSION_REQUIRED');
  });

  it('exigirPermissao permite role admin', async () => {
    const req = createReq({ role: 'admin' });
    const res = createRes();
    const next = createNext();

    const middleware = exigirPermissao('anime:criar');
    await middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeUndefined();
  });
});
