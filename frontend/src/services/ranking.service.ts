import { api } from './api';
import type { RankingTopItem } from '../types/ranking';

export interface RankingUsuarioResponse {
    id: number;
    usuarioId: number;
    pontos: number;
    nivel: number;
    totalEpisodiosAssistidos: number;
    atualizadoEm: string;
}

export interface RankingPontosResponse {
    usuarioId: number;
    pontos: number;
}

export const rankingService = {
    UsuariosId: async (usuarioId: number): Promise<RankingUsuarioResponse> => {
        const response = await api.get<RankingUsuarioResponse>(`/ranking/${usuarioId}`);
        return response.data;
    },

    Pontos: async (usuarioId: number): Promise<RankingPontosResponse> => {
        const response = await api.get<RankingPontosResponse>(`/ranking/${usuarioId}/pontos`);
        return response.data;
    },

    atualizarPontos: async (usuarioId: number, pontos: number): Promise<RankingUsuarioResponse> => {
        const response = await api.post<RankingUsuarioResponse>(`/ranking/${usuarioId}/atualizar`, { pontos });
        return response.data;
    },

    recalcularPontos: async (usuarioId: number): Promise<RankingUsuarioResponse> => {
        const response = await api.post<RankingUsuarioResponse>(`/ranking/${usuarioId}/recalcular`);
        return response.data;
    },

    rankingTop: async (): Promise<RankingTopItem[]> => {
        const response = await api.get<RankingTopItem[]>(`/ranking/top`);
        return response.data;
    },
};