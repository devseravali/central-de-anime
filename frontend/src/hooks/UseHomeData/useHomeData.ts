import { useEffect, useState } from 'react';

import { animeService } from '../../services/anime.service';
import {
    personagemService,
    type Personagem,
} from '../../services/personagem.service';
import type { AnimeData } from '../../types/AnimeData';

export const useHomeData = () => {
    const [animes, setAnimes] = useState<AnimeData[]>([]);
    const [totalAnimes, setTotalAnimes] = useState(0);
    const [personagens, setPersonagens] = useState<Personagem[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingPersonagens, setLoadingPersonagens] = useState(true);

    const [error, setError] = useState(false);
    const [personagemError, setPersonagemError] = useState(false);

    useEffect(() => {
        const loadAnimes = async () => {
            try {
                setLoading(true);
                setError(false);

                const response = await animeService.listarAnimes();

                setAnimes(response.items ?? []);
                setTotalAnimes(response.total);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadAnimes();
    }, []);

    useEffect(() => {
        const loadPersonagens = async () => {
            try {
                setLoadingPersonagens(true);
                setPersonagemError(false);

                const personagensData =
                    await personagemService.listarPersonagens();

                setPersonagens(personagensData.slice(0, 4));
            } catch {
                setPersonagemError(true);
            } finally {
                setLoadingPersonagens(false);
            }
        };

        loadPersonagens();
    }, []);

    return {
        animes,
        totalAnimes,
        personagens,
        loading,
        loadingPersonagens,
        error,
        personagemError,
    };
};
