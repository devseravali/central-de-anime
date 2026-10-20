import { api } from './api';

export interface Personagem {
    id: number;
    nome: string;
    idade_inicial?: number | null;
    sexo?: string | null;
    papel?: string | null;
    aniversario?: string | null;
    altura_inicial?: string | null;
    afiliacao?: string | null;
    sobre?: string | null;
    imagem?: string | null;
}


export const personagemService = {
    listarPersonagens: async (): Promise<Personagem[]> => {
        const response = await api.get<Personagem[]>('/personagens');
        return response.data;
    },

    listarPersonagensPorId: async (id: number): Promise<Personagem> => {
        const response = await api.get<Personagem>(`/personagens/${id}`);
        return response.data;
    },
};