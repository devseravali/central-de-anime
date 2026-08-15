import { Router } from 'express';
import { interacaoController } from '../controllers/interacaoController';
import { authMiddleware } from '../middlewares/authMiddleware';

const InteracoesRouter = Router();

InteracoesRouter.post('/animes/:animeId/favoritar', authMiddleware, interacaoController.favoritarAnime);
InteracoesRouter.post('/animes/:animeId/desfavoritar', authMiddleware, interacaoController.desfavoritarAnime);
InteracoesRouter.post('/animes/:animeId/nota', authMiddleware, interacaoController.darNota);
InteracoesRouter.delete('/animes/:animeId/nota', authMiddleware, interacaoController.removerNota);

InteracoesRouter.post('/personagens/:personagemId/favoritar', authMiddleware, interacaoController.favoritarPersonagem);
InteracoesRouter.post('/personagens/:personagemId/desfavoritar', authMiddleware, interacaoController.desfavoritarPersonagem);

export default InteracoesRouter;
