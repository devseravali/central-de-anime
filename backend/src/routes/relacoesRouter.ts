import { Router } from 'express';
import { relacoesControlador } from '../controllers/relacoesControlador';

const relacoesRouter = Router();

relacoesRouter.get('/animes/ano/:ano', relacoesControlador.listarAnimesPorAno);
relacoesRouter.get('/animes/titulo', relacoesControlador.buscarAnimesPorTitulo);
relacoesRouter.get(
  '/estudios/:estudioId/animes',
  relacoesControlador.listarAnimesdeUmEstudio,
);
relacoesRouter.get(
  '/animes/:animeId/personagens',
  relacoesControlador.listarPersonagensdeUmAnime,
);
relacoesRouter.get(
  '/personagens/:personagemId/animes',
  relacoesControlador.listarAnimesdeUmPersonagem,
);
relacoesRouter.get('/estacoes/nome', relacoesControlador.buscarEstacoesPorNome);
relacoesRouter.get('/status/nome', relacoesControlador.buscarStatusPorNome);
relacoesRouter.get('/estudios/nome', relacoesControlador.buscarEstudiosPorNome);
relacoesRouter.get(
  '/plataformas/nome',
  relacoesControlador.buscarPlataformasPorNome,
);

relacoesRouter.get('/tags', relacoesControlador.buscarTodasTags);

relacoesRouter.get('/tags/nome', relacoesControlador.buscarTagsPorNome);
relacoesRouter.get(
  '/personagens/nome',
  relacoesControlador.buscarPersonagensPorNome,
);

relacoesRouter.get(
  '/animes/tag/:tagId',
  relacoesControlador.listarAnimesdeUmaTag,
);
relacoesRouter.get(
  '/animes/status/:statusId',
  relacoesControlador.listarAnimesdeUmStatus,
);
// Alias por entidade para manter consistencia com o padrao /:entidade/:id/animes
relacoesRouter.get(
  '/status/:statusId/animes',
  relacoesControlador.listarAnimesdeUmStatus,
);
relacoesRouter.get(
  '/animes/genero/:generoId',
  relacoesControlador.listarAnimesdeUmGenero,
);
relacoesRouter.get(
  '/generos/:generoId/animes',
  relacoesControlador.listarAnimesdeUmGenero,
);
relacoesRouter.get(
  '/animes/estacao/:estacaoId',
  relacoesControlador.listarAnimesdeUmaEstacao,
);
relacoesRouter.get(
  '/estacoes/:estacaoId/animes',
  relacoesControlador.listarAnimesdeUmaEstacao,
);
relacoesRouter.get(
  '/animes/plataforma/:plataformaId',
  relacoesControlador.listarAnimesdeUmaPlataforma,
);
relacoesRouter.get(
  '/plataformas/:plataformaId/animes',
  relacoesControlador.listarAnimesdeUmaPlataforma,
);
relacoesRouter.get(
  '/animes/estudio/:estudioId',
  relacoesControlador.listarAnimesdeUmEstudio,
);
relacoesRouter.get(
  '/animes/personagem/:personagemId',
  relacoesControlador.listarAnimesdeUmPersonagem,
);
relacoesRouter.get(
  '/personagens/:personagemId/animes',
  relacoesControlador.listarAnimesdeUmPersonagem,
);
relacoesRouter.get(
  '/tags/:tagId/animes',
  relacoesControlador.listarAnimesdeUmaTag,
);

relacoesRouter.get('/overview', relacoesControlador.overviewRelacoes);

export { relacoesRouter };
