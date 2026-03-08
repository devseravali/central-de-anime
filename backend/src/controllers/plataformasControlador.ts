import { plataformaServico } from '../services/plataformasServico';
import type { Request, Response } from 'express';
import { PlataformasSchema } from '../schemas/plataformasSchema';

export async function obterTodasPlataformas(req: Request, res: Response) {
  try {
    const plataformas = await plataformaServico.listar();
    res.json(plataformas);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar plataformas.' });
  }
}

export async function obterPlataformaPorId(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const plataforma = await plataformaServico.buscarPorId(Number(id));

    if (!plataforma)
      return res.status(404).json({ erro: 'Plataforma não encontrada.' });

    res.json(plataforma);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar plataforma.' });
  }
}

export async function obterPlataformaPorNome(req: Request, res: Response) {
  try {
    let { nome } = req.params;

    if (Array.isArray(nome)) {
      nome = nome[0];
    }

    const plataforma = await plataformaServico.buscarPorNome(nome);

    if (!plataforma)
      return res.status(404).json({ erro: 'Plataforma não encontrada.' });

    res.json(plataforma);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar plataforma.' });
  }
}

export async function listarAnimesPorPlataforma(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const animes = await plataformaServico.listarAnimes(Number(id));

    res.json(animes);
  } catch (err) {
    console.log('Erro ao listar animes da plataforma:', err);
    res.status(500).json({ erro: 'Erro ao listar animes da plataforma.' });
  }
}

export async function criarPlataforma(req: Request, res: Response) {
  try {
    const resultado = PlataformasSchema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: resultado.error.flatten().fieldErrors,
      });
    }

    const plataforma = await plataformaServico.criar(resultado.data);

    res.status(201).json(plataforma);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar plataforma.' });
  }
}

export async function atualizarPlataforma(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const resultado = PlataformasSchema.safeParse(req.body);

    if (!resultado.success) {
      return res.status(400).json({
        erro: 'Dados inválidos',
        detalhes: resultado.error.flatten().fieldErrors,
      });
    }

    const plataforma = await plataformaServico.atualizar(
      Number(id),
      resultado.data,
    );

    if (!plataforma)
      return res.status(404).json({ erro: 'Plataforma não encontrada.' });

    res.json(plataforma);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar plataforma.' });
  }
}

export async function deletarPlataforma(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const plataforma = await plataformaServico.deletar(Number(id));

    if (!plataforma)
      return res.status(404).json({ erro: 'Plataforma não encontrada.' });

    res.json(plataforma);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao deletar plataforma.' });
  }
}