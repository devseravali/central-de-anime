import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { ErroApi } from '../errors/ErroApi';
import { animesServico } from '../services/animesServico';
import { validarAnimeOuFalhar } from '../utils/validators';
import { parseIdParam } from '../helpers/httpParsers';
import {
  respostaLista,
  respostaSucesso,
  respostaCriado,
  respostaAtualizado,
  respostaDeletado,
} from '../helpers/responseHelpers';

const animeNaoEncontrado = () => ErroApi.notFound('Anime', 'ANIME_NOT_FOUND');

export const buscarTodos = asyncHandler(async (req: Request, res: Response) => {
  // Paginação: ?pagina=1&limite=20
  const pagina = Number(req.query.pagina) > 0 ? Number(req.query.pagina) : 1;
  const limite = Number(req.query.limite) > 0 ? Number(req.query.limite) : 20;
  const animes = await animesServico.buscarTodos({ pagina, limite });
  return respostaLista(res, animes);
});

export const buscarComTitulos = asyncHandler(
  async (_req: Request, res: Response) => {
    const animes = await animesServico.buscarComTitulos();
    return respostaLista(res, animes, {
      mensagem: animes.length > 0 ? 'Animes encontrados' : undefined,
    });
  },
);

export const buscarNomes = asyncHandler(
  async (_req: Request, res: Response) => {
    const nomes = await animesServico.buscarNomes();
    return respostaLista(res, nomes);
  },
);

export const buscarPorId = asyncHandler(async (req: Request, res: Response) => {
  const id = parseIdParam(req, 'anime', 'INVALID_ANIME_ID');

  const anime = await animesServico.buscarPorId(id);
  if (!anime) throw animeNaoEncontrado();

  return respostaSucesso(res, anime);
});

export const adicionarAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const data = validarAnimeOuFalhar(req.body);

    const novoAnime = await animesServico.adicionarAnime(data);

    return respostaCriado(res, novoAnime, 'Anime criado com sucesso');
  },
);

export const atualizarAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req, 'anime', 'INVALID_ANIME_ID');
    const data = validarAnimeOuFalhar(req.body);

    const animeAtualizado = await animesServico.atualizarAnime(id, data);
    if (!animeAtualizado) throw animeNaoEncontrado();

    return respostaAtualizado(
      res,
      animeAtualizado,
      'Anime atualizado com sucesso',
    );
  },
);

export const deletarAnime = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseIdParam(req, 'anime', 'INVALID_ANIME_ID');

    const deletado = await animesServico.deletarAnime(id);
    if (!deletado) throw animeNaoEncontrado();

    return respostaDeletado(res, 'Anime removido com sucesso');
  },
);
