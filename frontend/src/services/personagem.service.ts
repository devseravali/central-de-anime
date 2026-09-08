import { api } from './api';

export interface Personagem {
    id: number;
    nome: string;
    idade_inicial: number;
    sexo: string;
    papel: string;
    aniversario: string;
    altura_inicial: string;
    afiliacao: string;
    sobre: string;
    imagem: string;
};


export const personagemService = {
    listarPersonagens: async () => {
        const response = await api.get('/personagens');
        return response.data;
    },

    listarPersonagensPorId: async (id: number) => {
        const response = await api.get(`/personagens/${id}`);
        return response.data;
    },
};