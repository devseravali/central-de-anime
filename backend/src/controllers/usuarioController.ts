import type { Request, Response } from 'express';
import { usuarioService } from '../services/usuarioService';

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
    const fromParams = parseIntParam(req.params.id);

    if (fromParams !== undefined) {
        return fromParams;
    }

    if (typeof req.user?.id === 'number') {
        return req.user.id;
    }

    return undefined;
}

async function getProfile(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);

        if (usuarioId === undefined) {
            res.status(400).json({
                message: 'ID de usuário inválido',
            });

            return;
        }

        const usuario = await usuarioService.getProfile(usuarioId);

        if (!usuario) {
            res.status(404).json({
                message: 'Usuário não encontrado',
            });

            return;
        }

        res.status(200).json(usuario);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);

        res.status(500).json({
            message: 'Erro ao buscar perfil',
        });
    }
}

async function updateProfile(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);

        if (usuarioId === undefined) {
            res.status(400).json({
                message: 'ID de usuário inválido',
            });

            return;
        }

        const { nome, email, senha, avatar, status } = req.body ?? {};

        const usuario = await usuarioService.updateProfile(usuarioId, {
            nome,
            email,
            senha,
            avatar,
            status,
        });

        res.status(200).json(usuario);
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'Erro ao atualizar perfil';

        if (message === 'Usuário não encontrado') {
            res.status(404).json({ message });
            return;
        }

        if (message === 'Email já em uso') {
            res.status(409).json({ message });
            return;
        }

        res.status(400).json({ message });
    }
}

async function promoteToAdmin(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const bodyId = typeof req.body?.usuarioId === 'number' ? req.body.usuarioId : undefined;
        const usuarioId = bodyId ?? getUsuarioId(req);

        if (usuarioId === undefined) {
            res.status(400).json({ message: 'ID de usuário inválido' });
            return;
        }

        const nivel = typeof req.body?.nivel === 'string' ? req.body.nivel : undefined;

        await usuarioService.promoteToAdmin(usuarioId, nivel);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao promover usuário:', error);

        const message = error instanceof Error ? error.message : 'Erro ao promover usuário';

        if (message === 'Usuário não encontrado') {
            res.status(404).json({ message });
            return;
        }

        res.status(400).json({ message });
    }
}

async function ranking(
    req: AuthenticatedRequest,
    res: Response
): Promise<void> {
    try {
        const usuarioId = getUsuarioId(req);

        if (usuarioId === undefined) {
            res.status(400).json({ message: 'ID de usuário inválido' });
            return;
        }

        const { rankingService } = await import('../services/rankingService');

        const rankingData = await rankingService.getRankingByUsuarioId(usuarioId);

        if (!rankingData) {
            res.status(404).json({ message: 'Ranking não encontrado' });
            return;
        }

        res.status(200).json(rankingData);
    } catch (error) {
        console.error('Erro ao buscar ranking do usuário:', error);
        res.status(500).json({ message: 'Erro ao buscar ranking' });
    }
}

export const usuarioController = {
    getProfile,
    updateProfile,
    promoteToAdmin,
    ranking,
};