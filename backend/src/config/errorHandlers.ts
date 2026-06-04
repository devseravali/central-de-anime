import { Express } from 'express';
import {
  badRequestHandler,
  notFoundHandler,
  errorHandler,
} from '../middleware/errorHandler';

export function setupErrorHandlers(app: Express) {
  app.use(badRequestHandler);
  app.use(notFoundHandler);
  app.use(errorHandler);
}
