import { api } from './api';

export interface AtualizaPerfilData {
    nome?: string;
    email?: string;
    senha?: string;
    avatar?: string | null;
}

export interface UsuarioPerfil {
    id: number;
    nome: string;
    email: string;
    avatar: string | null;
    status: string;
    criadoEm?: string;
    atualizadoEm?: string;
}

export interface UsuarioListResponse {
    users: UsuarioPerfil[];
}

export interface UsuarioProfileResponse {
    message: string;
    usuario: UsuarioPerfil;
}

export interface UsuarioByIdResponse {
    message: string;
    user: UsuarioPerfil;
}

export interface UsuarioPromocaoResponse {
    message: string;
    usuarioId: number;
    nivel?: string;
}

export interface UsuarioRankingResponse {
    message: string;
    ranking: {
        id: number;
        usuarioId: number;
        pontos: number;
        nivel: number;
        totalEpisodiosAssistidos: number;
        atualizadoEm: string;
    };
}

export const userService = {
    buscarMeuPerfil: async (): Promise<UsuarioProfileResponse> => {
        const response = await api.get<UsuarioProfileResponse>('/usuario/me');
        return response.data;
    },

    atualizarMeuPerfil: async (data: AtualizaPerfilData): Promise<UsuarioProfileResponse> => {
        const response = await api.put<UsuarioProfileResponse>('/usuario/me', data);
        return response.data;
    },

    listarUsuarios: async (): Promise<UsuarioListResponse> => {
        const response = await api.get<UsuarioListResponse>('/usuario');
        return response.data;
    },

    promoverUsuario: async (id: number): Promise<UsuarioPromocaoResponse> => {
        const response = await api.post<UsuarioPromocaoResponse>('/usuario/promote', {
            usuarioId: id,
        });
        return response.data;
    },

    buscarRankingUsuario: async (id: number): Promise<UsuarioRankingResponse> => {
        const response = await api.get<UsuarioRankingResponse>(`/usuario/${id}/ranking`);
        return response.data;
    },

    buscarUsuario: async (id: number): Promise<UsuarioByIdResponse> => {
        const response = await api.get<UsuarioByIdResponse>(`/usuario/${id}`);
        return response.data;
    },

    atualizarUsuario: async (
        id: number,
        data: AtualizaPerfilData
    ): Promise<UsuarioProfileResponse> => {
        const response = await api.put<UsuarioProfileResponse>(`/usuario/${id}`, data);
        return response.data;
    },

    excluirUsuario: async (id: number): Promise<void> => {
        const response = await api.delete<void>(`/usuario/${id}`);
        return response.data;
    },
};