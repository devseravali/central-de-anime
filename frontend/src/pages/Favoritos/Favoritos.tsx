import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavoriteRatings } from '../../hooks/UseFavoriteRatings/useFavoriteRatings';
import { useFavoriteData } from '../../hooks/UseFavoriteData/useFavoriteData';
import { resolveAnimeCoverUrl } from '../../utils/animeCoverUrl';
import { resolveApiMediaUrl } from '../../utils/mediaUrl';
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
  AuthGateActions,
  AuthGateLink,
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

const toAbsoluteImage = (
  value: string | null | undefined
): string => {
  return resolveApiMediaUrl(value) ?? '/placeholder/capa-anime.png';
};

const toAnimeCoverImage = (
  value: string | null | undefined,
): string => resolveAnimeCoverUrl(value) || '/placeholder/capa-anime.png';

export const Favoritos = () => {
  const {
    actionError,
    animeFavorites: animesFavoritos,
    auxiliaryError,
    characterFavorites: personagensFavoritos,
    episodeCounts: episodiosPorAnime,
    episodesLoading: loadingEpisodios,
    error,
    loading,
    removeFavorite,
    removingKey,
    retry,
    sessionAvailable: sessaoDisponivel,
    userId: usuarioId,
  } = useFavoriteData();
  const {
    ratingsByAnime: notasPorAnime,
    error: ratingsError,
    isLoading: isLoadingRatings,
    retry: retryRatings,
  } = useFavoriteRatings(usuarioId);

  const [activeTab, setActiveTab] = useState<'anime' | 'personagem'>('anime');
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'title'>('recent');
  const [compactView, setCompactView] = useState(false);

  const animeFavorites = useMemo<FavoriteItem[]>(() => {
    return animesFavoritos.map((anime, index) => {
      const animeId = Number(anime.id ?? 0) || index + 1;
      const totalEpisodios =
        episodiosPorAnime[animeId] ??
        Number(anime.quantidadeEpisodios ?? 0);

      const status = typeof anime.status === 'string'
        ? anime.status
        : anime.status?.nome ?? 'Catalogado';

      return {
        id: animeId,
        title: anime.titulo ?? 'Anime sem titulo',
        episodes: `${totalEpisodios} episodios`,
        genre: anime.tipo ?? 'Anime',
        rating: Number.isFinite(notasPorAnime[animeId]) ? notasPorAnime[animeId] : null,
        imageUrl: toAnimeCoverImage(anime.capaUrl),
        sortDate: animeId,
        status,
        type: 'anime',
      };
    });
  }, [animesFavoritos, episodiosPorAnime, notasPorAnime]);

  const personagemFavorites = useMemo<FavoriteItem[]>(() => {
    return personagensFavoritos.map((personagem, index) => {
      const personagemId = Number(personagem.id ?? 0) || index + 1;
      const papel = String(personagem.papel ?? '').trim();
      const afiliacao = String(personagem.afiliacao ?? '').trim();

      return {
        id: personagemId,
        title: personagem.nome,
        episodes: papel.length > 0 ? papel : 'Personagem',
        genre: personagem.sexo || 'Personagem',
        rating: null,
        imageUrl: toAbsoluteImage(personagem.imagem),
        sortDate: personagemId,
        status: afiliacao.length > 0 ? afiliacao : 'Sem afiliacao',
        type: 'personagem',
      };
    });
  }, [personagensFavoritos]);

  const favorites = useMemo<FavoriteItem[]>(
    () => [...animeFavorites, ...personagemFavorites],
    [animeFavorites, personagemFavorites],
  );

  const animeCount = animeFavorites.length;
  const personagemCount = personagemFavorites.length;
  const activeFavoriteCount =
    activeTab === 'anime' ? animeCount : personagemCount;
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

  if (!sessaoDisponivel) {
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
        </Hero>

        <EmptyState>
          <EmptyTitle>Conteudo restrito</EmptyTitle>
          <EmptyText>
            Faca login ou cadastro para ver os seus favoritos.
          </EmptyText>

          <AuthGateActions>
            <AuthGateLink as={Link} to="/login">
              Fazer login
            </AuthGateLink>

            <AuthGateLink as={Link} to="/registro" $variant="secondary">
              Criar cadastro
            </AuthGateLink>
          </AuthGateActions>
        </EmptyState>
      </Page>
    );
  }

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
            {error}
          </EmptyText>
          <ActionButton type="button" onClick={retry} disabled={loading}>
            {loading ? 'Carregando favoritos...' : 'Tentar novamente'}
          </ActionButton>
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
            <StatValue>
              {auxiliaryError ? '--' : loadingEpisodios ? '...' : episodiosTotal}
            </StatValue>
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

      </Toolbar>

      {actionError && (
        <EmptyText role="alert">
          {actionError}
        </EmptyText>
      )}

      {ratingsError && (
        <div role="alert">
          <EmptyText>{ratingsError}</EmptyText>
          <ActionButton
            type="button"
            onClick={retryRatings}
            disabled={isLoadingRatings}
          >
            {isLoadingRatings
              ? 'Carregando avaliações...'
              : 'Tentar carregar avaliações novamente'}
          </ActionButton>
        </div>
      )}

      {auxiliaryError && (
        <EmptyText role="status">{auxiliaryError}</EmptyText>
      )}

      <SectionHeader>
        <Dot aria-hidden="true" />

        <SectionTitle>Obras Selecionadas</SectionTitle>

        <span>
          (Exibindo {filtered.length} de {activeFavoriteCount})
        </span>
      </SectionHeader>

      {filtered.length === 0 && (
        <EmptyState>
          <EmptyTitle>Nenhum favorito encontrado</EmptyTitle>

          <EmptyText>
            Ajuste os filtros ou mude de aba para voltar a ver sua colecao.
          </EmptyText>
        </EmptyState>
      )}

      {filtered.length > 0 && (
        <Grid $compact={compactView}>
          {filtered.map((item) => (
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
                    void removeFavorite(item);
                  }}
                  disabled={removingKey !== null}
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
