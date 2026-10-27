import { useCallback, useEffect, useRef, useState } from 'react';

import { animeService } from '../../services/anime.service';
import { getAccessToken } from '../../services/api';
import { episodioService } from '../../services/episodio.service';
import { progressoService } from '../../services/progresso.service';
import { userService } from '../../services/user.service';
import type { AnimeData } from '../../types/AnimeData';
import type { Episodio } from '../../types/Episodio';
import {
  buildAnimeProgressItems,
  getWeeklyProgressActivity,
  type AnimeProgressItem,
} from '../../utils/meuProgresso';

const EMPTY_ACTIVITY = [0, 0, 0, 0, 0, 0, 0];

type SessionState = {
  token: string;
  version: number;
};

export const useMeuProgressoData = () => {
  const [session, setSession] = useState<SessionState>(() => ({
    token: getAccessToken(),
    version: 0,
  }));
  const [reloadVersion, setReloadVersion] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);
  const [items, setItems] = useState<AnimeProgressItem[]>([]);
  const [episodes, setEpisodes] = useState<Episodio[]>([]);
  const [animeById, setAnimeById] = useState<Record<number, AnimeData>>({});
  const [weeklyActivity, setWeeklyActivity] = useState(EMPTY_ACTIVITY);
  const [loading, setLoading] = useState(() => Boolean(getAccessToken()));
  const [loadError, setLoadError] = useState(false);
  const [dataNotice, setDataNotice] = useState<string | null>(null);
  const [updatingAnimeId, setUpdatingAnimeId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const sessionGeneration = useRef(0);

  const clearSessionData = useCallback(() => {
    setUserId(null);
    setItems([]);
    setEpisodes([]);
    setAnimeById({});
    setWeeklyActivity(EMPTY_ACTIVITY);
    setLoadError(false);
    setDataNotice(null);
    setUpdatingAnimeId(null);
    setActionError(null);
  }, []);

  useEffect(() => {
    const synchronizeSession = () => {
      sessionGeneration.current += 1;
      const token = getAccessToken();

      setSession((current) => ({ token, version: current.version + 1 }));
      setLoading(Boolean(token));
      clearSessionData();
    };

    const synchronizeStorage = (event: StorageEvent) => {
      if (event.key === 'accessToken' || event.key === null) {
        synchronizeSession();
      }
    };

    window.addEventListener('auth-state-changed', synchronizeSession);
    window.addEventListener('storage', synchronizeStorage);

    return () => {
      sessionGeneration.current += 1;
      window.removeEventListener('auth-state-changed', synchronizeSession);
      window.removeEventListener('storage', synchronizeStorage);
    };
  }, [clearSessionData]);

  useEffect(() => {
    if (!session.token) {
      return;
    }

    const generation = ++sessionGeneration.current;
    let active = true;
    const isCurrent = () =>
      active && generation === sessionGeneration.current;

    const loadProgressData = async () => {
      try {
        const profile = await userService.buscarMeuPerfil();

        if (!isCurrent()) {
          return;
        }

        const currentUserId = Number(profile.usuario?.id);

        if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
          throw new Error('Usuário autenticado inválido.');
        }

        const [progressResult, episodesResult, animeResult] =
          await Promise.allSettled([
            progressoService.obterProgressosUsuario(currentUserId),
            episodioService.listarEpisodios(),
            animeService.listarAnimes({ page: 1, perPage: 1000 }),
          ]);

        if (!isCurrent()) {
          return;
        }

        if (progressResult.status === 'rejected') {
          throw new Error('Não foi possível carregar os registros de progresso.');
        }

        if (episodesResult.status === 'rejected') {
          throw new Error('Não foi possível carregar os episódios.');
        }

        const progressResponse = progressResult.value;
        const episodesResponse = episodesResult.value;
        const nextAnimeById =
          (animeResult.status === 'fulfilled'
            ? animeResult.value.items ?? []
            : []
          ).reduce<
          Record<number, AnimeData>
        >((result, anime) => {
          result[anime.id] = anime;
          return result;
        }, {});

        if (animeResult.status === 'rejected') {
          console.error('Falha ao carregar metadados dos animes:', animeResult.reason);
          setDataNotice(
            'Alguns metadados de temporada não estão disponíveis no momento.',
          );
        } else {
          setDataNotice(null);
        }

        setUserId(currentUserId);
        setEpisodes(episodesResponse);
        setAnimeById(nextAnimeById);
        setWeeklyActivity(getWeeklyProgressActivity(progressResponse));
        setItems(
          buildAnimeProgressItems(
            episodesResponse,
            progressResponse,
            nextAnimeById,
          ),
        );
      } catch (error) {
        if (isCurrent()) {
          console.error('Falha ao carregar o progresso:', error);
          setLoadError(true);
        }
      } finally {
        if (isCurrent()) {
          setLoading(false);
        }
      }
    };

    void loadProgressData();

    return () => {
      active = false;
      if (sessionGeneration.current === generation) {
        sessionGeneration.current += 1;
      }
    };
  }, [reloadVersion, session.token, session.version]);

  const retry = useCallback(() => {
    if (!session.token) {
      return;
    }

    sessionGeneration.current += 1;
    setLoading(true);
    setLoadError(false);
    setDataNotice(null);
    setActionError(null);
    setReloadVersion((current) => current + 1);
  }, [session.token]);

  const alterarEpisodio = useCallback(
    async (animeId: number, delta: number) => {
      if (userId === null || updatingAnimeId !== null) {
        return;
      }

      const currentUserId = userId;
      const generation = sessionGeneration.current;
      const episodesForAnime = [...episodes]
        .filter((episode) => episode.animeId === animeId)
        .sort((a, b) => {
          const numberA =
            typeof a.numero === 'number' ? a.numero : Number.MAX_SAFE_INTEGER;
          const numberB =
            typeof b.numero === 'number' ? b.numero : Number.MAX_SAFE_INTEGER;

          return numberA === numberB ? a.id - b.id : numberA - numberB;
        });

      if (episodesForAnime.length === 0) {
        return;
      }

      const isCurrent = () => generation === sessionGeneration.current;

      try {
        setUpdatingAnimeId(animeId);
        setActionError(null);

        const progress = await progressoService.obterProgressosUsuario(
          currentUserId,
        );

        if (!isCurrent()) {
          return;
        }

        const watchedEpisodes = new Set(
          progress
            .filter(
              (record) =>
                record.episodio?.anime?.id === animeId &&
                (record.assistido || (record.porcentagem ?? 0) >= 100),
            )
            .map((record) => record.episodioId),
        );

        if (delta > 0) {
          const nextEpisode = episodesForAnime.find(
            (episode) => !watchedEpisodes.has(episode.id),
          );

          if (!nextEpisode) {
            return;
          }

          await progressoService.concluirEpisodio(nextEpisode.id);
        } else {
          const lastWatched = [...episodesForAnime]
            .reverse()
            .find((episode) => watchedEpisodes.has(episode.id));

          if (!lastWatched) {
            return;
          }

          await progressoService.atualizarProgresso(lastWatched.id, 0);
        }

        if (!isCurrent()) {
          return;
        }

        const refreshedProgress =
          await progressoService.obterProgressosUsuario(currentUserId);

        if (!isCurrent()) {
          return;
        }

        setWeeklyActivity(getWeeklyProgressActivity(refreshedProgress));
        setItems(
          buildAnimeProgressItems(episodes, refreshedProgress, animeById),
        );
      } catch (error) {
        if (isCurrent()) {
          console.error('Falha ao atualizar o progresso do anime:', error);
          setActionError(
            'Não foi possível atualizar o progresso deste anime.',
          );
        }
      } finally {
        if (isCurrent()) {
          setUpdatingAnimeId(null);
        }
      }
    },
    [animeById, episodes, updatingAnimeId, userId],
  );

  return {
    actionError,
    alterarEpisodio,
    dataNotice,
    items,
    loadError,
    loading,
    retry,
    sessionAvailable: Boolean(session.token),
    updatingAnimeId,
    weeklyActivity,
  };
};
