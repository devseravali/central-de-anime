import { generosServico } from '../services/generosServico';
import type { Request, Response } from 'express';
import { generosSchema } from '../schemas/generosSchema';

export const buscarTodosGeneros = async (req: Request, res: Response) => {
  const pagina = Number(req.query.pagina ?? 1);
  const limite = Number(req.query.limite ?? 20);

  if (pagina <= 0 || limite <= 0) {
    return res.status(400).json({
      error: 'Página ou limite inválido',
    });
  }

  const generos = await generosServico.listar({ pagina, limite });

  return res.status(200).json(generos);
};

export const buscarGeneroPorId = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const genero = await generosServico.buscarPorId(id);

  if (!genero) {
    return res.status(404).json({ error: 'Gênero não encontrado' });
  }

  return res.status(200).json(genero);
};

export const buscarGeneroPorNome = async (req: Request, res: Response) => {
  const nomeParam = req.params.nome;
  const nome = Array.isArray(nomeParam) ? nomeParam[0] : nomeParam;

  if (!nome) {
    return res.status(400).json({ error: 'Nome inválido' });
  }

  const genero = await generosServico.buscarPorNome(nome);

  if (!genero) {
    return res.status(404).json({ error: 'Gênero não encontrado' });
  }

  return res.status(200).json(genero);
};

export const listarAnimesPorGenero = async (req: Request, res: Response) => {
  const nomeParam = req.params.nome;
  const nome = Array.isArray(nomeParam) ? nomeParam[0] : nomeParam;

  if (!nome) {
    return res.status(400).json({ error: 'Nome do gênero inválido' });
  }

  const animes = await generosServico.listarAnimesPorNomeGenero(nome);

  return res.status(200).json(animes);
};

export const adicionarGenero = async (req: Request, res: Response) => {
  const parseResult = generosSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      detalhes: parseResult.error.format(),
    });
  }

  try {
    const genero = await generosServico.criar(parseResult.data);

    return res.status(201).json(genero);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Já existe um gênero com esse nome.',
      });
    }

    return res.status(500).json({
      error: 'Erro ao criar gênero.',
      detalhes: error,
    });
  }
};

export const atualizarGenero = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const parseResult = generosSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: 'Dados inválidos',
      detalhes: parseResult.error.format(),
    });
  }

  const genero = await generosServico.atualizar(id, parseResult.data);

  if (!genero) {
    return res.status(404).json({ error: 'Gênero não encontrado' });
  }

  return res.status(200).json(genero);
};

export const deletarGenero = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const genero = await generosServico.deletar(id);

  if (!genero) {
    return res.status(404).json({ error: 'Gênero não encontrado' });
  }

  return res.status(200).json({
    message: 'Gênero removido com sucesso',
  });
};