import type { Request, Response } from 'express';

import { personagemService } from '../services/personagemService';

function parseIntParam(value: unknown): number | undefined {
    if (typeof value !== 'string' || value.trim() === '') {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
}

async function list(req: Request, res: Response): Promise<void> {
    try {
        const animeId = parseIntParam(req.query.animeId);

        const personagens =
            animeId !== undefined
                ? await personagemService.listPersonagensByAnimeId(animeId)
                : await personagemService.listPersonagens();

        res.status(200).json(personagens);
    } catch (error) {
        console.error('Erro ao listar personagens:', error);

        res.status(500).json({
            message: 'Erro ao listar personagens',
        });
    }
}

export const personagemController = {
    list,
};