import type { Request, Response } from 'express';

import { episodioService } from '../services/episodioService';
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
        const temporadaIdParam = (req.params.temporadaId ?? req.query.temporadaId) as
            | string
            | undefined;

        const animeIdParam = (req.params.id ?? req.query.animeId) as
            | string
            | undefined;

        const temporadaId = parseIntParam(temporadaIdParam);
        const animeId = parseIntParam(animeIdParam);

        let episodios;

        if (temporadaId !== undefined) {
            const temporada = await temporadaService.getTemporadaById(
                temporadaId
            );

            if (!temporada) {
                res.status(404).json({ message: 'Temporada não encontrada' });

                return;
            }

            episodios = await episodioService.listEpisodiosByTemporadaId(
                temporadaId,
                animeId
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
    // new handler
    listByAnimeAndSeasonNumber: async function listByAnimeAndSeasonNumber(req: Request, res: Response): Promise<void> {
        try {
            const animeId = parseIntParam(req.params.id);
            const seasonNumber = parseIntParam(req.params.seasonNumber);

            if (animeId === undefined || seasonNumber === undefined) {
                res.status(400).json({ message: 'animeId e seasonNumber são obrigatórios' });

                return;
            }

            const temporada = await temporadaService.findTemporadaByAnimeAndSeasonNumber(
                animeId,
                seasonNumber
            );

            if (!temporada) {
                res.status(404).json({ message: 'Temporada não encontrada para esse número' });

                return;
            }

            const episodios = await episodioService.listEpisodiosByTemporadaId(
                temporada.id,
                animeId
            );

            res.status(200).json(episodios);
        } catch (error) {
            console.error('Erro ao listar episódios por número de temporada:', error);

            res.status(500).json({ message: 'Erro ao listar episódios' });
        }
    },
};