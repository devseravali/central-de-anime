import type { Request, Response } from 'express';

import { rankingService } from '../services/rankingService';

interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
    };
}

function parseIntParam(value: unknown): number | undefined {
    if (typeof value !== 'string' || value.trim() === '') {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
}

function getUsuarioId(req: AuthenticatedRequest): number | undefined {
    const fromParams = parseIntParam(req.params.usuarioId);

    if (fromParams !== undefined) {
        return fromParams;
    }

    if (typeof req.user?.id === 'number') {
        return req.user.id;
    }

    return undefined;
}

async function getByUsuarioId(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);

        if (usuarioId === undefined) {
            res.status(400).json({
                message: 'usuarioId é obrigatório',
            });

            return;
        }

        const ranking = await rankingService.getRankingByUsuarioId(
            usuarioId
        );

        if (!ranking) {
            res.status(404).json({
                message: 'Ranking não encontrado para este usuário',
            });

            return;
        }

        res.status(200).json(ranking);
    } catch (error) {
        console.error('Erro ao buscar ranking:', error);

        res.status(500).json({
            message: 'Erro ao buscar ranking',
        });
    }
}

async function getPontos(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);

        if (usuarioId === undefined) {
            res.status(400).json({
                message: 'usuarioId é obrigatório',
            });

            return;
        }

        const pontos = await rankingService.calcularPontos(usuarioId);

        res.status(200).json({ usuarioId, pontos });
    } catch (error) {
        console.error('Erro ao calcular pontos:', error);

        res.status(500).json({
            message: 'Erro ao calcular pontos',
        });
    }
}

async function atualizar(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);

        if (usuarioId === undefined) {
            res.status(400).json({
                message: 'usuarioId é obrigatório',
            });

            return;
        }

        const ranking = await rankingService.atualizarRanking(usuarioId);

        res.status(200).json(ranking);
    } catch (error) {
        console.error('Erro ao atualizar ranking:', error);

        res.status(500).json({
            message: 'Erro ao atualizar ranking',
        });
    }
}

async function recalcular(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);

        if (usuarioId === undefined) {
            res.status(400).json({
                message: 'usuarioId é obrigatório',
            });

            return;
        }

        const ranking = await rankingService.recalcularRanking(usuarioId);

        res.status(200).json(ranking);
    } catch (error) {
        console.error('Erro ao recalcular ranking:', error);

        res.status(500).json({
            message: 'Erro ao recalcular ranking',
        });
    }
}

export const rankingController = {
    getByUsuarioId,
    getPontos,
    atualizar,
    recalcular,
};