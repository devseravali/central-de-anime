import { useEffect, useState } from 'react';
import { avaliacaoService } from '../../services/avaliacao.service';

type RatingsResult = {
  userId: number;
  ratingsByAnime: Record<number, number>;
};

type RatingsFailure = {
  userId: number;
  retryCount: number;
  message: string;
};

const EMPTY_RATINGS: Record<number, number> = {};
const RATINGS_ERROR_MESSAGE = 'As avaliações não puderam ser carregadas.';

export const useFavoriteRatings = (userId: number | null) => {
  const [result, setResult] = useState<RatingsResult | null>(null);
  const [failure, setFailure] = useState<RatingsFailure | null>(null);
  const [loadingUserId, setLoadingUserId] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (userId === null) {
      return;
    }

    let mounted = true;

    const loadRatings = async () => {
      try {
        const evaluations = await avaliacaoService.AvaliacoesUsuarios(userId);

        if (!mounted) {
          return;
        }

        const ratingsByAnime = evaluations.reduce<Record<number, number>>(
          (ratings, evaluation) => {
            const animeId = Number(evaluation.anime.id);
            const rating = Number(evaluation.nota);

            if (Number.isInteger(animeId) && animeId > 0 && Number.isFinite(rating)) {
              ratings[animeId] = rating;
            }

            return ratings;
          },
          {},
        );

        setResult({ userId, ratingsByAnime });
      } catch (error) {
        if (mounted) {
          console.error('Falha ao carregar avaliações dos favoritos:', error);
          setFailure({ userId, retryCount, message: RATINGS_ERROR_MESSAGE });
        }
      } finally {
        if (mounted) {
          setLoadingUserId(null);
        }
      }
    };

    void loadRatings();

    return () => {
      mounted = false;
    };
  }, [retryCount, userId]);

  return {
    ratingsByAnime:
      result?.userId === userId ? result.ratingsByAnime : EMPTY_RATINGS,
    error:
      failure?.userId === userId && failure.retryCount === retryCount
        ? failure.message
        : null,
    isLoading:
      userId !== null &&
      (loadingUserId === userId ||
        (result?.userId !== userId && failure?.userId !== userId)),
    retry: () => {
      if (userId !== null) {
        setLoadingUserId(userId);
        setRetryCount((current) => current + 1);
      }
    },
  };
};
