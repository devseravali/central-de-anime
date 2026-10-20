import { api } from './api';
import type { Personagem } from './personagem.service';

interface FavoritoAnimeEstudio {
    id: number;
    nome: string;
}

interface FavoritoAnimeStatus {
    id: number;
    nome: string;
}

export interface FavoritoAnime {
    id: number;
    titulo: string;
    tipo: string;
    temporada: number | null;
    ano: number | null;
    sinopse: string | null;
    capaUrl: string | null;
    quantidadeEpisodios: number | null;
    estudio: FavoritoAnimeEstudio | null;
    status: FavoritoAnimeStatus | null;
}

export const favoritoService = {
    Favoritar: async (animeId: number): Promise<void> => {
        const response = await api.post<void>(`/animes/${animeId}/favoritar`);
        return response.data;
    },

    Desfavoritar: async (animeId: number): Promise<void> => {
        const response = await api.post<void>(`/animes/${animeId}/desfavoritar`);
        return response.data;
    },

    FavoritarPersonagem: async (personagemId: number): Promise<void> => {
        const response = await api.post<void>(`/personagens/${personagemId}/favoritar`);
        return response.data;
    },

    DesfavoritarPersonagem: async (personagemId: number): Promise<void> => {
        const response = await api.post<void>(`/personagens/${personagemId}/desfavoritar`);
        return response.data;
    },

    AnimesFavoritos: async (usuarioId: number): Promise<FavoritoAnime[]> => {
        const response = await api.get<FavoritoAnime[]>(`/usuarios/${usuarioId}/favoritos/animes`);
        return response.data;
    },

    PersonagensFavoritos: async (usuarioId: number): Promise<Personagem[]> => {
        const response = await api.get<Personagem[]>(`/usuarios/${usuarioId}/favoritos/personagens`);
        return response.data;
    }    
};