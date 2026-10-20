import { api } from './api';
import type { Episodio } from '../types/Episodio';

export const episodioService = {
    listarEpisodios: async (): Promise<Episodio[]> => {
        const response = await api.get<Episodio[]>('/episodios');

        return response.data;
    },

    listarEpisodiosPorId: async (id: number): Promise<Episodio> => {
        const response = await api.get<Episodio>(`/episodios/${id}`);

        return response.data;
    },

    listarEpisodiosPorAnime: async (id: number): Promise<Episodio[]> => {
        const response = await api.get<Episodio[]>(
            `/animes/${id}/episodios`
        );

        return response.data;
    },
};