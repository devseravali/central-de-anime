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

async function listByAnimeId(req: Request, res: Response): Promise<void> {
    try {
        const animeIdParam = (req.params.animeId ?? req.params.id) as
            | string
            | undefined;

        const animeId =
            typeof animeIdParam === 'string' && animeIdParam.trim() !== ''
                ? Number.parseInt(animeIdParam, 10)
                : NaN;

        if (Number.isNaN(animeId)) {
            res.status(400).json({ message: 'animeId inválido' });

            return;
        }

        const personagens = await personagemService.listPersonagensByAnimeId(
            animeId
        );

        res.status(200).json(personagens);
    } catch (error) {
        console.error('Erro ao listar personagens por anime:', error);

        res.status(500).json({ message: 'Erro ao listar personagens' });
    }
}

async function getById(req: Request, res: Response): Promise<void> {
    try {
        const idParam = req.params.id as string | undefined;

        if (!idParam || idParam.trim() === '') {
            res.status(400).json({ message: 'id inválido' });

            return;
        }

        const id = Number.parseInt(idParam, 10);

        if (Number.isNaN(id)) {
            res.status(400).json({ message: 'id inválido' });

            return;
        }

        const personagem = await personagemService.getPersonagemById(id);

        if (!personagem) {
            res.status(404).json({ message: 'Personagem não encontrado' });

            return;
        }

        res.status(200).json(personagem);
    } catch (error) {
        console.error('Erro ao buscar personagem por id:', error);

        res.status(500).json({ message: 'Erro ao buscar personagem' });
    }
}

export const personagemController = {
    list,
    listByAnimeId,
    getById,
};
