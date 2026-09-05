import { Router, Request, Response } from 'express';

import { prisma } from '../config/prisma';
import { authMiddleware } from '../middlewares/authMiddleware';

const FavoritosRouter = Router();

function parseId(value: unknown): number | undefined {
  if (typeof value !== 'string') return undefined;

  const n = Number.parseInt(value, 10);

  return Number.isNaN(n) ? undefined : n;
}

/**
 * @swagger
 * /usuarios/{id}/favoritos/animes:
 *   get:
 *     summary: Lista os animes favoritos de um usuário
 *     description: >
 *       Retorna todos os animes favoritados pelo usuário.
 *       O próprio usuário pode consultar seus favoritos e administradores
 *       podem consultar os favoritos de qualquer usuário.
 *     tags:
 *       - Favoritos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de animes favoritos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   titulo:
 *                     type: string
 *                     example: Naruto
 *                   tipo:
 *                     type: string
 *                     example: TV
 *                   temporada:
 *                     type: integer
 *                     nullable: true
 *                     example: 1
 *                   ano:
 *                     type: integer
 *                     nullable: true
 *                     example: 2002
 *                   sinopse:
 *                     type: string
 *                     nullable: true
 *                     example: Naruto Uzumaki é um jovem ninja...
 *                   capaUrl:
 *                     type: string
 *                     nullable: true
 *                     example: https://example.com/naruto.jpg
 *                   quantidadeEpisodios:
 *                     type: integer
 *                     nullable: true
 *                     example: 220
 *                   estudio:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nome:
 *                         type: string
 *                         example: Studio Pierrot
 *                   status:
 *                     type: object
 *                     nullable: true
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       nome:
 *                         type: string
 *                         example: Em andamento
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
FavoritosRouter.get(
  '/usuarios/:id/favoritos/animes',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === undefined) {
        res.status(400).json({ message: 'ID inválido' });
        return;
      }

      if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      const favs = await prisma.usuarioFavoritoAnime.findMany({
        where: { usuarioId: id },
        include: {
          anime: {
            select: {
              id: true,
              titulo: true,
              tipo: true,
              temporada: true,
              ano: true,
              sinopse: true,
              capaUrl: true,
              quantidadeEpisodios: true,
              estudio: {
                select: {
                  id: true,
                  nome: true,
                },
              },
              status: {
                select: {
                  id: true,
                  nome: true,
                },
              },
            },
          },
        },
      });

      res.status(200).json(favs.map(f => f.anime));
    } catch (error) {
      console.error('Erro ao buscar favoritos (animes)', error);

      res.status(500).json({
        message: 'Erro ao buscar favoritos',
      });
    }
  }
);

/**
 * @swagger
 * /usuarios/{id}/favoritos/personagens:
 *   get:
 *     summary: Lista os personagens favoritos de um usuário
 *     description: >
 *       Retorna todos os personagens favoritados pelo usuário.
 *       O próprio usuário pode consultar seus favoritos e administradores
 *       podem consultar os favoritos de qualquer usuário.
 *     tags:
 *       - Favoritos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de personagens favoritos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 description: Dados do personagem favorito
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: Naruto Uzumaki
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
FavoritosRouter.get(
  '/usuarios/:id/favoritos/personagens',
  authMiddleware,
  async (req: Request, res: Response) => {
    try {
      const id = parseId(req.params.id);

      if (id === undefined) {
        res.status(400).json({ message: 'ID inválido' });
        return;
      }

      if (req.user?.id !== id && req.user?.role !== 'ADMIN') {
        res.status(403).json({ message: 'Acesso negado' });
        return;
      }

      const favs = await prisma.personagemFavorito.findMany({
        where: { usuarioId: id },
        include: {
          personagem: true,
        },
      });

      res.status(200).json(favs.map(f => f.personagem));
    } catch (error) {
      console.error('Erro ao buscar favoritos (personagens)', error);

      res.status(500).json({
        message: 'Erro ao buscar favoritos',
      });
    }
  }
);

export default FavoritosRouter;