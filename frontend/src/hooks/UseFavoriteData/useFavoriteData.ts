import { useCallback, useEffect, useRef, useState } from 'react';

import { episodioService } from '../../services/episodio.service';
import {
  favoritoService,
  type FavoritoAnime,
} from '../../services/favorito.service';
import {
  getAccessToken,
  subscribeToAuthSessionChanges,
} from '../../services/api';
import type { Personagem } from '../../services/personagem.service';
import { userService } from '../../services/user.service';
import type { Episodio } from '../../types/Episodio';

export type FavoriteRemovalTarget = {
  id: number;
  type: 'anime' | 'personagem';
};

const toEpisodeCountMap = (
  episodes: Episodio[],
): Record<number, number> =>
  episodes.reduce<Record<number, number>>((counts, episode) => {
    if (typeof episode?.animeId === 'number') {
      counts[episode.animeId] = (counts[episode.animeId] ?? 0) + 1;
    }

    return counts;
  }, {});

const toCharactersList = (
  response: Personagem[] | { items?: Personagem[] },
): Personagem[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? [];
};

export const useFavoriteData = () => {
  const [session, setSession] = useState(() => ({
    available: Boolean(getAccessToken()),
    version: 0,
  }));
  const [reloadVersion, setReloadVersion] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [animeFavorites, setAnimeFavorites] = useState<FavoritoAnime[]>([]);
  const [characterFavorites, setCharacterFavorites] = useState<Personagem[]>([]);
  const [episodeCounts, setEpisodeCounts] = useState<Record<number, number>>({});
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [auxiliaryError, setAuxiliaryError] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const requestVersion = useRef(0);

  const clearData = useCallback(() => {
    setUserId(null);
    setAnimeFavorites([]);
    setCharacterFavorites([]);
    setEpisodeCounts({});
    setEpisodesLoading(false);
    setError(null);
    setAuxiliaryError(null);
    setActionError(null);
    setRemovingKey(null);
  }, []);

  useEffect(() => {
    const synchronizeSession = () => {
      requestVersion.current += 1;
      const available = Boolean(getAccessToken());

      setSession((current) => ({
        available,
        version: current.version + 1,
      }));
      setLoading(available);
      clearData();
    };

    const unsubscribeFromAuthSession =
      subscribeToAuthSessionChanges(synchronizeSession);

    return () => {
      requestVersion.current += 1;
      unsubscribeFromAuthSession();
    };
  }, [clearData]);

  useEffect(() => {
    if (!session.available) {
      return;
    }

    const requestId = ++requestVersion.current;
    let active = true;
    const isCurrentRequest = () =>
      active && requestVersion.current === requestId;

    const loadFavorites = async () => {
      setLoading(true);
      setError(null);
      setAuxiliaryError(null);
      setEpisodeCounts({});

      try {
        const profile = await userService.buscarMeuPerfil();
        const currentUserId = Number(profile.usuario?.id);

        if (!isCurrentRequest()) {
          return;
        }

        if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
          throw new Error('Não foi possível identificar o usuário da sessão.');
        }

        setEpisodesLoading(true);

        void episodioService
          .listarEpisodios()
          .then((episodes) => {
            if (isCurrentRequest()) {
              setEpisodeCounts(toEpisodeCountMap(episodes));
              setEpisodesLoading(false);
            }
          })
          .catch((episodesError: unknown) => {
            if (isCurrentRequest()) {
              console.error(
                'Falha ao carregar episódios dos favoritos:',
                episodesError,
              );
              setEpisodeCounts({});
              setAuxiliaryError(
                'A contagem de episódios não está disponível no momento.',
              );
              setEpisodesLoading(false);
            }
          });

        const [animesResult, charactersResult] = await Promise.allSettled([
          favoritoService.AnimesFavoritos(currentUserId),
          favoritoService.PersonagensFavoritos(currentUserId),
        ]);

        if (!isCurrentRequest()) {
          return;
        }

        if (
          animesResult.status === 'rejected' ||
          charactersResult.status === 'rejected'
        ) {
          throw new Error('Não foi possível carregar os favoritos.');
        }

        setAnimeFavorites(
          Array.isArray(animesResult.value) ? animesResult.value : [],
        );
        setCharacterFavorites(toCharactersList(charactersResult.value));
        setUserId(currentUserId);
      } catch (loadError) {
        if (isCurrentRequest()) {
          console.error('Falha ao carregar favoritos:', loadError);
          setError('Não foi possível carregar os favoritos. Tente novamente.');
        }
      } finally {
        if (isCurrentRequest()) {
          setLoading(false);
        }
      }
    };

    void loadFavorites();

    return () => {
      active = false;
      if (requestVersion.current === requestId) {
        requestVersion.current += 1;
      }
    };
  }, [reloadVersion, session.available, session.version]);

  const retry = useCallback(() => {
    if (!session.available) {
      return;
    }

    requestVersion.current += 1;
    clearData();
    setLoading(true);
    setReloadVersion((current) => current + 1);
  }, [clearData, session.available]);

  const removeFavorite = useCallback(
    async ({ id, type }: FavoriteRemovalTarget) => {
      if (userId === null) {
        setActionError('Sessão de usuário indisponível para remover favorito.');
        return;
      }

      const requestId = requestVersion.current;
      const key = `${type}-${id}`;

      try {
        setActionError(null);
        setRemovingKey(key);

        if (type === 'anime') {
          await favoritoService.Desfavoritar(id);

          if (requestVersion.current === requestId) {
            setAnimeFavorites((current) =>
              current.filter((anime) => Number(anime.id) !== id),
            );
          }
        } else {
          await favoritoService.DesfavoritarPersonagem(id);

          if (requestVersion.current === requestId) {
            setCharacterFavorites((current) =>
              current.filter((character) => Number(character.id) !== id),
            );
          }
        }
      } catch (removeError) {
        if (requestVersion.current === requestId) {
          console.error('Falha ao remover favorito:', removeError);
          setActionError('Não foi possível remover este item dos favoritos.');
        }
      } finally {
        if (requestVersion.current === requestId) {
          setRemovingKey(null);
        }
      }
    },
    [userId],
  );

  return {
    actionError,
    animeFavorites,
    auxiliaryError,
    characterFavorites,
    episodeCounts,
    episodesLoading,
    error,
    loading,
    removeFavorite,
    removingKey,
    retry,
    sessionAvailable: session.available,
    userId,
  };
};
