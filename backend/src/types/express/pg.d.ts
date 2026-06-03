declare global {
  namespace Express {
    interface User {
      token?: string;
    }
  }
}

export {};
declare module 'pg';
