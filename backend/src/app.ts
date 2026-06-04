import './config/env';
import express from 'express';
import { setupMiddlewares } from './config/middlewares';
import { setupRoutes } from './config/routes';
import { setupErrorHandlers } from './config/errorHandlers';
import { setupSwagger } from './config/swagger';

const app = express();

setupMiddlewares(app);
setupRoutes(app);
setupSwagger(app);
setupErrorHandlers(app);

export default app;
