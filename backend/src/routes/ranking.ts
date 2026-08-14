import { Router } from 'express';
import { rankingController } from '../controllers/rankingController';

const RankingRouter = Router();

RankingRouter.get('/ranking/:usuarioId', rankingController.getByUsuarioId);
RankingRouter.get('/ranking/:usuarioId/pontos', rankingController.getPontos);
RankingRouter.post('/ranking/:usuarioId/atualizar', rankingController.atualizar);
RankingRouter.post('/ranking/:usuarioId/recalcular', rankingController.recalcular);
RankingRouter.get('/ranking/top', rankingController.getTop);

export default RankingRouter;
