import 'express';

export type UsuarioAuth = {
  id: number;
  email: string;
  nome?: string;
};

declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
      usuario?: UsuarioAuth;
      token?: string;
    }
  }
}

export {};
