import { db } from '../db';
import { animes } from '../schema/animes';
import { generos } from '../schema/generos';
import { Router } from 'express';
import * as generosControlador from '../controllers/generosControlador';

export const generosRouter = Router();

/**
 * @swagger
 * /generos:
 *   get:
 *     tags: [Generos]
 *     summary: Listar generos
 *     responses:
 *       200:
 *         description: Lista de generos
 */
generosRouter.get('/', generosControlador.buscarTodosGeneros);

/**
 * @swagger
 * /generos/{id}:
 *   get:
 *     tags: [Generos]
 *     summary: Buscar genero por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Genero encontrado
 */
generosRouter.get('/:id', generosControlador.buscarGeneroPorId);

/**
 * @swagger
 * /generos/busca/{nome}:
 *   get:
 *     tags: [Generos]
 *     summary: Buscar genero por nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Genero encontrado
 */
generosRouter.get('/busca/:nome', generosControlador.buscarGeneroPorNome);

/**
 * @swagger
 * /generos/{nome}/animes:
 *   get:
 *     tags: [Generos]
 *     summary: Listar animes por genero
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de animes por genero
 */
generosRouter.get('/:nome/animes', generosControlador.listarAnimesPorGenero);

/**
 * @swagger
 * /generos:
 *   post:
 *     tags: [Generos]
 *     summary: Criar genero

 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *     responses:
 *       201:
 *         description: Genero criado
 */
generosRouter.post('/', generosControlador.adicionarGenero);

/**
 * @swagger
 * /generos/{id}:
 *   put:
 *     tags: [Generos]
 *     summary: Atualizar genero

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
 *             properties:
 *               nome:
 *                 type: string
 *     responses:
 *       200:
 *         description: Genero atualizado
 */
generosRouter.put('/:id', generosControlador.atualizarGenero);

/**
 * @swagger
 * /generos/{id}:
 *   delete:
 *     tags: [Generos]
 *     summary: Remover genero

 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Genero removido
 */
generosRouter.delete('/:id', generosControlador.deletarGenero);
