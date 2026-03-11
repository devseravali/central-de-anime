import { Router } from 'express';
import {
  listarEstacoes,
  buscarEstacaoPorId,
  buscarEstacaoPorNome,
  criarEstacao,
  atualizarEstacao,
  removerEstacao,
} from '../controllers/estacoesControlador';

export const estacoesRouter = Router();

/**
 * @swagger
 * /estacoes:
 *   get:
 *     tags: [Estacoes]
 *     summary: Lista todas as estações
 *     responses:
 *       200:
 *         description: Lista de estações
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 *   post:
 *     tags: [Estacoes]
 *     summary: Cria uma nova estação
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Estacao'
 *     responses:
 *       201:
 *         description: Estação criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 * /estacoes/{id}:
 *   get:
 *     tags: [Estacoes]
 *     summary: Busca estação por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 *   put:
 *     tags: [Estacoes]
 *     summary: Atualiza estação por ID
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
 *             $ref: '#/components/schemas/Estacao'
 *     responses:
 *       200:
 *         description: Estação atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 *   delete:
 *     tags: [Estacoes]
 *     summary: Remove estação por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Estação removida
 * /estacoes/buscar:
 *   get:
 *     tags: [Estacoes]
 *     summary: Busca estação por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resposta'
 */

estacoesRouter.get('/', listarEstacoes);
estacoesRouter.get('/:id', buscarEstacaoPorId);
estacoesRouter.get('/buscar', buscarEstacaoPorNome);
estacoesRouter.post('/', criarEstacao);
estacoesRouter.put('/:id', atualizarEstacao);
estacoesRouter.delete('/:id', removerEstacao);
