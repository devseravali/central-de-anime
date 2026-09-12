import { api } from './api';
import type { AnimeData } from '../types/AnimeData';

interface ListarAnimesParams {
    page?: number;
    perPage?: number;
}

export interface ListarAnimesResponse {
    items: AnimeData[];
    total: number;
    page: number;
    perPage: number;
}

export const animeService = {
    listarAnimes: async (
        params: ListarAnimesParams = {}
    ): Promise<ListarAnimesResponse> => {
        const response = await api.get('/animes', {
            params,
        });
        const payload = response.data;

        if (Array.isArray(payload)) {
            const page = params.page ?? 1;
            const perPage = params.perPage ?? payload.length;

            return {
                items: payload,
                total: payload.length,
                page,
                perPage,
            };
        }

        return {
            items: Array.isArray(payload?.items)
                ? payload.items
                : [],
            total:
                typeof payload?.total ===
                'number'
                    ? payload.total
                    : 0,
            page:
                typeof payload?.page ===
                'number'
                    ? payload.page
                    : params.page ?? 1,
            perPage:
                typeof payload?.perPage ===
                'number'
                    ? payload.perPage
                    : params.perPage ?? 20,
        };
    },

    buscarAnimes: async (query: string) => {
        const response = await api.get('/animes/search', {
            params: {
                query,
            },
        });

        return response.data;
    },

    buscarAnime: async (id: number) => {
        const response = await api.get(`/animes/${id}`);
        return response.data;
    },

    criarAnime: async (data: AnimeData) => {
        const response = await api.post('/animes', data);
        return response.data;
    },

    atualizarAnime: async (id: number, data: Partial<AnimeData>) => {
        const response = await api.put(`/animes/${id}`, data);
        return response.data;
    },

    excluirAnime: async (id: number) => {
        const response = await api.delete(`/animes/${id}`);
        return response.data;
    },
};