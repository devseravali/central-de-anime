import { api } from './api';

export const exportService = {
    exportarDados: async (id: number) => {
        const response = await api.get(`/export/usuarios/${id}`);
        return response.data;
    },

    animesBatch: async () => {
        const response = await api.get('/animes/batch');
        return response.data;
    }
};