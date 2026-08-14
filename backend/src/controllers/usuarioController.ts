import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { usuarioService } from '../services/usuarioService';

interface RequestWithUsuario extends Request {
    usuarioId?: number;
}

export const usuarioController = {
    me: async (req: RequestWithUsuario, res: Response): Promise<void> => {
        try {
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({
                    message: 'Usuário não autenticado',
                });
                return;
            }

            const usuario = await usuarioService.getProfile(
                usuarioId
            );

            if (!usuario) {
                res.status(404).json({ message: 'Usuário não encontrado' });
                return;
            }

            res.status(200).json({ user: usuario });
        } catch (error) {
            console.error('Erro ao buscar usuário:', error);

            res.status(500).json({
                message: 'Erro interno do servidor',
            });
        }
    },

    ranking: async (req: Request, res: Response): Promise<void> => {
        try {
            const rankings = await prisma.rankingUsuario.findMany({
                include: {
                    usuario: {
                        select: {
                            id: true,
                            nome: true,
                        },
                    },
                },
                orderBy: {
                    pontos: 'desc',
                },
            });

            const result = rankings.map((r, index) => ({
                posicao: index + 1,
                id: r.usuario?.id ?? r.usuarioId,
                nome: r.usuario?.nome ?? null,
                pontos: r.pontos,
            }));

            res.status(200).json(result);
        } catch (error) {
            console.error('Erro ao buscar ranking:', error);

            res.status(500).json({
                message: 'Erro interno do servidor',
            });
        }
    },

    updateProfile: async (
        req: RequestWithUsuario,
        res: Response
    ): Promise<void> => {
        try {
            const usuarioId = req.usuarioId;

            if (!usuarioId) {
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            const data = req.body;

            const updated = await usuarioService.updateProfile(
                usuarioId,
                data
            );

            res.status(200).json({ user: updated });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao atualizar perfil';

            if (message === 'Usuário não encontrado') {
                res.status(404).json({ message });
                return;
            }

            if (message === 'Email já em uso') {
                res.status(409).json({ message });
                return;
            }

            console.error('Erro ao atualizar perfil:', error);

            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },

    promoteToAdmin: async (req: RequestWithUsuario, res: Response): Promise<void> => {
        try {
            const requesterId = req.usuarioId;

            if (!requesterId) {
                res.status(401).json({ message: 'Usuário não autenticado' });
                return;
            }

            const { usuarioId, nivel } = req.body;

            if (!usuarioId) {
                res.status(400).json({ message: 'usuarioId é obrigatório' });
                return;
            }

            await usuarioService.promoteToAdmin(usuarioId, nivel);

            res.status(200).json({ message: 'Usuário promovido a admin' });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Erro ao promover usuário';

            if (message === 'Usuário não encontrado') {
                res.status(404).json({ message });
                return;
            }

            console.error('Erro ao promover usuário:', error);

            res.status(500).json({ message: 'Erro interno do servidor' });
        }
    },
};