import { Router, Request, Response } from 'express';

import { authMiddleware } from '../middlewares/authMiddleware';
import { conquistasService } from '../services/conquistasService';

const ConquistasRouter = Router();

function parseId(value: unknown): number | undefined {
    if (typeof value !== 'string') {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
}

/**
 * @swagger
 * /usuarios/{id}/conquistas:
 *   get:
 *     summary: Lista conquistas e badges de um usuário
 *     description: Retorna as conquistas calculadas dinamicamente a partir do progresso, favoritos e ranking.
 *     tags:
 *       - Conquistas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Conquistas retornadas com sucesso
 *       400:
 *         description: ID inválido
 *       401:
 *         description: Token de autenticação ausente ou inválido
 *       403:
 *         description: Acesso negado
 *       500:
 *         description: Erro interno do servidor
 */
ConquistasRouter.get('/usuarios/:id/conquistas', authMiddleware, async (req: Request, res: Response) => {
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

        const result = await conquistasService.getConquistasByUsuarioId(id);

        res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao buscar conquistas', error);

        res.status(500).json({
            message: 'Erro ao buscar conquistas',
        });
    }
});

export default ConquistasRouter;
