import { Router } from 'express';
import {
  listarTags,
  buscarTagPorId,
  buscarTagPorNome,
  criarTag,
  atualizarTag,
  deletarTag,
} from '../controllers/tagsControlador';

export const tagsRouter = Router();

/**
 * @swagger
 * /tags:
 *   get:
 *     tags: [Tags]
 *     summary: Listar todas as tags
 *     responses:
 *       200:
 *         description: Lista de tags
 */
tagsRouter.get('/', listarTags);

/**
 * @swagger
 * /tags/{id}:
 *   get:
 *     tags: [Tags]
 *     summary: Buscar tag por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag encontrada
 */
tagsRouter.get('/:id', buscarTagPorId);

/**
 * @swagger
 * /tags/buscar/nome:
 *   get:
 *     tags: [Tags]
 *     summary: Buscar tag por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag encontrada
 */
tagsRouter.get('/buscar/nome', buscarTagPorNome);

/**
 * @swagger
 * /tags:
 *   post:
 *     tags: [Tags]
 *     summary: Criar tag
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Tag criada
 */
tagsRouter.post('/', criarTag);

/**
 * @swagger
 * /tags/{id}:
 *   put:
 *     tags: [Tags]
 *     summary: Atualizar tag
 *     security:
 *       - bearerAuth: []
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
 *         description: Tag atualizada
 */
tagsRouter.put('/:id', atualizarTag);

/**
 * @swagger
 * /tags/{id}:
 *   delete:
 *     tags: [Tags]
 *     summary: Remover tag
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag removida
 */
tagsRouter.delete('/:id', deletarTag);
