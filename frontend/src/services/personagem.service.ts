import { api } from './api';
import type { Personagem } from '../types/Personagem';

export type { Personagem } from '../types/Personagem';

export const personagemService = {
    listarPersonagens: async (animeId?: number): Promise<Personagem[]> => {
        const response = await api.get<Personagem[]>('/personagens', {
            params: animeId ? { animeId } : undefined,
        });
        return response.data;
    },

    listarPersonagensPorId: async (id: number): Promise<Personagem> => {
        const response = await api.get<Personagem>(`/personagens/${id}`);
        return response.data;
    },
};