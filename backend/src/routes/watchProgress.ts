import { Router } from 'express';
import { watchProgressController } from '../controllers/watchProgressController';
import { authMiddleware } from '../middlewares/authMiddleware';

const WatchProgressRouter = Router();

WatchProgressRouter.get('/usuarios/:usuarioId/episodios/:episodioId/progresso', authMiddleware, watchProgressController.getProgress);
WatchProgressRouter.put('/episodios/:episodioId/progresso', authMiddleware, watchProgressController.updateProgress);
WatchProgressRouter.post('/episodios/:episodioId/concluir', authMiddleware, watchProgressController.markAsCompleted);

export default WatchProgressRouter;
