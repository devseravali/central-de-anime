import { api } from './api';

interface AvaliacaoUsuarioResumo {
    id: number;
    nome: string;
    avatar: string | null;
}

interface AvaliacaoAnimeResumo {
    id: number;
    titulo: string;
    capaUrl: string | null;
}

export interface AvaliacaoAnimeItem {
    usuario: AvaliacaoUsuarioResumo;
    nota: number;
}

export interface AvaliacaoUsuarioItem {
    anime: AvaliacaoAnimeResumo;
    nota: number;
}

export const avaliacaoService = {
    AvaliarAnime: async (animeId: number, nota: number): Promise<void> => {
        const response = await api.post<void>(`/animes/${animeId}/nota`, { nota });
        return response.data;
    },

   DeletarAvaliacaoAnime: async (animeId: number): Promise<void> => {
       const response = await api.delete<void>(`/animes/${animeId}/nota`);
       return response.data;
   },

   AvaliacoesAnimes: async (animeId: number): Promise<AvaliacaoAnimeItem[]> => {
       const response = await api.get<AvaliacaoAnimeItem[]>(`/animes/${animeId}/avaliacoes`);
       return response.data;
   },

   AvaliacoesUsuarios: async (usuarioId: number): Promise<AvaliacaoUsuarioItem[]> => {
       const response = await api.get<AvaliacaoUsuarioItem[]>(`/usuarios/${usuarioId}/avaliacoes`);
       return response.data;
   }
};