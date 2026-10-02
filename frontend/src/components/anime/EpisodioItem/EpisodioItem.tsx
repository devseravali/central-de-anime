import { useEffect, useState } from 'react';
import placeholder from '../../../assets/placeholder.jpg';
import { episodioService } from '../../../services/episodio.service';
import type { Episodio } from '../../../types/Episodio';
import {
  EpisodiosGrid,
  EpisodioItemContainer,
  EpisodioItemImage,
  EpisodioItemTitle,
  Small,
  EpisodioItemSinopse,
  ErrorMessage,
  LoadingMessage,
  NoEpisodiosMessage,
} from './EpisodioStyle';

interface EpisodioItemProps {
  animeId: number;
}

const apiUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '');

const serverUrl = apiUrl.replace(/\/api\/v1$/, '');

function resolveEpisodioImageUrl(
  imagemUrl: string
): string {
  if (/^https?:\/\//i.test(imagemUrl)) {
    return imagemUrl;
  }

  const normalizedPath = imagemUrl
    .trim()
    .replace(/\\/g, '/');

  if (normalizedPath.startsWith('/')) {
    return `${serverUrl}${normalizedPath}`;
  }

  return `${serverUrl}/${normalizedPath}`;
}

export const EpisodioItem = ({
  animeId,
}: EpisodioItemProps) => {
  const [episodios, setEpisodios] = useState<Episodio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchEpisodios = async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await episodioService.listarEpisodiosPorAnime(
            animeId
          );

        if (!mounted) {
          return;
        }

        setEpisodios(data);
      } catch (err: unknown) {
        if (!mounted) {
          return;
        }

        setEpisodios([]);

        setError(
          err instanceof Error
            ? err.message
            : 'Erro ao carregar episódios.'
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchEpisodios();

    return () => {
      mounted = false;
    };
  }, [animeId]);

  if (loading) {
    return (
      <LoadingMessage>
        Carregando episódios...
      </LoadingMessage>
    );
  }

  if (error) {
    return <ErrorMessage>{error}</ErrorMessage>;
  }

  if (episodios.length === 0) {
    return (
      <NoEpisodiosMessage>
        Nenhum episódio disponível.
      </NoEpisodiosMessage>
    );
  }

  return (
    <EpisodiosGrid aria-label="Lista de episódios">
      {episodios.map((episodio) => {
        const imagemSrc = episodio.imagemUrl
          ? resolveEpisodioImageUrl(episodio.imagemUrl)
          : placeholder;

        return (
          <EpisodioItemContainer key={episodio.id}>
            <EpisodioItemTitle>
              {episodio.titulo}
            </EpisodioItemTitle>

            <Small>
              Ep. {episodio.numero}
            </Small>

            <EpisodioItemImage
              src={imagemSrc}
              alt={episodio.titulo}
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = placeholder;
              }}
            />

            {episodio.sinopse && (
              <EpisodioItemSinopse>
                {episodio.sinopse}
              </EpisodioItemSinopse>
            )}
          </EpisodioItemContainer>
        );
      })}
    </EpisodiosGrid>
  );
};