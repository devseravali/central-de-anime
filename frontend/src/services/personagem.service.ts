import { api } from './api';
import type { Personagem } from '../types/Personagem';

export type { Personagem } from '../types/Personagem';

export const personagemService = {
    listarPersonagens: async (
        animeId?: number | string,
        urlBase = '/personagens'
    ): Promise<Personagem[]> => {
        const response = await api.get<Personagem[]>(urlBase, {
            params: animeId !== undefined ? { animeId } : undefined,
        });
        return response.data;
    },

    listarPersonagensPorUrl: async (url: string): Promise<Personagem[]> => {
        const response = await api.get<Personagem[]>(url);
        return response.data;
    },

    listarPersonagensPorId: async (
        id: number | string,
        urlBase = '/personagens'
    ): Promise<Personagem> => {
        const endpoint = `${urlBase.replace(/\/$/, '')}/${encodeURIComponent(String(id))}`;
        const response = await api.get<Personagem>(endpoint);
        return response.data;
    },

    buscarPersonagemPorUrl: async (url: string): Promise<Personagem> => {
        const response = await api.get<Personagem>(url);
        return response.data;
    },
};