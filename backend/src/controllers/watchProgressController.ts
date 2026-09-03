import type { Request, Response } from 'express';

import { watchProgressService } from '../services/watchProgressService';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        role: 'USER' | 'ADMIN';
    };
}

function parseIntParam(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isInteger(value)) {
        return value;
    }

    if (typeof value !== 'string' || value.trim() === '') {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
}

function getUsuarioId(req: AuthenticatedRequest): number | undefined {
    if (Object.prototype.hasOwnProperty.call(req.params, 'usuarioId')) {
        return parseIntParam(req.params.usuarioId);
    }

    if (typeof req.user?.id === 'number') {
        return req.user.id;
    }

    return undefined;
}

async function getProgress(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);
        const episodioId = parseIntParam(req.params.episodioId);

        if (usuarioId === undefined || episodioId === undefined) {
            res.status(400).json({
                message: 'usuarioId e episodioId são obrigatórios',
            });

            return;
        }

        if (!req.user) {
            res.status(401).json({
                message: 'Usuário não autenticado',
            });

            return;
        }

        if (req.user.id !== usuarioId && req.user.role !== 'ADMIN') {
            res.status(403).json({
                message: 'Acesso não autorizado',
            });

            return;
        }

        const progress = await watchProgressService.getProgress(
            usuarioId,
            episodioId
        );

        if (!progress) {
            res.status(200).json({
                usuarioId,
                episodioId,
                segundosAssistidos: 0,
                porcentagem: 0,
                assistido: false,
            });

            return;
        }

        res.status(200).json(progress);
    } catch (error) {
        console.error('Erro ao buscar progresso:', error);

        res.status(500).json({
            message: 'Erro ao buscar progresso',
        });
    }
}

async function updateProgress(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);
        const episodioId = parseIntParam(req.params.episodioId);

        if (usuarioId === undefined || episodioId === undefined) {
            res.status(400).json({
                message: 'usuarioId e episodioId são obrigatórios',
            });

            return;
        }

        const { segundosAssistidos, porcentagem, assistido } = req.body ?? {};

        const progress = await watchProgressService.updateProgress(
            usuarioId,
            episodioId,
            { segundosAssistidos, porcentagem, assistido }
        );

        res.status(200).json(progress);
    } catch (error) {
        console.error('Erro ao atualizar progresso:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'Erro ao atualizar progresso';

        res.status(400).json({ message });
    }
}

async function markAsCompleted(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);
        const episodioId = parseIntParam(req.params.episodioId);

        if (usuarioId === undefined || episodioId === undefined) {
            res.status(400).json({
                message: 'usuarioId e episodioId são obrigatórios',
            });

            return;
        }

        const progress = await watchProgressService.markAsCompleted(
            usuarioId,
            episodioId
        );

        res.status(200).json(progress);
    } catch (error) {
        console.error('Erro ao marcar episódio como assistido:', error);

        res.status(500).json({
            message: 'Erro ao marcar episódio como assistido',
        });
    }
}

export const watchProgressController = {
    getProgress,
    updateProgress,
    markAsCompleted,
};