import { api } from './api';

export const sessionService = {
    listarSessoes: async (usuarioId: number) => {
        const response = await api.get('/auth/sessions', {
            params: {
                usuarioId,
            },
        });

        return response.data;
    },

    excluirSessao: async (id: number) => {
        const response = await api.delete(`/auth/sessions/${id}`);

        return response.data;
    },
};