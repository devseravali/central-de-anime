import { api } from './api';
import type { AnimeData } from '../types/AnimeData';
import type { UsuarioPerfil } from './user.service';

export interface ExportUsuarioResponse {
    usuario: UsuarioPerfil;
}

export interface BatchLookupResponse {
    animesFound: number;
    animes: Array<Pick<AnimeData, 'id' | 'titulo'>>;
}

export interface BatchUpsertResponse {
    created: number;
    updated: number;
    errors: number;
}

export const exportService = {
    exportarDados: async (id: number): Promise<ExportUsuarioResponse> => {
        const response = await api.get<ExportUsuarioResponse>(`/export/usuarios/${id}`);
        return response.data;
    },

    animesBatch: async (
        ids: number[] = []
    ): Promise<BatchLookupResponse | BatchUpsertResponse> => {
        const response = await api.post<BatchLookupResponse | BatchUpsertResponse>('/animes/batch', { ids });
        return response.data;
    }
};