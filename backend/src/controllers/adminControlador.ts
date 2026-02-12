import { Request, Response } from 'express';
import { usuariosRepositorio } from '../repositories/usuariosRepositorio';
import { ErroApi } from '../errors/ErroApi';
import { parseId } from '../utils/parse';
import { asyncHandler } from '../utils/asyncHandler';

export const listarUsuarios = asyncHandler(
  async (_req: Request, res: Response) => {
    const usuarios = await usuariosRepositorio.listarTodos();
    res.status(200).json({ sucesso: true, dados: usuarios });
  },
);

export const obterUsuarioPorId = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseId(req.params.id);

    const usuario = await usuariosRepositorio.buscarPorId(id);
    if (!usuario) throw ErroApi.notFound('Usuário não encontrado.');

    res.status(200).json({ sucesso: true, dados: usuario });
  },
);

export const adicionarUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const { nome, email, senha } = req.body ?? {};

    if (!nome || !email || !senha) {
      throw ErroApi.badRequest('Todos os campos são obrigatórios.');
    }

    const usuarioExistente = await usuariosRepositorio.buscarPorEmail(email);
    if (usuarioExistente) throw ErroApi.conflict('E-mail já cadastrado.');

    const novoUsuario = await usuariosRepositorio.criar({ nome, email, senha });
    res.status(201).json({ sucesso: true, dados: novoUsuario });
  },
);

export const atualizarUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseId(req.params.id);
    const { nome, email } = req.body ?? {};

    if (nome === undefined && email === undefined) {
      throw ErroApi.badRequest('Informe ao menos um campo para atualizar.');
    }

    const usuarioAtual = await usuariosRepositorio.buscarPorId(id);
    if (!usuarioAtual) throw ErroApi.notFound('Usuário não encontrado.');

    if (email && email !== usuarioAtual.email) {
      const outro = await usuariosRepositorio.buscarPorEmail(email);
      if (outro) throw ErroApi.conflict('E-mail já cadastrado.');
    }

    const usuarioAtualizado = await usuariosRepositorio.atualizar(id, {
      nome,
      email,
    });
    res.status(200).json({ sucesso: true, dados: usuarioAtualizado });
  },
);

export const removerUsuario = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseId(req.params.id);

    const usuario = await usuariosRepositorio.buscarPorId(id);
    if (!usuario) throw ErroApi.notFound('Usuário não encontrado.');

    await usuariosRepositorio.remover(id);
    res
      .status(200)
      .json({ sucesso: true, mensagem: 'Usuário removido com sucesso.' });
  },
);
