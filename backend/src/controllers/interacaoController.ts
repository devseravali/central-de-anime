import type { Request, Response } from 'express';

import { interacaoService } from '../services/interacaoService';

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
    if (typeof req.user?.id === 'number') {
        return req.user.id;
    }

    return parseIntParam(req.body?.usuarioId);
}

async function favoritarAnime(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);
        const animeId = parseIntParam(req.params.animeId);

        if (usuarioId === undefined || animeId === undefined) {
            res.status(400).json({
                message: 'usuarioId e animeId são obrigatórios',
            });

            return;
        }

        await interacaoService.favoritarAnime(usuarioId, animeId);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao favoritar anime:', error);

        res.status(500).json({
            message: 'Erro ao favoritar anime',
        });
    }
}

async function desfavoritarAnime(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);
        const animeId = parseIntParam(req.params.animeId);

        if (usuarioId === undefined || animeId === undefined) {
            res.status(400).json({
                message: 'usuarioId e animeId são obrigatórios',
            });

            return;
        }

        await interacaoService.desfavoritarAnime(usuarioId, animeId);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao desfavoritar anime:', error);

        res.status(500).json({
            message: 'Erro ao desfavoritar anime',
        });
    }
}

async function favoritarPersonagem(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);
        const personagemId = parseIntParam(req.params.personagemId);

        if (usuarioId === undefined || personagemId === undefined) {
            res.status(400).json({
                message: 'usuarioId e personagemId são obrigatórios',
            });

            return;
        }

        await interacaoService.favoritarPersonagem(usuarioId, personagemId);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao favoritar personagem:', error);

        res.status(500).json({
            message: 'Erro ao favoritar personagem',
        });
    }
}

async function desfavoritarPersonagem(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);
        const personagemId = parseIntParam(req.params.personagemId);

        if (usuarioId === undefined || personagemId === undefined) {
            res.status(400).json({
                message: 'usuarioId e personagemId são obrigatórios',
            });

            return;
        }

        await interacaoService.desfavoritarPersonagem(
            usuarioId,
            personagemId
        );

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao desfavoritar personagem:', error);

        res.status(500).json({
            message: 'Erro ao desfavoritar personagem',
        });
    }
}

async function darNota(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);
        const animeId = parseIntParam(req.params.animeId);
        const nota = Number(req.body?.nota);

        if (
            usuarioId === undefined ||
            animeId === undefined ||
            Number.isNaN(nota)
        ) {
            res.status(400).json({
                message: 'usuarioId, animeId e nota são obrigatórios',
            });

            return;
        }

        await interacaoService.darNota(usuarioId, animeId, nota);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao dar nota ao anime:', error);

        const message =
            error instanceof Error ? error.message : 'Erro ao dar nota';

        res.status(400).json({ message });
    }
}

async function removerNota(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);
        const animeId = parseIntParam(req.params.animeId);

        if (usuarioId === undefined || animeId === undefined) {
            res.status(400).json({
                message: 'usuarioId e animeId são obrigatórios',
            });

            return;
        }

        await interacaoService.removerNota(usuarioId, animeId);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao remover nota do anime:', error);

        res.status(500).json({
            message: 'Erro ao remover nota',
        });
    }
}

export const interacaoController = {
    favoritarAnime,
    desfavoritarAnime,
    favoritarPersonagem,
    desfavoritarPersonagem,
    darNota,
    removerNota,
};