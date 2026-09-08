import { api } from './api';

export const avaliacaoService = {
    AvaliarAnime: async (animeId: number, nota: number) => {
        const response = await api.post(`/animes/${animeId}/nota`, { nota });
        return response.data;
    },

   DeletarAvaliacaoAnime: async (animeId: number) => {
       const response = await api.delete(`/animes/${animeId}/nota`);
       return response.data;
   },

   AvaliacoesAnimes: async (animeId: number) => {
       const response = await api.get(`/animes/${animeId}/avaliacoes`);
       return response.data;
   },

   AvaliacoesUsuarios: async (usuarioId: number) => {
       const response = await api.get(`/usuarios/${usuarioId}/avaliacoes`);
       return response.data;
   }
};