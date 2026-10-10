import { useEffect, useMemo, useState } from 'react';
import { episodioService } from '../../services/episodio.service';
import { favoritoService } from '../../services/favorito.service';
import { type Personagem } from '../../services/personagem.service';
import { userService } from '../../services/user.service';
import type { Episodio } from '../../types/Episodio';
import {
  ActionButton,
  ActionGroup,
  AnimeCard,
  CardBody,
  CardTitle,
  Cover,
  Dot,
  EmptyState,
  EmptyText,
  EmptyTitle,
  Eyebrow,
  FavoriteAction,
  Genre,
  Grid,
  Hero,
  HeroMain,
  Meta,
  NeutralButton,
  Page,
  Rating,
  SearchField,
  SectionHeader,
  SectionTitle,
  SegmentButton,
  SegmentCount,
  Segmented,
  Select,
  StatCard,
  StatLabel,
  StatValue,
  Stats,
  Status,
  Subtitle,
  SyncDescription,
  SyncPanel,
  SyncText,
  SyncTitle,
  Title,
  Toolbar,
  ViewButton,
  ViewMode,
} from './FavoritosStyle';

type FavoriteItem = {
  id: number;
  title: string;
  episodes: string;
  genre: string;
  rating: number | null;
  imageUrl: string;
  sortDate: number;
  status: string;
  type: 'anime' | 'personagem';
};

type FavoriteAnimeApi = {
  id?: number;
  titulo?: string;
  capaUrl?: string | null;
  tipo?: string | null;
  status?: string | { nome?: string } | null;
  quantidadeEpisodios?: number | null;
  ano?: number | null;
};

