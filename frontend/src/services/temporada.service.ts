import { api } from './api';
import type { Episodio } from '../types/Episodio';
import type { TemporadaResumo } from '../types/Temporada';

type EpisodiosResponse = Episodio[] | { items?: Episodio[] };

const toEpisodiosList = (data: EpisodiosResponse): Episodio[] => {
    if (Array.isArray(data)) {
        return data;
    }

    if (data && typeof data === 'object' && Array.isArray(data.items)) {
        return data.items;
    }

    return [];
};

const toTemporadas = (episodios: Episodio[], animeIdPadrao?: number): TemporadaResumo[] => {
    const map = new Map<string, TemporadaResumo>();

    episodios.forEach((episodio) => {
        if (typeof episodio.temporada !== 'number') {
            return;
        }

        const animeId =
            typeof episodio.animeId === 'number'
                ? episodio.animeId
                : animeIdPadrao;

        const key = `${animeId ?? 'global'}:${episodio.temporada}`;
        const existente = map.get(key);

        if (existente) {
            existente.episodios.push(episodio);
            existente.quantidadeEpisodios += 1;
            return;
        }

        map.set(key, {
            id: episodio.temporada,
            numero: episodio.temporada,
            animeId,
            quantidadeEpisodios: 1,
            episodios: [episodio],
        });
    });

    return Array.from(map.values()).sort((a, b) => a.numero - b.numero);
};

export const temporadaService = {
    listarTemporadas: async (): Promise<TemporadaResumo[]> => {
        const response = await api.get<EpisodiosResponse>('/episodios');
        return toTemporadas(toEpisodiosList(response.data));
    },

    buscarTemporada: async (id: number, animeId?: number): Promise<TemporadaResumo | null> => {
        const response = await api.get<EpisodiosResponse>('/episodios', {
            params: {
                temporadaId: id,
                animeId,
            },
        });

        const temporadas = toTemporadas(toEpisodiosList(response.data), animeId);
        return temporadas.find((temporada) => temporada.numero === id) ?? null;
    },

    listarTemporadasPorAnime: async (animeId: number): Promise<TemporadaResumo[]> => {
        const response = await api.get<EpisodiosResponse>('/episodios', {
            params: {
                animeId,
            },
        });

        return toTemporadas(toEpisodiosList(response.data), animeId);
    },
};