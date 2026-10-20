import { api } from './api';
import type { UsuarioPerfil, UsuarioPromocaoResponse } from './user.service';

interface MensagemResposta {
    message: string;
}

type AdminListUsersResponse =
    | { message: string }
    | { users: UsuarioPerfil[] };

export const adminService = {
    listarUsuarios: async (): Promise<AdminListUsersResponse> => {
        const response = await api.get<AdminListUsersResponse>('/users');
        return response.data;
    },

    promoverUsuario: async (id: number): Promise<UsuarioPromocaoResponse> => {
        const response = await api.post<UsuarioPromocaoResponse>(`/users/${id}/promote`);
        return response.data;
    },

    banirUsuario: async (id: number): Promise<UsuarioPerfil> => {
        const response = await api.post<UsuarioPerfil>(`/users/${id}/ban`);
        return response.data;
    },

    desbanirUsuario: async (id: number): Promise<UsuarioPerfil> => {
        const response = await api.post<UsuarioPerfil>(`/users/${id}/unban`);
        return response.data;
    },

    excluirUsuario: async (id: number): Promise<void | MensagemResposta> => {
        const response = await api.delete<void | MensagemResposta>(`/usuario/${id}`);
        return response.data;
    },
};