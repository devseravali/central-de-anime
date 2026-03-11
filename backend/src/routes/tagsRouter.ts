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
 *     summary: Lista todas as tags
 *     responses:
 *       200:
 *         description: Lista de tags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tag'
 *   post:
 *     tags: [Tags]
 *     summary: Cria uma nova tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TagInput'
 *     responses:
 *       201:
 *         description: Tag criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 * /tags/{id}:
 *   get:
 *     tags: [Tags]
 *     summary: Busca tag por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tag encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *   put:
 *     tags: [Tags]
 *     summary: Atualiza tag por ID
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
 *             $ref: '#/components/schemas/TagInput'
 *     responses:
 *       200:
 *         description: Tag atualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 *   delete:
 *     tags: [Tags]
 *     summary: Deleta tag por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Tag deletada
 * /tags/buscar/nome:
 *   get:
 *     tags: [Tags]
 *     summary: Busca tag por nome
 *     parameters:
 *       - in: query
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tag encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tag'
 */

tagsRouter.get('/', listarTags);
tagsRouter.get('/:id', buscarTagPorId);
tagsRouter.get('/buscar/nome', buscarTagPorNome);
tagsRouter.post('/', criarTag);
tagsRouter.put('/:id', atualizarTag);
tagsRouter.delete('/:id', deletarTag);
