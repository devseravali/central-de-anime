import { api } from './api';

export const adminService = {
    listarUsuarios: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },

    promoverUsuario: async (id: number) => {
        const response = await api.post(`/admin/users/${id}/promote`);
        return response.data;
    },

    banirUsuario: async (id: number) => {
        const response = await api.post(`/admin/users/${id}/ban`);
        return response.data;
    },

    desbanirUsuario: async (id: number) => {
        const response = await api.post(`/admin/users/${id}/unban`);
        return response.data;
    },
    excluirUsuario: async (id: number) => {
        const response = await api.post(`/admin/users/${id}/delete`);
        return response.data;
    },
};