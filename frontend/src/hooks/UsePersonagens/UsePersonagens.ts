import React from "react";

export type Personagem = {
  id?: number;
  nome?: string;
  imagem?: string;
  [key: string]: unknown;
};

type UsePersonagensOptions = {
  animeId?: number | string;
  urlBase?: string; // ex: http://localhost:3000/personagens
  enabled?: boolean;
};

export const usePersonagens = ({
  animeId,
  urlBase = "http://localhost:3000/personagens",
  enabled = true,
}: UsePersonagensOptions) => {
  const [data, setData] = React.useState<Personagem[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const buildUrl = React.useCallback(() => {
    const base = urlBase.replace(/\/$/, "");
    if (animeId === undefined || animeId === null || String(animeId).trim() === "") {
      return `${base}`;
    }
    const q = `?animeId=${encodeURIComponent(String(animeId))}`;
    return `${base}${q}`;
  }, [animeId, urlBase]);

  const fetchPersonagens = React.useCallback(async (forceUrl?: string): Promise<Personagem[] | undefined> => {
    const fetchUrl = forceUrl ?? buildUrl();
    if (!fetchUrl) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(fetchUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(Array.isArray(json) ? (json as Personagem[]) : []);
      return json as Personagem[];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      setData(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [buildUrl]);

  React.useEffect(() => {
    if (!enabled) return;
    const currentUrl = buildUrl();
    if (!currentUrl) {
      queueMicrotask(() => {
        setData(null);
        setError(null);
        setLoading(false);
      });
      return;
    }
    if (typeof window !== 'undefined') console.debug('[usePersonagens] fetch url:', currentUrl);
    let mounted = true;
    queueMicrotask(() => {
      if (!mounted) return;
      fetchPersonagens().catch(() => {});
    });
    return () => {
      mounted = false;
    };
  }, [buildUrl, enabled, fetchPersonagens]);

  return {
    data,
    loading,
    error,
    refetch: fetchPersonagens,
  } as const;
};

export default usePersonagens;
