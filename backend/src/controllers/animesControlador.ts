import { Request, Response } from 'express';
import { Anime } from '../types/anime';
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
  const idParam = req.params.id;
  const id = Number(idParam);
  if (!idParam || isNaN(id) || id <= 0) {
    throw ErroApi.badRequest('ID do anime inválido', 'INVALID_ANIME_ID');
  }
  const anime = await animesServico.buscarPorId(String(id));
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
    const idParam = req.params.id;
    const id = Number(idParam);
    if (!idParam || isNaN(id) || id <= 0) {
      return res
        .status(400)
        .json({ sucesso: false, mensagem: 'ID inválido', dados: null });
    }
    const data = validarAnimeOuFalhar(req.body);
    const animeAtualizado = await animesServico.atualizarAnime(
      String(id),
      data,
    );
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
    const idParam = req.params.id;
    const id = Number(idParam);
    if (!idParam || isNaN(id) || id <= 0) {
      return res
        .status(400)
        .json({ sucesso: false, mensagem: 'ID inválido', dados: null });
    }
    const deletado = await animesServico.deletarAnime(String(id));
    if (!deletado) throw animeNaoEncontrado();
    return respostaDeletado(res, 'Anime removido com sucesso');
  },
);

export const buscarTemporadas = asyncHandler(
  async (_req: Request, res: Response) => {
    const animes = await animesServico.buscarTodos({ limite: 200 });
    const agrupado: Record<string, Anime[]> = {};
    for (const anime of animes) {
      const temporada = anime.temporada
        ? String(anime.temporada)
        : 'Desconhecida';
      if (!agrupado[temporada]) agrupado[temporada] = [];
      agrupado[temporada].push(anime);
    }
    return respostaSucesso(res, agrupado, {
      mensagem:
        Object.keys(agrupado).length > 0 ? 'Temporadas encontradas' : undefined,
    });
  },
);

export const buscarTemporadasQuantidade = asyncHandler(
  async (_req: Request, res: Response) => {
    const animes = await animesServico.buscarTodos({ limite: 200 });
    const temporadasSet = new Set<string>();
    for (const anime of animes) {
      if (anime.temporada) {
        temporadasSet.add(String(anime.temporada));
      }
    }
    const temporadas = Array.from(temporadasSet);
    const quantidadePorTemporada = temporadas.map((temporada) => ({
      temporada,
      quantidade: animes.filter(
        (anime) => String(anime.temporada) === temporada,
      ).length,
    }));
    return respostaLista(res, quantidadePorTemporada, {
      mensagem:
        quantidadePorTemporada.length > 0
          ? 'Temporadas encontradas'
          : undefined,
    });
  },
);

export const buscarTemporadasAnos = asyncHandler(
  async (_req: Request, res: Response) => {
    const animes = await animesServico.buscarTodos({ limite: 200 });
    const anos = Array.from(
      new Set(
        animes
          .map((anime) => anime.ano)
          .filter((ano): ano is number => typeof ano === 'number'),
      ),
    );
    return respostaLista(res, anos, {
      mensagem: anos.length > 0 ? 'Anos encontrados' : undefined,
    });
  },
);
