import type { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email?: string;
        nome?: string;
        role?: string;
      };

      pagination?: {
        page: number;
        limit: number;
        offset: number;
      };
    }
  }
}

export {};
import type { JwtPayload } from 'jsonwebtoken';

declare namespace Express {
    interface Request {
        pagination: {
            page: number;
            limit: number;
            offset: number;
        };
    }
}


declare global {
    namespace Express {
        interface Request {
            user?: string | JwtPayload;
        }
    }
}

export {};