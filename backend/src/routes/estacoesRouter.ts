import { db } from '../db';
import { animes } from '../schema/animes';
import { estudios } from '../schema/estudios';
import { Router } from 'express';
import { exigirAdmin } from '../middleware/permissoes';
import {
  listarEstacoes,
  listarEstacaoPorId,
  listarEstacaoPorNome,
  adicionarEstacao,
  atualizarEstacao,
  removerEstacao,
} from '../controllers/estacoesControlador';

export const estacoesRouter = Router();
/**
 * @swagger
 * /estacoes:
 *   get:
 *     summary: Lista todas as estações
 *     tags: [Estacoes]
 *     responses:
 *       200:
 *         description: Lista de estações retornada com sucesso
 */
estacoesRouter.get('/', listarEstacoes);

/**
 * @swagger
 * /estacoes/{id}:
 *   get:
 *     summary: Busca uma estação por ID
 *     tags: [Estacoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da estação
 *     responses:
 *       200:
 *         description: Estação encontrada
 *       404:
 *         description: Estação não encontrada
 */
estacoesRouter.get('/:id', listarEstacaoPorId);

/**
 * @swagger
 * /estacoes/buscar/nome:
 *   get:
 *     summary: Busca estação por nome (query param)
 *     tags: [Estacoes]
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da estação
 *     responses:
 *       200:
 *         description: Estação encontrada
 *       404:
 *         description: Estação não encontrada
 */
estacoesRouter.get('/buscar/nome', listarEstacaoPorNome);

/**
 * @swagger
 * /estacoes/buscar/{nome}:
 *   get:
 *     summary: Busca estação por nome (path param)
 *     tags: [Estacoes]
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome da estação
 *     responses:
 *       200:
 *         description: Estação encontrada
 *       404:
 *         description: Estação não encontrada
 */
estacoesRouter.get('/buscar/:nome', listarEstacaoPorNome);

/**
 * @swagger
 * /estacoes:
 *   post:

 *     summary: Adiciona uma nova estação
 *     tags: [Estacoes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome da estação
 *     responses:
 *       201:
 *         description: Estação criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
estacoesRouter.post('/', adicionarEstacao);

/**
 * @swagger
 * /estacoes/{id}:
 *   put:

 *     summary: Atualiza uma estação
 *     tags: [Estacoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da estação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 description: Nome da estação
 *     responses:
 *       200:
 *         description: Estação atualizada com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Estação não encontrada
 */
estacoesRouter.put('/:id', atualizarEstacao);

/**
 * @swagger
 * /estacoes/{id}:
 *   delete:

 *     summary: Remove uma estação
 *     tags: [Estacoes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da estação
 *     responses:
 *       204:
 *         description: Estação removida com sucesso
 *       404:
 *         description: Estação não encontrada
 */
estacoesRouter.delete('/:id', removerEstacao);
