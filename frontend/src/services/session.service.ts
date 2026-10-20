import { api } from './api';

export interface SessaoAtiva {
    id: number;
    usuarioId: number;
    dispositivo?: string | null;
    ip?: string | null;
    userAgent?: string | null;
    expiraEm?: string;
    revogadoEm?: string | null;
    criadoEm?: string;
    atualizadoEm?: string;
}

export interface SessoesResponse {
    message: string;
    sessions: SessaoAtiva[];
}

export const sessionService = {
    listarSessoes: async (usuarioId: number): Promise<SessoesResponse> => {
        const response = await api.get<SessoesResponse>('/auth/sessions', {
            params: {
                usuarioId,
            },
        });

        return response.data;
    },

    excluirSessao: async (id: number): Promise<void> => {
        const response = await api.delete<void>(`/auth/sessions/${id}`);

        return response.data;
    },
};