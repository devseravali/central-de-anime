import React from "react";
import {
  personagemService,
  type Personagem,
} from '../../services/personagem.service';
import { getApiBaseUrl } from '../../utils/apiUrl';

const DEFAULT_API_URL = getApiBaseUrl();

type UsePersonagensOptions = {
  animeId?: number | string;
  urlBase?: string;
  enabled?: boolean;
};

export const usePersonagens = ({
  animeId,
  urlBase = `${DEFAULT_API_URL}/personagens`,
  enabled = true,
}: UsePersonagensOptions) => {
  const [data, setData] = React.useState<Personagem[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const requestVersion = React.useRef(0);

  const fetchPersonagens = React.useCallback(async (forceUrl?: string): Promise<Personagem[] | undefined> => {
    const requestId = ++requestVersion.current;
    setLoading(true);
    setError(null);
    try {
      const normalizedAnimeId =
        animeId === undefined || String(animeId).trim() === ''
          ? undefined
          : animeId;
      const personagens = forceUrl
        ? await personagemService.listarPersonagensPorUrl(forceUrl)
        : await personagemService.listarPersonagens(
            normalizedAnimeId,
            urlBase
          );
      const result = Array.isArray(personagens) ? personagens : [];

      if (requestId === requestVersion.current) {
        setData(result);
      }

      return result;
    } catch (err: unknown) {
      if (requestId === requestVersion.current) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setData(null);
      }

      throw err;
    } finally {
      if (requestId === requestVersion.current) {
        setLoading(false);
      }
    }
  }, [animeId, urlBase]);

  React.useEffect(() => {
    if (!enabled) return;
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      fetchPersonagens().catch(() => {});
    });
    return () => {
      mounted = false;
      requestVersion.current += 1;
    };
  }, [enabled, fetchPersonagens]);

  return {
    data,
    loading,
    error,
    refetch: fetchPersonagens,
  } as const;
};

export default usePersonagens;
