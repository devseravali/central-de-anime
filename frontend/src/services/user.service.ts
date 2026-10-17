import { api } from './api';

export interface AtualizaPerfilData {
    nome?: string;
    email?: string;
    senha?: string;
    avatar?: string | null;
}

export const userService = {
    buscarMeuPerfil: async () => {
        const response = await api.get('/usuario/me');
        return response.data;
    },

    atualizarMeuPerfil: async (data: AtualizaPerfilData) => {
        const response = await api.put('/usuario/me', data);
        return response.data;
    },

    listarUsuarios: async () => {
        const response = await api.get('/usuario');
        return response.data;
    },

    promoverUsuario: async (id: number) => {
        const response = await api.post('/usuario/promote', {
            usuarioId: id,
        });
        return response.data;
    },

    buscarRankingUsuario: async (id: number) => {
        const response = await api.get(`/usuario/${id}/ranking`);
        return response.data;
    },

    buscarUsuario: async (id: number) => {
        const response = await api.get(`/usuario/${id}`);
        return response.data;
    },

    atualizarUsuario: async (
        id: number,
        data: AtualizaPerfilData
    ) => {
        const response = await api.put(`/usuario/${id}`, data);
        return response.data;
    },

    excluirUsuario: async (id: number) => {
        const response = await api.delete(`/usuario/${id}`);
        return response.data;
    },
};