import { Router } from 'express';
import * as statusControlador from '../controllers/statusControlador';

export const statusRouter = Router();

/**
 * @swagger
 * /status:
 *   get:
 *     tags: [Status]
 *     summary: Listar todos os status
 *     responses:
 *       200:
 *         description: Lista de status
 */
statusRouter.get('/', statusControlador.buscarTodosStatus);

/**
 * @swagger
 * /status/{id}:
 *   get:
 *     tags: [Status]
 *     summary: Buscar status por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status encontrado
 */
statusRouter.get('/:id', statusControlador.buscarStatusPorId);

/**
 * @swagger
 * /status/nome/{nome}:
 *   get:
 *     tags: [Status]
 *     summary: Buscar status por nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Status encontrado
 */
statusRouter.get('/nome/:nome', statusControlador.buscarStatusPorNome);

/**
 * @swagger
 * /status:
 *   post:
 *     tags: [Status]
 *     summary: Criar status

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Status criado
 */
statusRouter.post('/', statusControlador.adicionarStatus);

/**
 * @swagger
 * /status/{id}:
 *   put:
 *     tags: [Status]
 *     summary: Atualizar status

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
 *         description: Status atualizado
 */
statusRouter.put('/:id', statusControlador.atualizarStatus);

/**
 * @swagger
 * /status/{id}:
 *   delete:
 *     tags: [Status]
 *     summary: Remover status

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Status removido
 */
statusRouter.delete('/:id', statusControlador.deletarStatus);
