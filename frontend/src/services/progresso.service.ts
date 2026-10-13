import { api } from './api';

export const progressoService = {
    obterProgresso: async (usuarioId: number, episodioId: number) => {
        const response = await api.get(`/usuarios/${usuarioId}/episodios/${episodioId}/progresso`);
        return response.data;
    },

    atualizarProgresso: async (episodioId: number, porcentagem: number) => {
        const response = await api.put(`/episodios/${episodioId}/progresso`, {
            porcentagem,
            assistido: porcentagem >= 100,
        });
        return response.data;
    },

    concluirEpisodio: async (episodioId: number) => {
        const response = await api.post(`/episodios/${episodioId}/concluir`);
        return response.data;
    },
    obterProgressosUsuario: async (usuarioId: number) => {
        const response = await api.get(`/usuarios/${usuarioId}/progressos`);
        return response.data;
    },
    deleteProgressoUsuario: async (usuarioId: number) => {
        const response = await api.delete(`/usuarios/${usuarioId}/progressos`);
        return response.data;
    }
};