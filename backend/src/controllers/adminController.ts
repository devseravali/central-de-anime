import type { Request, Response } from 'express';

import { usuarioService } from '../services/usuarioService';

function parseIntParam(value: unknown): number | undefined {
    if (typeof value !== 'string' || value.trim() === '') {
        return undefined;
    }

    const parsed = Number.parseInt(value, 10);

    return Number.isNaN(parsed) ? undefined : parsed;
}

async function listUsers(_req: Request, res: Response): Promise<void> {
    res.status(501).json({
        message: 'Not implemented: falta um método de listagem no UsuarioService',
    });
}

async function banUser(req: Request, res: Response): Promise<void> {
    try {
        const usuarioId = parseIntParam(req.params.id);

        if (usuarioId === undefined) {
            res.status(400).json({
                message: 'ID de usuário inválido',
            });

            return;
        }

        const usuario = await usuarioService.updateProfile(usuarioId, {
            status: 'banido',
        });

        res.status(200).json(usuario);
    } catch (error) {
        console.error('Erro ao banir usuário:', error);

        const message =
            error instanceof Error ? error.message : 'Erro ao banir usuário';

        res.status(400).json({ message });
    }
}

async function unbanUser(req: Request, res: Response): Promise<void> {
    try {
        const usuarioId = parseIntParam(req.params.id);

        if (usuarioId === undefined) {
            res.status(400).json({
                message: 'ID de usuário inválido',
            });

            return;
        }

        const usuario = await usuarioService.updateProfile(usuarioId, {
            status: 'ativo',
        });

        res.status(200).json(usuario);
    } catch (error) {
        console.error('Erro ao desbanir usuário:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'Erro ao desbanir usuário';

        res.status(400).json({ message });
    }
}

async function promoteUser(req: Request, res: Response): Promise<void> {
    try {
        const usuarioId = parseIntParam(req.params.id);

        if (usuarioId === undefined) {
            res.status(400).json({
                message: 'ID de usuário inválido',
            });

            return;
        }

        const nivel =
            typeof req.body?.nivel === 'string' ? req.body.nivel : undefined;

        await usuarioService.promoteToAdmin(usuarioId, nivel);

        res.status(204).send();
    } catch (error) {
        console.error('Erro ao promover usuário:', error);

        const message =
            error instanceof Error
                ? error.message
                : 'Erro ao promover usuário';

        res.status(400).json({ message });
    }
}

export const adminController = {
    listUsers,
    banUser,
    unbanUser,
    promoteUser,
};