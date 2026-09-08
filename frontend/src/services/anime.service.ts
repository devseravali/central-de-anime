import { api } from './api';

export interface AnimeData {
    titulo: string;
    tipo: string;
    temporada: number;
    ano: number;
    quantidadeEpisodios: number;
    franquiaId: number;
    estudioId: number;
    statusId: number;
    estacaoId: number;
    sinopse: string;
    capaUrl: string | null;
}

export const animeService = {
    listarAnimes: async () => {
        const response = await api.get('/animes');
        return response.data;
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