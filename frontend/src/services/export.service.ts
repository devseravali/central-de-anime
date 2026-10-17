import { api } from './api';

export const exportService = {
    exportarDados: async (id: number) => {
        const response = await api.get(`/export/usuarios/${id}`);
        return response.data;
    },

    animesBatch: async (ids: number[] = []) => {
        const response = await api.post('/animes/batch', { ids });
        return response.data;
    }
};