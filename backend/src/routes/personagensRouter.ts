import { Router } from 'express';
import { personagensControlador } from '../controllers/personagemControlador';

export const personagensRouter = Router();
/**
 * @swagger
 * /personagens:
 *   get:
 *     tags: [Personagens]
 *     summary: Lista todos os personagens
 *     responses:
 *       200:
 *         description: Lista de personagens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Personagem'
 *   post:
 *     tags: [Personagens]
 *     summary: Cria um novo personagem
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PersonagemInput'
 *     responses:
 *       201:
 *         description: Personagem criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personagem'
 * /personagens/{id}/animes:
 *   get:
 *     tags: [Personagens]
 *     summary: Lista animes de um personagem
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de animes do personagem
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Anime'
 * /personagens/{id}:
 *   get:
 *     tags: [Personagens]
 *     summary: Busca personagem por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personagem encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personagem'
 *   put:
 *     tags: [Personagens]
 *     summary: Atualiza personagem por ID
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
 *             $ref: '#/components/schemas/PersonagemInput'
 *     responses:
 *       200:
 *         description: Personagem atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personagem'
 *   delete:
 *     tags: [Personagens]
 *     summary: Deleta personagem por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Personagem deletado
 * /personagens/nome/{nome}:
 *   get:
 *     tags: [Personagens]
 *     summary: Busca personagem por nome
 *     parameters:
 *       - in: path
 *         name: nome
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personagem encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Personagem'
 */

personagensRouter.get('/', personagensControlador.obterPersonagens);
personagensRouter.get(
  '/:id/animes',
  personagensControlador.obterAnimesPorPersonagem,
);
personagensRouter.get('/:id', personagensControlador.obterPersonagemPorId);
personagensRouter.get(
  '/nome/:nome',
  personagensControlador.obterPersonagemPorNome,
);
personagensRouter.post('/', personagensControlador.criarPersonagem);
personagensRouter.put('/:id', personagensControlador.atualizarPersonagem);
personagensRouter.delete('/:id', personagensControlador.deletarPersonagem);
