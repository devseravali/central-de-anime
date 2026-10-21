import type { Request, Response } from 'express';

import { rankingService } from '../services/rankingService';

async function getTopAnimes(
    _req: Request,
    res: Response
): Promise<void> {
    try {
        const top = await rankingService.getTopAnimes();
        res.status(200).json(top);
    } catch (error) {
        console.error('Erro ao buscar ranking de animes:', error);
        res.status(500).json({ message: 'Erro ao buscar ranking de animes' });
    }
}

async function getTopPersonagens(
    _req: Request,
    res: Response
): Promise<void> {
    try {
        const top = await rankingService.getTopPersonagens();
        res.status(200).json(top);
    } catch (error) {
        console.error('Erro ao buscar ranking de personagens:', error);
        res.status(500).json({ message: 'Erro ao buscar ranking de personagens' });
    }
}

export const rankingController = {
    getTopAnimes,
    getTopPersonagens,
};
