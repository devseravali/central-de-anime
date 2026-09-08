import { api } from './api';

export const temporadaService = {
    listarTemporadas: async () => {
        const response = await api.get('/seasons');
        return response.data;
    },

    buscarTemporada: async (id: number) => {
        const response = await api.get(`/seasons/${id}`);
        return response.data;
    },

    listarTemporadasPorAnime: async (animeId: number) => {
        const response = await api.get(`/animes/${animeId}/temporadas`);
        return response.data;
    },
};