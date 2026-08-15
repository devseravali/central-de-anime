import { Router } from 'express';
import { rankingController } from '../controllers/rankingController';
import { authMiddleware } from '../middlewares/authMiddleware';

const RankingRouter = Router();

RankingRouter.get('/ranking/:usuarioId', authMiddleware, rankingController.getByUsuarioId);
RankingRouter.get('/ranking/:usuarioId/pontos', authMiddleware, rankingController.getPontos);
RankingRouter.post('/ranking/:usuarioId/atualizar', authMiddleware, rankingController.atualizar);
RankingRouter.post('/ranking/:usuarioId/recalcular', authMiddleware, rankingController.recalcular);
RankingRouter.get('/ranking/top', rankingController.getTop);

export default RankingRouter;
