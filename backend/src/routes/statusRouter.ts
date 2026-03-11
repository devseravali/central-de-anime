import { Router } from 'express';
import * as statusControlador from '../controllers/statusControlador';

export const statusRouter = Router();
/**
 * @swagger
 * /status:
 *   get:
 *     tags: [Status]
 *     summary: Lista todos os status
 *     responses:
 *       200:
 *         description: Lista de status
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Status'
 *   post:
 *     tags: [Status]
 *     summary: Adiciona um novo status
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StatusInput'
 *     responses:
 *       201:
 *         description: Status criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Status'
 * /status/{id}:
 *   get:
 *     tags: [Status]
 *     summary: Busca status por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Status'
 *   put:
 *     tags: [Status]
 *     summary: Atualiza status por ID
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
 *             $ref: '#/components/schemas/StatusInput'
 *     responses:
 *       200:
 *         description: Status atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Status'
 *   delete:
 *     tags: [Status]
 *     summary: Deleta status por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Status deletado
 * /status/nome/{nome}:
 *   get:
 *     tags: [Status]
 *     summary: Busca status por nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Status'
 */

statusRouter.get('/', statusControlador.buscarTodosStatus);
statusRouter.get('/:id', statusControlador.buscarStatusPorId);
statusRouter.get('/nome/:nome', statusControlador.buscarStatusPorNome);
statusRouter.post('/', statusControlador.adicionarStatus);
statusRouter.put('/:id', statusControlador.atualizarStatus);
statusRouter.delete('/:id', statusControlador.deletarStatus);
