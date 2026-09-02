import { RequestHandler, Router } from 'express';

import { watchProgressController } from '../controllers/watchProgressController';
import { authMiddleware } from '../middlewares/authMiddleware';

const WatchProgressRouter = Router();

WatchProgressRouter.get(
    '/usuarios/:usuarioId/episodios/:episodioId/progresso',
    authMiddleware,
    watchProgressController.getProgress as unknown as RequestHandler
);

WatchProgressRouter.put(
    '/episodios/:episodioId/progresso',
    authMiddleware,
    watchProgressController.updateProgress as unknown as RequestHandler
);

WatchProgressRouter.post(
    '/episodios/:episodioId/concluir',
    authMiddleware,
    watchProgressController.markAsCompleted as unknown as RequestHandler
);

export default WatchProgressRouter;