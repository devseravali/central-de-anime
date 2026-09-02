import { RequestHandler, Router } from 'express';

import { watchProgressController } from '../controllers/watchProgressController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validationMiddleware } from '../middlewares/validationMiddleware';
import {
    episodioIdParamSchema,
    usuarioEpisodioParamsSchema,
    updateProgressBodySchema,
} from '../schemas/watchProgress/progress.schemas';

const WatchProgressRouter = Router();

WatchProgressRouter.get(
    '/usuarios/:usuarioId/episodios/:episodioId/progresso',
    authMiddleware,
    watchProgressController.getProgress as unknown as RequestHandler
);

WatchProgressRouter.put(
    '/episodios/:episodioId/progresso',
    authMiddleware,
    validationMiddleware({ params: episodioIdParamSchema, body: updateProgressBodySchema }),
    watchProgressController.updateProgress as unknown as RequestHandler
);

WatchProgressRouter.post(
    '/episodios/:episodioId/concluir',
    authMiddleware,
    validationMiddleware({ params: episodioIdParamSchema }),
    watchProgressController.markAsCompleted as unknown as RequestHandler
);

export default WatchProgressRouter;