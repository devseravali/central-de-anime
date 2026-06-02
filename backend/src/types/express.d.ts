declare global {
  namespace Express {
    interface Request {
      apiVersion?: string;
    }
  }
}

export {};
