import type { Request, Response } from 'express';

import { animeService } from '../services/animeService';

function parseIntParam(value: unknown): number | undefined {
    if (typeof value !== 'string' || value.trim() === '') {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
}

async function list(req: Request, res: Response): Promise<void> {
    try {
        const { page, perPage, titulo, generoId, statusId } = req.query;

        const result = await animeService.listAnimes({
            page: parseIntParam(page),
            perPage: parseIntParam(perPage),
            titulo: typeof titulo === 'string' ? titulo : undefined,
            generoId: parseIntParam(generoId),
            statusId: parseIntParam(statusId),
        });

        res.status(200).json(result);
    } catch (error) {
        console.error('Erro ao listar animes:', error);

        res.status(500).json({
            message: 'Erro ao listar animes',
        });
    }
}

async function getById(req: Request, res: Response): Promise<void> {
    try {
        const animeId = parseIntParam(req.params.id);

        if (animeId === undefined) {
            res.status(400).json({
                message: 'ID de anime inválido',
            });

            return;
        }

        const includeRelations = req.query.relations === 'true';

        const anime = includeRelations
            ? await animeService.getAnimeWithCache(animeId)
            : await animeService.getAnimeById(animeId);

        if (!anime) {
            res.status(404).json({
                message: 'Anime não encontrado',
            });

            return;
        }

        res.status(200).json(anime);
    } catch (error) {
        console.error('Erro ao buscar anime por ID:', error);

        res.status(500).json({
            message: 'Erro ao buscar anime',
        });
    }
}

async function search(req: Request, res: Response): Promise<void> {
    try {
        const { q, limit, page } = req.query;

        if (typeof q !== 'string' || q.trim() === '') {
            const listResult = await animeService.listAnimes({
                page: parseIntParam(page),
                perPage: parseIntParam(limit),
            });

            res.status(200).json(listResult);
            return;
        }

        const result = await animeService.searchAnimes(
            q,
            parseIntParam(limit),
            parseIntParam(page)
        );

        const safeResult = {
            items: Array.isArray(result?.items) ? result.items : [],
            total: typeof result?.total === 'number' ? result.total : 0,
            page: typeof result?.page === 'number' ? result.page : parseIntParam(page) ?? 1,
            perPage: typeof result?.perPage === 'number' ? result.perPage : parseIntParam(limit) ?? 20,
        };

        res.status(200).json(safeResult);
    } catch (error) {
        console.error('Erro ao buscar animes:', error);

        res.status(500).json({
            message: 'Erro ao buscar animes',
        });
    }
}

async function update(req: Request, res: Response): Promise<void> {
    try {
        const animeId = parseIntParam(req.params.id);

        if (animeId === undefined) {
            res.status(400).json({
                message: 'ID de anime inválido',
            });

            return;
        }

        const updated = await animeService.updateAnime(animeId, req.body);

        res.status(200).json(updated);
    } catch (error) {
        console.error('Erro ao atualizar anime:', error);

        const message =
            error instanceof Error ? error.message : 'Erro ao atualizar anime';

        res.status(400).json({ message });
    }
}

async function remove(req: Request, res: Response): Promise<void> {
    try {
        const animeId = parseIntParam(req.params.id);

        if (animeId === undefined) {
            res.status(400).json({
                message: 'ID de anime inválido',
            });

            return;
        }

        await animeService.deleteAnime(animeId);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao deletar anime:', error);

        const message =
            error instanceof Error ? error.message : 'Erro ao deletar anime';

        res.status(400).json({ message });
    }
}

export const animeController = {
    list,
    getById,
    search,
    update,
    remove,
};