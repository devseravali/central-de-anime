import type { RequestHandler } from 'express';
import { loadEnvironment } from '../config/environment';

export const readOnlyEnvironment: RequestHandler = (req, res, next) => {
  const { readOnly } = loadEnvironment();
  if (readOnly && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    res.status(403).json({ message: 'Ambiente somente leitura: operacoes de escrita bloqueadas.' });
    return;
  }
  next();
};
