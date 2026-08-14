import type { Request, Response } from 'express';

import { episodioService } from '../services/episodioService';

function parseIntParam(value: unknown): number | undefined {
    if (typeof value !== 'string' || value.trim() === '') {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
}

async function list(req: Request, res: Response): Promise<void> {
    try {
        const temporadaId = parseIntParam(req.query.temporadaId);
        const animeId = parseIntParam(req.query.animeId);

        let episodios;

        if (temporadaId !== undefined) {
            episodios = await episodioService.listEpisodiosByTemporadaId(
                temporadaId
            );
        } else if (animeId !== undefined) {
            episodios = await episodioService.listEpisodiosByAnimeId(
                animeId
            );
        } else {
            episodios = await episodioService.listEpisodios();
        }

        res.status(200).json(episodios);
    } catch (error) {
        console.error('Erro ao listar episódios:', error);

        res.status(500).json({
            message: 'Erro ao listar episódios',
        });
    }
}

async function getById(req: Request, res: Response): Promise<void> {
    try {
        const episodioId = parseIntParam(req.params.id);

        if (episodioId === undefined) {
            res.status(400).json({
                message: 'ID de episódio inválido',
            });

            return;
        }

        const episodio = await episodioService.getEpisodioById(episodioId);

        if (!episodio) {
            res.status(404).json({
                message: 'Episódio não encontrado',
            });

            return;
        }

        res.status(200).json(episodio);
    } catch (error) {
        console.error('Erro ao buscar episódio por ID:', error);

        res.status(500).json({
            message: 'Erro ao buscar episódio',
        });
    }
}

export const episodioController = {
    list,
    getById,
};