import { api } from './api';

interface AnimeResumoProgresso {
    id?: number;
    titulo?: string;
}

interface EpisodioResumoProgresso {
    id?: number;
    animeId?: number;
    titulo?: string;
    numero?: number;
    anime?: AnimeResumoProgresso;
}

export interface ProgressoEpisodio {
    usuarioId: number;
    episodioId: number;
    segundosAssistidos: number;
    porcentagem: number;
    assistido: boolean;
    atualizadoEm?: string;
    episodio?: EpisodioResumoProgresso;
}

export const progressoService = {
    obterProgresso: async (usuarioId: number, episodioId: number): Promise<ProgressoEpisodio> => {
        const response = await api.get<ProgressoEpisodio>(`/usuarios/${usuarioId}/episodios/${episodioId}/progresso`);
        return response.data;
    },

    atualizarProgresso: async (episodioId: number, porcentagem: number): Promise<ProgressoEpisodio> => {
        const response = await api.put<ProgressoEpisodio>(`/episodios/${episodioId}/progresso`, {
            porcentagem,
            assistido: porcentagem >= 100,
        });
        return response.data;
    },

    concluirEpisodio: async (episodioId: number): Promise<ProgressoEpisodio> => {
        const response = await api.post<ProgressoEpisodio>(`/episodios/${episodioId}/concluir`);
        return response.data;
    },
    obterProgressosUsuario: async (usuarioId: number): Promise<ProgressoEpisodio[]> => {
        const response = await api.get<ProgressoEpisodio[]>(`/usuarios/${usuarioId}/progressos`);
        return response.data;
    },
    deleteProgressoUsuario: async (usuarioId: number): Promise<void> => {
        const response = await api.delete<void>(`/usuarios/${usuarioId}/progressos`);
        return response.data;
    }
};