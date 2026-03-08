import { Request, Response } from 'express';
import { filtrosServico } from '../services/filtrosServico';
import { filtrosSchema } from '../schemas/filtrosSchema';

export const getFiltros = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'getFiltros' });
};

export const buscarAnimesPorGenero = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'buscarAnimesPorGenero' });
};

export const buscarAnimesPorStatus = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'buscarAnimesPorStatus' });
};

export const buscarAnimesPorGeneroNome = async (
  req: Request,
  res: Response,
) => {
  return res.status(200).json({ message: 'buscarAnimesPorGeneroNome' });
};

export const buscarAnimesPorEstudioNome = async (
  req: Request,
  res: Response,
) => {
  return res.status(200).json({ message: 'buscarAnimesPorEstudioNome' });
};

export const buscarAnimesPorAnoValor = async (req: Request, res: Response) => {
  return res.status(200).json({ message: 'buscarAnimesPorAnoValor' });
};

export const buscarAnimesComFiltros = async (req: Request, res: Response) => {
  try {
    const dados = {
      generos: req.query.generos
        ? (req.query.generos as string).split(',')
        : [],
      anos: req.query.anos
        ? (req.query.anos as string).split(',').map(Number)
        : [],
      estacoes: req.query.estacoes
        ? (req.query.estacoes as string).split(',')
        : [],
      status: req.query.status ? (req.query.status as string).split(',') : [],
    };

    const parseResult = filtrosSchema.safeParse(dados);

    if (!parseResult.success) {
      return res.status(400).json({
        erro: 'Filtros inválidos',
        detalhes: parseResult.error.format(),
      });
    }

    const { generos, anos, estacoes } = parseResult.data;

    const resultado = await filtrosServico.buscarFiltros(
      generos,
      anos?.[0],
      estacoes?.[0],
    );

    return res.status(200).json(resultado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Erro ao buscar animes com filtros.',
    });
  }
};

export const buscarPersonagensComFiltros = async (
  req: Request,
  res: Response,
) => {
  try {
    const dados = {
      nome: req.query.nome,
    };

    const parseResult = filtrosSchema.safeParse(dados);

    if (!parseResult.success) {
      return res.status(400).json({
        erro: 'Filtro inválido',
        detalhes: parseResult.error.format(),
      });
    }

    const { nome } = parseResult.data;

    const resultado = await filtrosServico.buscarPersonagens(nome);

    return res.status(200).json(resultado);
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: 'Erro ao buscar personagens com filtros.',
    });
  }
};