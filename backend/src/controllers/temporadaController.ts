import type { Request, Response } from 'express';

import { temporadaService } from '../services/temporadaService';

function parseIntParam(value: unknown): number | undefined {
    if (typeof value !== 'string' || value.trim() === '') {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
}

async function list(req: Request, res: Response): Promise<void> {
    try {
        const temporadas = await temporadaService.listTemporadas();

        res.status(200).json(temporadas);
    } catch (error) {
        console.error('Erro ao listar temporadas:', error);

        res.status(500).json({
            message: 'Erro ao listar temporadas',
        });
    }
}

async function getById(req: Request, res: Response): Promise<void> {
    try {
        const temporadaId = parseIntParam(req.params.id);

        if (temporadaId === undefined) {
            res.status(400).json({
                message: 'ID de temporada inválido',
            });

            return;
        }

        const temporada = await temporadaService.getTemporadaById(
            temporadaId
        );

        if (!temporada) {
            res.status(404).json({
                message: 'Temporada não encontrada',
            });

            return;
        }

        res.status(200).json(temporada);
    } catch (error) {
        console.error('Erro ao buscar temporada por ID:', error);

        res.status(500).json({
            message: 'Erro ao buscar temporada',
        });
    }
}

export const temporadaController = {
    list,
    getById,
};