import { useCallback, useEffect, useState } from 'react';

import { favoritoService } from '../../services/favorito.service';
import {
  personagemService,
  type Personagem,
} from '../../services/personagem.service';
import type { PersonagemRelacionadoResumo } from '../../types/Personagem';
import { userService } from '../../services/user.service';

const getRelatedCharacters = (
  personagem: Personagem,
  personagemId: number,
): PersonagemRelacionadoResumo[] =>
  Array.from(
    new Map(
      (personagem.animes ?? [])
        .flatMap((relacao) =>
          (relacao.anime?.personagens ?? []).map((item) => item.personagem),
        )
        .filter((item) => item.id !== personagemId)
        .map((item) => [item.id, item]),
    ).values(),
  ).slice(0, 4);

export const usePersonagemDetailsData = (
  personagemId: number,
  enabled: boolean,
) => {
  const [personagem, setPersonagem] = useState<Personagem | null>(null);
  const [related, setRelated] = useState<PersonagemRelacionadoResumo[]>([]);
  const [requestState, setRequestState] = useState(() => ({
    personagemId,
    loading: enabled,
    error: null as string | null,
  }));
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const loading =
    enabled &&
    (requestState.personagemId !== personagemId || requestState.loading);
  const error =
    requestState.personagemId === personagemId ? requestState.error : null;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let active = true;
    let requestError: string | null = null;

    const loadData = async () => {
      try {
        const personagemData =
          await personagemService.listarPersonagensPorId(personagemId);

        if (!active) {
          return;
        }

        setPersonagem(personagemData);
        setRelated(getRelatedCharacters(personagemData, personagemId));

        try {
          const perfil = await userService.buscarMeuPerfil();
          const currentUserId = Number(perfil?.usuario?.id);

          if (!active) {
            return;
          }

          if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
            setUsuarioId(null);
            setIsFavorite(false);
            return;
          }

          setUsuarioId(currentUserId);

          const favoritosResponse =
            await favoritoService.PersonagensFavoritos(currentUserId);
          const favoritos = Array.isArray(favoritosResponse)
            ? favoritosResponse
            : [];

          if (active) {
            setIsFavorite(
              favoritos.some((item) => Number(item?.id) === personagemId),
            );
          }
        } catch {
          if (active) {
            setUsuarioId(null);
            setIsFavorite(false);
          }
        }
      } catch (loadError: unknown) {
        if (active) {
          requestError =
            loadError instanceof Error
              ? loadError.message
              : 'Erro ao carregar personagem.';
        }
      } finally {
        if (active) {
          setRequestState({
            personagemId,
            loading: false,
            error: requestError,
          });
        }
      }
    };

    void loadData();

    return () => {
      active = false;
    };
  }, [enabled, personagemId]);

  const handleToggleFavorite = useCallback(async () => {
    if (!usuarioId) {
      setFavoriteError('Faça login para atualizar os favoritos.');
      return;
    }

    try {
      setFavoriteError(null);
      setFavoriteLoading(true);

      if (isFavorite) {
        await favoritoService.DesfavoritarPersonagem(personagemId);
      } else {
        await favoritoService.FavoritarPersonagem(personagemId);
      }

      setIsFavorite((previous) => !previous);
    } catch {
      setFavoriteError('Não foi possível atualizar favorito agora.');
    } finally {
      setFavoriteLoading(false);
    }
  }, [isFavorite, personagemId, usuarioId]);

  return {
    personagem,
    related,
    loading,
    error,
    isFavorite,
    favoriteLoading,
    favoriteError,
    handleToggleFavorite,
  } as const;
};
