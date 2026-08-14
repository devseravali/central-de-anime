import { Router } from 'express';
import { interacaoController } from '../controllers/interacaoController';

const InteracoesRouter = Router();

InteracoesRouter.post('/animes/:animeId/favoritar', interacaoController.favoritarAnime);
InteracoesRouter.post('/animes/:animeId/desfavoritar', interacaoController.desfavoritarAnime);
InteracoesRouter.post('/animes/:animeId/nota', interacaoController.darNota);
InteracoesRouter.delete('/animes/:animeId/nota', interacaoController.removerNota);

InteracoesRouter.post('/personagens/:personagemId/favoritar', interacaoController.favoritarPersonagem);
InteracoesRouter.post('/personagens/:personagemId/desfavoritar', interacaoController.desfavoritarPersonagem);

export default InteracoesRouter;
