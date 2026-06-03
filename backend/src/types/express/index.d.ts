import 'express';
import 'express-session';

declare module 'express-serve-static-core' {
  interface Request {
    usuarioId?: number;
    refreshTokenHash?: string;
    sessaoId?: number;
  }
}

declare module 'express' {
  interface Request {
    usuarioId?: number;
    sessaoId?: number;
    refreshTokenHash?: string;
  }
}
declare module 'express-session' {
  interface SessionData {
    usuarioId?: number;
  }
}
