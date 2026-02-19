import { db } from '../db';
import { animes } from '../schema/animes';
import { personagens } from '../schema/personagens';
import { Router } from 'express';
import {
  obterPersonagens,
  obterPersonagemPorId,
  obterPersonagemPorNome,
  obterAnimesPorPersonagem,
  criarPersonagem,
  atualizarPersonagem,
  deletarPersonagem,
} from '../controllers/personagensControlador';

export const personagensRouter = Router();

/**
 * @swagger
 * /personagens:
 *   get:
 *     tags: [Personagens]
 *     summary: Listar personagens
 *     responses:
 *       200:
 *         description: Lista de personagens
 */
personagensRouter.get('/', obterPersonagens);

/**
 * @swagger
 * /personagens/{id}/animes:
 *   get:
 *     tags: [Personagens]
 *     summary: Listar animes por personagem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes do personagem
 */
personagensRouter.get('/:id/animes', obterAnimesPorPersonagem);

/**
 * @swagger
 * /personagens/{id}:
 *   get:
 *     tags: [Personagens]
 *     summary: Buscar personagem por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personagem encontrado
 */
personagensRouter.get('/:id', obterPersonagemPorId);

/**
 * @swagger
 * /personagens/nome/{nome}:
 *   get:
 *     tags: [Personagens]
 *     summary: Buscar personagem por nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personagem encontrado
 */
personagensRouter.get('/nome/:nome', obterPersonagemPorNome);

/**
 * @swagger
 * /personagens:
 *   post:
 *     tags: [Personagens]
 *     summary: Criar personagem

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Personagem criado
 */
personagensRouter.post('/', criarPersonagem);

/**
 * @swagger
 * /personagens/{id}:
 *   put:
 *     tags: [Personagens]
 *     summary: Atualizar personagem

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Personagem atualizado
 */
personagensRouter.put('/:id', atualizarPersonagem);

/**
 * @swagger
 * /personagens/{id}:
 *   delete:
 *     tags: [Personagens]
 *     summary: Remover personagem

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personagem removido
 */
personagensRouter.delete('/:id', deletarPersonagem);
