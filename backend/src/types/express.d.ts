import 'express';

declare global {
  namespace Express {
    interface Request {
      usuario?: { id: string };
      usuarioId?: number;
      sessaoId?: number;

      authProvider?: 'google' | 'local';
      email?: string;

      token?: string; 
    }
  }
}

export {};
