import { Router } from 'express';
import { watchProgressController } from '../controllers/watchProgressController';

const WatchProgressRouter = Router();

WatchProgressRouter.get('/usuarios/:usuarioId/episodios/:episodioId/progresso', watchProgressController.getProgress);
WatchProgressRouter.put('/episodios/:episodioId/progresso', watchProgressController.updateProgress);
WatchProgressRouter.post('/episodios/:episodioId/concluir', watchProgressController.markAsCompleted);

export default WatchProgressRouter;
