import { api } from './api';

export const rankingService = {
    UsuariosId: async (usuarioId: number) => {
        const response = await api.get(`/ranking/usuario/${usuarioId}`);
        return response.data;
    },

    Pontos: async (usuarioId: number) => {
        const response = await api.get(`/ranking/${usuarioId}/pontos`);
        return response.data;
    },

    atualizarPontos: async (usuarioId: number, pontos: number) => {
        const response = await api.put(`/ranking/${usuarioId}/atualizar`, { pontos });
        return response.data;
    },

    recalcularPontos: async (usuarioId: number) => {
        const response = await api.put(`/ranking/${usuarioId}/recalcular`);
        return response.data;
    },

    rakingTop: async () => {
        const response = await api.get(`/ranking/top`);
        return response.data;
    },
};