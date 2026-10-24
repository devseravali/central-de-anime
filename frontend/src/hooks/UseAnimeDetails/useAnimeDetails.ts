import { useEffect, useState } from 'react';

import { animeService } from '../../services/anime.service';
import { favoritoService } from '../../services/favorito.service';
import { temporadaService } from '../../services/temporada.service';
import { userService } from '../../services/user.service';
import type { AnimeData } from '../../types/AnimeData';
import type { TemporadaResumo } from '../../types/Temporada';

export const useAnimeDetails = (id: string | undefined) => {
    const animeId = Number(id);

    const [anime, setAnime] = useState<AnimeData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);
    const [favoriteError, setFavoriteError] = useState<string | null>(null);
    const [usuarioId, setUsuarioId] = useState<number | null>(null);

    const [temporadas, setTemporadas] = useState<TemporadaResumo[]>([]);
    const [loadingTemporadas, setLoadingTemporadas] = useState(false);
    const [errorTemporadas, setErrorTemporadas] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (!id) {
            return;
        }

        if (!Number.isInteger(animeId) || animeId <= 0) {
            return;
        }

        let mounted = true;

        const fetchAnime = async () => {
            setLoading(true);
            setError(null);

            try {
                const data = await animeService.buscarAnime(animeId);

                if (mounted) {
                    setAnime(data);
                }
            } catch (err: unknown) {
                if (!mounted) {
                    return;
                }

                setError(
                    err instanceof Error ? err.message : 'Erro ao buscar anime.',
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchAnime();

        return () => {
            mounted = false;
        };
    }, [animeId, id]);

    useEffect(() => {
        if (!id) {
            return;
        }

        if (!Number.isInteger(animeId) || animeId <= 0) {
            return;
        }

        let mounted = true;

        const fetchTemporadas = async () => {
            setLoadingTemporadas(true);
            setErrorTemporadas(null);

            try {
                const data =
                    await temporadaService.listarTemporadasPorAnime(animeId);

                if (!mounted) {
                    return;
                }

                setTemporadas(data);
            } catch (err: unknown) {
                if (!mounted) {
                    return;
                }

                setTemporadas([]);
                setErrorTemporadas(
                    err instanceof Error
                        ? err.message
                        : 'Erro ao carregar temporadas.',
                );
            } finally {
                if (mounted) {
                    setLoadingTemporadas(false);
                }
            }
        };

        fetchTemporadas();

        return () => {
            mounted = false;
        };
    }, [animeId, id]);

    useEffect(() => {
        if (!id) {
            return;
        }

        if (!Number.isInteger(animeId) || animeId <= 0) {
            return;
        }

        let mounted = true;

        const fetchFavoriteState = async () => {
            try {
                const perfil = await userService.buscarMeuPerfil();
                const currentUserId = Number(perfil?.usuario?.id);

                if (!mounted) {
                    return;
                }

                if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
                    setUsuarioId(null);
                    setIsFavorite(false);
                    return;
                }

                setUsuarioId(currentUserId);

                const favoritesResponse =
                    await favoritoService.AnimesFavoritos(currentUserId);

                if (!mounted) {
                    return;
                }

                const favorites = Array.isArray(favoritesResponse)
                    ? favoritesResponse
                    : [];

                setIsFavorite(
                    favorites.some((item) => Number(item?.id) === animeId),
                );
            } catch {
                if (mounted) {
                    setUsuarioId(null);
                    setIsFavorite(false);
                }
            }
        };

        fetchFavoriteState();

        return () => {
            mounted = false;
        };
    }, [animeId, id]);

    const handleToggleFavorite = async () => {
        if (!Number.isInteger(animeId) || animeId <= 0) {
            return;
        }

        if (!usuarioId) {
            setFavoriteError('Faça login para atualizar os favoritos.');
            return;
        }

        try {
            setFavoriteError(null);
            setFavoriteLoading(true);

            if (isFavorite) {
                await favoritoService.Desfavoritar(animeId);
            } else {
                await favoritoService.Favoritar(animeId);
            }

            setIsFavorite((previous) => !previous);
        } catch {
            setFavoriteError('Não foi possível atualizar favorito agora.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    return {
        anime,
        loading,
        error,
        isFavorite,
        favoriteLoading,
        favoriteError,
        temporadas,
        loadingTemporadas,
        errorTemporadas,
        handleToggleFavorite,
    };
};
