import { Router } from 'express';
import path from 'path';
import { prisma } from '../../lib/prisma';
import { usuariosServico } from '../../services/usuariosServico';

export const avatarRouter = Router();

avatarRouter.post('/remover', async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    const avatarPadrao = 'images/personagens/default.jpg';
    await usuariosServico.atualizarAvatar(usuarioId, avatarPadrao);
    const usuarioAtualizado = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    return res.json({ sucesso: true, usuario: usuarioAtualizado });
  } catch (err) {
    console.error('Erro ao remover avatar:', err);
    return res.status(500).json({ erro: 'Erro ao remover avatar.' });
  }
});


avatarRouter.post('/', async (req, res) => {
  console.log('[avatarRouter] req.body:', req.body);
  console.log('[avatarRouter] req.usuarioId:', req.usuarioId);
  try {
    const { personagemId } = req.body;
    const usuarioId = req.usuarioId;
    if (!usuarioId) {
      return res.status(401).json({ erro: 'Usuário não autenticado.' });
    }
    if (!personagemId) {
      return res.status(400).json({ erro: 'personagemId obrigatório.' });
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    if (!usuario) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const personagem = await prisma.personagem.findUnique({
      where: { id: Number(personagemId) },
      select: { id: true, nome: true, imagem: true },
    });
    if (!personagem) {
      return res.status(404).json({ erro: 'Personagem não encontrado.' });
    }
    let avatarPath = personagem.imagem;
    if (!avatarPath.startsWith('images/personagens/')) {
      avatarPath = `images/personagens/${path.basename(personagem.imagem)}`;
    }
    await usuariosServico.atualizarAvatar(usuarioId, avatarPath);
    const usuarioAtualizado = await prisma.usuario.findUnique({
      where: { id: usuarioId },
    });
    return res.json({ sucesso: true, usuario: usuarioAtualizado });
  } catch (err) {
    console.error('Erro ao definir avatar:', err);
    return res.status(500).json({ erro: 'Erro ao definir avatar.' });
  }
});