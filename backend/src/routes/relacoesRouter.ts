import { Router } from 'express';
import * as relacoesControlador from '../controllers/relacoesControlador';

export const relacoesRouter = Router();

/**
 * @swagger
 * /relacoes/temporadas:
 *   get:
 *     tags: [Relacoes]
 *     summary: Buscar temporadas por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de temporadas
 */
relacoesRouter.get('/temporadas', relacoesControlador.buscarTemporadasPorNome);
/**
 * @swagger
 * /relacoes/estacoes:
 *   get:
 *     tags: [Relacoes]
 *     summary: Buscar estacoes por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de estacoes
 */
relacoesRouter.get('/estacoes', relacoesControlador.buscarEstacoesPorNome);
/**
 * @swagger
 * /relacoes/status:
 *   get:
 *     tags: [Relacoes]
 *     summary: Buscar status por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de status
 */
relacoesRouter.get('/status', relacoesControlador.buscarStatusPorNome);
/**
 * @swagger
 * /relacoes/estudios:
 *   get:
 *     tags: [Relacoes]
 *     summary: Buscar estudios por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de estudios
 */
relacoesRouter.get('/estudios', relacoesControlador.buscarEstudiosPorNome);
/**
 * @swagger
 * /relacoes/plataformas:
 *   get:
 *     tags: [Relacoes]
 *     summary: Buscar plataformas por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de plataformas
 */
relacoesRouter.get(
  '/plataformas',
  relacoesControlador.buscarPlataformasPorNome,
);
/**
 * @swagger
 * /relacoes/tags:
 *   get:
 *     tags: [Relacoes]
 *     summary: Buscar tags por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de tags
 */
relacoesRouter.get('/tags', relacoesControlador.buscarTagsPorNome);
/**
 * @swagger
 * /relacoes/animes:
 *   get:
 *     tags: [Relacoes]
 *     summary: Buscar animes por título
 *     parameters:
 *       - in: query
 *         name: titulo
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de animes
 */
relacoesRouter.get('/animes', relacoesControlador.buscarAnimesPorTitulo);
/**
 * @swagger
 * /relacoes/personagens:
 *   get:
 *     tags: [Relacoes]
 *     summary: Buscar personagens por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de personagens
 */
relacoesRouter.get(
  '/personagens',
  relacoesControlador.buscarPersonagensPorNome,
);

/**
 * @swagger
 * /relacoes/animes/personagem/{personagemId}:
 *   get:
 *     tags: [Relacoes]
 *     summary: Listar animes de um personagem
 *     parameters:
 *       - in: path
 *         name: personagemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes do personagem
 */
relacoesRouter.get(
  '/animes/personagem/:personagemId',
  relacoesControlador.listarAnimesdeUmPersonagem,
);
/**
 * @swagger
 * /relacoes/personagens/anime/{animeId}:
 *   get:
 *     tags: [Relacoes]
 *     summary: Listar personagens de um anime
 *     parameters:
 *       - in: path
 *         name: animeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de personagens do anime
 */
relacoesRouter.get(
  '/personagens/anime/:animeId',
  relacoesControlador.listarPersonagensdeUmAnime,
);
relacoesRouter.get(
  '/animes/genero/:generoId',
  relacoesControlador.listarAnimesdeUmGenero,
);
relacoesRouter.get(
  '/generos/anime/:animeId',
  relacoesControlador.listarGenerosdeUmAnime,
);
relacoesRouter.get(
  '/animes/estudio/:estudioId',
  relacoesControlador.listarAnimesdeUmEstudio,
);
relacoesRouter.get(
  '/estudio/anime/:animeId',
  relacoesControlador.buscarEstudiodeUmAnime,
);
relacoesRouter.get(
  '/animes/plataforma/:plataformaId',
  relacoesControlador.listarAnimesdeUmaPlataforma,
);
relacoesRouter.get(
  '/plataformas/anime/:animeId',
  relacoesControlador.listarPlataformasdeUmAnime,
);
relacoesRouter.get(
  '/animes/temporada/:temporadaId',
  relacoesControlador.listarAnimesdeUmaTemporada,
);
relacoesRouter.get(
  '/temporada/anime/:animeId',
  relacoesControlador.buscarTemporadadeUmAnime,
);
relacoesRouter.get(
  '/animes/estacao/:estacaoId',
  relacoesControlador.listarAnimesdeUmaEstacao,
);
relacoesRouter.get(
  '/estacao/anime/:animeId',
  relacoesControlador.buscarEstacaodeUmAnime,
);
relacoesRouter.get(
  '/animes/status/:statusId',
  relacoesControlador.listarAnimesdeUmStatus,
);
relacoesRouter.get(
  '/status/anime/:animeId',
  relacoesControlador.buscarStatusdeUmAnime,
);
relacoesRouter.get(
  '/animes/tag/:tagId',
  relacoesControlador.listarAnimesdeUmaTag,
);
relacoesRouter.get(
  '/tags/anime/:animeId',
  relacoesControlador.listarTagsdeUmAnime,
);

relacoesRouter.get(
  '/entidades/anime/:animeId',
  relacoesControlador.buscaEntidadesRelacionadasComAnime,
);
relacoesRouter.get(
  '/animes/entidade/:entidadeType/:entidadeId',
  relacoesControlador.buscarAnimesRelacionadosComUmaEntidade,
);
relacoesRouter.get(
  '/entidade/animes/:entidadeType/:entidadeId',
  relacoesControlador.buscarAnimesDeUmaEntidade,
);

relacoesRouter.get('/animes/:id', relacoesControlador.buscarAnimePorId);
