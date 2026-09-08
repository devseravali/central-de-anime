import { api } from './api';

export const favoritoService = {
    Favoritar: async (animeId: number) => {
        const response = await api.post(`/animes/${animeId}/favoritar`);
        return response.data;
    },

    Desfavoritar: async (animeId: number) => {
        const response = await api.post(`/animes/${animeId}/desfavoritar`);
        return response.data;
    },

    FavoritarPersonagem: async (personagemId: number) => {
        const response = await api.post(`/personagens/${personagemId}/favoritar`);
        return response.data;
    },

    DesfavoritarPersonagem: async (personagemId: number) => {
        const response = await api.post(`/personagens/${personagemId}/desfavoritar`);
        return response.data;
    },

    AnimesFavoritos: async (usuarioId: number) => {
        const response = await api.get(`/usuarios/${usuarioId}/favoritos/animes`);
        return response.data;
    },

    PersonagensFavoritos: async (usuarioId: number) => {
        const response = await api.get(`/usuarios/${usuarioId}/favoritos/personagens`);
        return response.data;
    }    
};