import { api } from './api';

export const episodioService = {
    listarEpisodios: async () => {
        const response = await api.get('/episodios');

        return response.data;
    },

    listarEpisodiosPorId: async (id: number) => {
        const response = await api.get(`/episodios/${id}`);

        return response.data;
    },

    listarEpisodiosPorAnime: async (id: number) => {
        const response = await api.get(
            `animes/${id}/episodios`
        );

        return response.data;
    },
};