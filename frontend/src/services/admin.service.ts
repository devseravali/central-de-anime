import { api } from './api';

export const adminService = {
    listarUsuarios: async () => {
        const response = await api.get('/users');
        return response.data;
    },

    promoverUsuario: async (id: number) => {
        const response = await api.post(`/users/${id}/promote`);
        return response.data;
    },

    banirUsuario: async (id: number) => {
        const response = await api.post(`/users/${id}/ban`);
        return response.data;
    },

    desbanirUsuario: async (id: number) => {
        const response = await api.post(`/users/${id}/unban`);
        return response.data;
    },

    excluirUsuario: async (id: number) => {
        const response = await api.delete(`/usuario/${id}`);
        return response.data;
    },
};