const toAbsoluteImage = (
  value: string | null | undefined,
  apiBase: string,
): string => {
  if (!value) {
    return '/placeholder/capa-anime.png';
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const cleaned = String(value)
    .trim()
    .replace(/^(?:\.\.\/)+/, '')
    .replace(/^\/+/, '');

  return `${apiBase}/${cleaned}`.replace(/\\/g, '/');
};

const toEpisodeCountMap = (episodios: Episodio[]): Record<number, number> => {
  return episodios.reduce<Record<number, number>>((acc, episodio) => {
    if (!episodio || typeof episodio.animeId !== 'number') {
      return acc;
    }

    acc[episodio.animeId] = (acc[episodio.animeId] ?? 0) + 1;

    return acc;
  }, {});
};

const toPersonagensList = (response: unknown): Personagem[] => {
  if (Array.isArray(response)) {
    return response as Personagem[];
  }

  if (
    response &&
    typeof response === 'object' &&
    Array.isArray((response as { items?: unknown[] }).items)
  ) {
    return (response as { items: Personagem[] }).items;
  }

  return [];
};

const toAnimesFavoritosList = (response: unknown): FavoriteAnimeApi[] => {
  if (!Array.isArray(response)) {
    return [];
  }

  return response as FavoriteAnimeApi[];
};

export const Favoritos = () => {
  const [animesFavoritos, setAnimesFavoritos] = useState<FavoriteAnimeApi[]>([]);
  const [personagensFavoritos, setPersonagensFavoritos] = useState<Personagem[]>([]);
  const [episodiosPorAnime, setEpisodiosPorAnime] = useState<Record<number, number>>({});
  const [usuarioId, setUsuarioId] = useState<number | null>(null);
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeTab, setActiveTab] = useState<'anime' | 'personagem'>('anime');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'title'>('recent');
  const [compactView, setCompactView] = useState(false);
  const [simulateEmpty, setSimulateEmpty] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(false);

        const perfil = await userService.buscarMeuPerfil();
        const usuarioId = Number(perfil?.id);

        if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
          throw new Error('Usuario autenticado invalido');
        }

        setUsuarioId(usuarioId);

        const [animesResponse, personagensResponse, episodiosResponse] = await Promise.all([
          favoritoService.AnimesFavoritos(usuarioId),
          favoritoService.PersonagensFavoritos(usuarioId),
          episodioService.listarEpisodios(),
        ]);

        const episodios = Array.isArray(episodiosResponse)
          ? (episodiosResponse as Episodio[])
          : Array.isArray((episodiosResponse as { items?: unknown[] })?.items)
            ? ((episodiosResponse as { items: Episodio[] }).items ?? [])
            : [];

        setAnimesFavoritos(toAnimesFavoritosList(animesResponse));
        setPersonagensFavoritos(toPersonagensList(personagensResponse));
        setEpisodiosPorAnime(toEpisodeCountMap(episodios));
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

  const animeFavorites = useMemo<FavoriteItem[]>(() => {
    return animesFavoritos.map((anime, index) => {
      const animeId = Number(anime.id ?? 0) || index + 1;
      const totalEpisodios =
        episodiosPorAnime[animeId] ??
        Number(anime.quantidadeEpisodios ?? 0);

      const status = typeof anime.status === 'string'
        ? anime.status
        : anime.status?.nome ?? 'Catalogado';

      const pseudoRating = anime.ano
        ? Math.min(9.9, Math.max(7.2, 7.2 + ((anime.ano % 10) / 4)))
        : null;

      return {
        id: animeId,
        title: anime.titulo ?? 'Anime sem titulo',
        episodes: `${totalEpisodios} episodios`,
        genre: anime.tipo ?? 'Anime',
        rating: pseudoRating,
        imageUrl: toAbsoluteImage(anime.capaUrl, apiBase),
        sortDate: animeId,
        status,
        type: 'anime',
      };
    });
  }, [animesFavoritos, episodiosPorAnime, apiBase]);

  const personagemFavorites = useMemo<FavoriteItem[]>(() => {
    return personagensFavoritos.map((personagem, index) => {
      const personagemId = Number(personagem.id ?? 0) || index + 1;
      const idade = Number(personagem.idade_inicial ?? 0);
      const pseudoRating = idade > 0
        ? Math.min(9.8, Math.max(7.1, 7.1 + ((idade % 10) / 3.5)))
        : null;

      const papel = String(personagem.papel ?? '').trim();
      const afiliacao = String(personagem.afiliacao ?? '').trim();

      return {
        id: personagemId,
        title: personagem.nome,
        episodes: papel.length > 0 ? papel : 'Personagem',
        genre: personagem.sexo || 'Personagem',
        rating: pseudoRating,
        imageUrl: toAbsoluteImage(personagem.imagem, apiBase),
        sortDate: personagemId,
        status: afiliacao.length > 0 ? afiliacao : 'Sem afiliacao',
        type: 'personagem',
      };
    });
  }, [personagensFavoritos, apiBase]);

  const favorites = useMemo<FavoriteItem[]>(
    () => [...animeFavorites, ...personagemFavorites],
    [animeFavorites, personagemFavorites],
  );

  const animeCount = animeFavorites.length;
  const personagemCount = personagemFavorites.length;
  const episodiosTotal = Object.values(episodiosPorAnime).reduce((sum, total) => sum + total, 0);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    let result = favorites.filter((item) => item.type === activeTab);

    if (normalized.length > 0) {
      result = result.filter((item) => {
        const searchable = `${item.title} ${item.genre} ${item.episodes}`.toLowerCase();

        return searchable.includes(normalized);
      });
    }

    if (sortBy === 'rating') {
      result = [...result].sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
      );
    }

    if (sortBy === 'title') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === 'recent') {
      result = [...result].sort(
        (a, b) => b.sortDate - a.sortDate,
      );
    }

    return result;
  }, [activeTab, favorites, query, sortBy]);

  const displayedItems = simulateEmpty
    ? []
    : filtered;

  const handleRemoveFavorite = async (item: FavoriteItem) => {
    if (!usuarioId) {
      setActionError('Sessao de usuario indisponivel para remover favorito.');
      return;
    }

    const key = `${item.type}-${item.id}`;

    try {
      setActionError(null);
      setRemovingKey(key);

      if (item.type === 'anime') {
        await favoritoService.Desfavoritar(item.id);
        setAnimesFavoritos((current) =>
          current.filter((anime) => Number(anime.id) !== item.id),
        );
      } else {
        await favoritoService.DesfavoritarPersonagem(item.id);
        setPersonagensFavoritos((current) =>
          current.filter((personagem) => Number(personagem.id) !== item.id),
        );
      }
    } catch {
      setActionError('Nao foi possivel remover este item dos favoritos.');
    } finally {
      setRemovingKey(null);
    }
  };

  if (loading) {
    return (
      <Page>
        <EmptyState>
          <EmptyTitle>Carregando favoritos</EmptyTitle>
          <EmptyText>Buscando favoritos reais do usuario no banco de dados.</EmptyText>
        </EmptyState>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <EmptyState>
          <EmptyTitle>Erro ao carregar favoritos</EmptyTitle>
          <EmptyText>
            Nao foi possivel buscar os favoritos reais de animes e personagens agora.
          </EmptyText>
        </EmptyState>
      </Page>
    );
  }

  return (
    <Page>
      <Hero>
        <HeroMain>
          <Eyebrow>Cofre de colecao</Eyebrow>

          <Title>Meus Favoritos</Title>

          <Subtitle>
            Sua colecao pessoal de animes marcantes e personagens prediletos salvos em um so lugar.
          </Subtitle>
        </HeroMain>

        <Stats aria-label="Resumo de favoritos">
          <StatCard>
            <StatValue>{animeCount}</StatValue>
            <StatLabel>Animes salvos</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>{personagemCount}</StatValue>
            <StatLabel>Personagens</StatLabel>
          </StatCard>

          <StatCard>
            <StatValue>{episodiosTotal}</StatValue>
            <StatLabel>Episodios totais</StatLabel>
          </StatCard>
        </Stats>
      </Hero>

      <Toolbar aria-label="Controles de favoritos">
        <Segmented>
          <SegmentButton
            type="button"
            $active={activeTab === 'anime'}
            onClick={() => setActiveTab('anime')}
          >
            Animes
            <SegmentCount>{animeCount}</SegmentCount>
          </SegmentButton>

          <SegmentButton
            type="button"
            $active={activeTab === 'personagem'}
            onClick={() => setActiveTab('personagem')}
          >
            Personagens
            <SegmentCount>{personagemCount}</SegmentCount>
          </SegmentButton>
        </Segmented>

        <SearchField
          type="search"
          placeholder="Filtrar favoritos..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Filtrar favoritos"
        />

        <Select
          aria-label="Ordenar favoritos"
          value={sortBy}
          onChange={(event) => {
            setSortBy(
              event.target.value as
                | 'recent'
                | 'rating'
                | 'title',
            );
          }}
        >
          <option value="recent">Adicionados recentemente</option>
          <option value="rating">Maior nota</option>
          <option value="title">Titulo A-Z</option>
        </Select>

        <ViewMode>
          <ViewButton
            type="button"
            $active={!compactView}
            onClick={() => setCompactView(false)}
            aria-label="Ativar grade padrao"
          >
            Grid
          </ViewButton>

          <ViewButton
            type="button"
            $active={compactView}
            onClick={() => setCompactView(true)}
            aria-label="Ativar grade compacta"
          >
            Compact
          </ViewButton>
        </ViewMode>

        <NeutralButton
          type="button"
          onClick={() => setSimulateEmpty((current) => !current)}
        >
          {simulateEmpty
            ? 'Desativar estado vazio'
            : 'Simular estado vazio'}
        </NeutralButton>
      </Toolbar>

      {actionError && (
        <EmptyText role="alert">
          {actionError}
        </EmptyText>
      )}

      <SectionHeader>
        <Dot aria-hidden="true" />

        <SectionTitle>Obras Selecionadas</SectionTitle>

        <span>
          (Exibindo {displayedItems.length} de {filtered.length})
        </span>
      </SectionHeader>

      {displayedItems.length === 0 && (
        <EmptyState>
          <EmptyTitle>Nenhum favorito encontrado</EmptyTitle>

          <EmptyText>
            Ajuste os filtros, mude de aba ou desative a simulacao de estado vazio para voltar a ver sua colecao.
          </EmptyText>
        </EmptyState>
      )}

      {displayedItems.length > 0 && (
        <Grid $compact={compactView}>
          {displayedItems.map((item) => (
            <AnimeCard key={`${item.type}-${item.id}`}>
              <Cover>
                <img src={item.imageUrl} alt={`Capa de ${item.title}`} loading="lazy" />
                <Rating>
                  {item.rating === null ? '★ --' : `★ ${item.rating.toFixed(1)}`}
                </Rating>

                <FavoriteAction
                  type="button"
                  aria-label={`Remover ${item.title} dos favoritos`}
                  onClick={() => {
                    void handleRemoveFavorite(item);
                  }}
                  disabled={removingKey === `${item.type}-${item.id}`}
                >
                  {removingKey === `${item.type}-${item.id}`
                    ? '...'
                    : '♥'}
                </FavoriteAction>
              </Cover>

              <CardBody>
                <Genre>{item.genre}</Genre>

                <CardTitle>{item.title}</CardTitle>

                <Meta>{item.episodes}</Meta>

                <Status>{item.status}</Status>
              </CardBody>
            </AnimeCard>
          ))}
        </Grid>
      )}

      <SyncPanel>
        <SyncText>
          <SyncTitle>Mantenha sua lista em sincronia</SyncTitle>

          <SyncDescription>
            Compartilhe sua colecao publicamente ou exporte para outros servicos com um clique.
          </SyncDescription>
        </SyncText>

        <ActionGroup>
          <ActionButton type="button">Compartilhar</ActionButton>
          <ActionButton type="button">Exportar JSON</ActionButton>
        </ActionGroup>
      </SyncPanel>
    </Page>
  );
};
