import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
    Page,
    Hero,
    HeroLeft,
    HeroRight,
    Eyebrow,
    Title,
    Subtitle,
    CTAGroup,
    PrimaryCTA,
    SecondaryCTA,
    Counters,
    Counter,
    CounterNumber,
    TrackerCard,
    TrackerHeader,
    TrackerHeaderInfo,
    TrackerTitle,
    TrackerSync,
    TrackerAnime,
    TrackerImage,
    TrackerContent,
    TrackerDescription,
    TrackerMeta,
    TrackerMetaItem,
    TrackerStatus,
    FeaturedSection,
    FeaturedHeader,
    FeaturedHeading,
    FeaturedLabel,
    FeaturedTitle,
    CatalogLink,
    AnimeGrid,
    AnimeCard,
    AnimeLink,
    AnimeImage,
    AnimeInfo,
    AnimeTitle,
    AnimeMeta,
    AnimeMetaItem,
    PersonagemSection,
    PersonagemHeader,
    PersonagemHeading,
    PersonagemLabel,
    PersonagemTitle,
    PersonagemGrid,
    PersonagemCard,
    PersonagemLink,
    PersonagemImage,
    PersonagemInfo,
    PersonagemName,
    PersonagemAnime,
    LoadingCard,
    EmptyState,
    EmptyText,
    ErrorMessage,
    Tiny,
} from './HomeStyle';

import { animeService } from '../../services/anime.service';
import {
    personagemService,
    type Personagem,
} from '../../services/personagem.service';

import type { AnimeData } from '../../types/AnimeData';

export const Home = () => {
    const [animes, setAnimes] = useState<AnimeData[]>([]);
    const [personagens, setPersonagens] = useState<Personagem[]>([]);

    const [loading, setLoading] = useState(true);
    const [loadingPersonagens, setLoadingPersonagens] = useState(true);

    const [error, setError] = useState(false);
    const [personagemError, setPersonagemError] = useState(false);

    useEffect(() => {
        const loadAnimes = async () => {
            try {
                setLoading(true);
                setError(false);

                const response = await animeService.listarAnimes();

                setAnimes(response.items ?? []);
            } catch {
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        loadAnimes();
    }, []);

    useEffect(() => {
        const loadPersonagens = async () => {
            try {
                setLoadingPersonagens(true);
                setPersonagemError(false);

                const response = await personagemService.listarPersonagens();

                const items = Array.isArray(response)
                    ? response
                    : response.items ?? [];

                setPersonagens(items.slice(0, 4));
            } catch {
                setPersonagemError(true);
            } finally {
                setLoadingPersonagens(false);
            }
        };

        loadPersonagens();
    }, []);

    const featuredAnimes = animes.slice(0, 3);
    const trackedAnime = animes[0];

    const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/+$/, '');

    const normalizeImageSrc = (value?: string | null) => {
        if (!value) return null;
        if (/^https?:\/\//i.test(value)) return value;

        const cleaned = String(value).trim().replace(/^(?:\.\.\/)+/, '').replace(/^\/+/, '');

        return `${apiBase}/${cleaned}`.replace(/\\/g, '/');
    };

    return (
        <Page>
            <Hero>
                <HeroLeft>
                    <Eyebrow>
                        Central de Anime
                    </Eyebrow>

                    <Title>
                        Seu universo de animes, organizado em um só lugar.
                    </Title>

                    <Subtitle>
                        Descubra novas obras, organize sua lista pessoal,
                        registre episódios assistidos e acompanhe suas
                        estatísticas em tempo real.
                    </Subtitle>

                    <CTAGroup>
                        <PrimaryCTA
                            as={Link}
                            to="/explorar"
                        >
                            Explorar animes
                        </PrimaryCTA>

                        <SecondaryCTA
                            as={Link}
                            to="/ranking"
                        >
                            Ver ranking da comunidade
                        </SecondaryCTA>
                    </CTAGroup>

                    <Counters aria-label="Estatísticas do catálogo">
                        <Counter>
                            <CounterNumber>
                                {loading ? '—' : animes.length}
                            </CounterNumber>

                            <Tiny>
                                Animes catalogados
                            </Tiny>
                        </Counter>

                        <Counter>
                            <CounterNumber>
                                —
                            </CounterNumber>

                            <Tiny>
                                Episódios marcados
                            </Tiny>
                        </Counter>

                        <Counter>
                            <CounterNumber>
                                —
                            </CounterNumber>

                            <Tiny>
                                Usuários ativos
                            </Tiny>
                        </Counter>
                    </Counters>
                </HeroLeft>

                <HeroRight>
                    {loading && (
                        <TrackerCard>
                            <LoadingCard>
                                <Tiny>
                                    Carregando catálogo...
                                </Tiny>
                            </LoadingCard>
                        </TrackerCard>
                    )}

                    {!loading && error && (
                        <TrackerCard>
                            <ErrorMessage>
                                Não foi possível carregar os animes.
                            </ErrorMessage>
                        </TrackerCard>
                    )}

                    {!loading && !error && trackedAnime && (
                        <TrackerCard>
                            <TrackerHeader>
                                <TrackerHeaderInfo>
                                    <Tiny>
                                        Anime em destaque
                                    </Tiny>

                                    <TrackerTitle>
                                        {trackedAnime.titulo}
                                    </TrackerTitle>
                                </TrackerHeaderInfo>

                                <TrackerSync>
                                    Disponível
                                </TrackerSync>
                            </TrackerHeader>

                            <TrackerAnime>
                                {trackedAnime.capaUrl && (
                                    <TrackerImage
                                        src={trackedAnime.capaUrl}
                                        alt={trackedAnime.titulo}
                                    />
                                )}

                                <TrackerContent>
                                    <TrackerDescription>
                                        {trackedAnime.sinopse}
                                    </TrackerDescription>

                                    <TrackerMeta>
                                        <TrackerMetaItem>
                                            {trackedAnime.tipo}
                                        </TrackerMetaItem>

                                        <TrackerMetaItem>
                                            {trackedAnime.quantidadeEpisodios}{' '}
                                            episódios
                                        </TrackerMetaItem>

                                        <TrackerMetaItem>
                                            {trackedAnime.ano}
                                        </TrackerMetaItem>
                                    </TrackerMeta>

                                    <TrackerStatus>
                                        Disponível no catálogo
                                    </TrackerStatus>
                                </TrackerContent>
                            </TrackerAnime>
                        </TrackerCard>
                    )}

                    {!loading && !error && !trackedAnime && (
                        <TrackerCard>
                            <EmptyState>
                                <EmptyText>
                                    Nenhum anime encontrado.
                                </EmptyText>
                            </EmptyState>
                        </TrackerCard>
                    )}
                </HeroRight>
            </Hero>

            {!loading && !error && featuredAnimes.length > 0 && (
                <FeaturedSection>
                    <FeaturedHeader>
                        <FeaturedHeading>
                            <FeaturedLabel>
                                Catálogo
                            </FeaturedLabel>

                            <FeaturedTitle>
                                Animes em destaque
                            </FeaturedTitle>
                        </FeaturedHeading>

                        <CatalogLink
                            as={Link}
                            to="/animes"
                        >
                            Ver catálogo
                        </CatalogLink>
                    </FeaturedHeader>

                    <AnimeGrid>
                        {featuredAnimes.map((anime) => (
                            <AnimeCard key={anime.id}>
                                <AnimeLink
                                    as={Link}
                                    to={`/animes/${anime.id}`}
                                >
                                    <AnimeImage
                                        src={anime.capaUrl}
                                        alt={anime.titulo}
                                    />

                                    <AnimeInfo>
                                        <AnimeTitle>
                                            {anime.titulo}
                                        </AnimeTitle>

                                        <AnimeMeta>
                                            <AnimeMetaItem>
                                                {anime.tipo}
                                            </AnimeMetaItem>

                                            <AnimeMetaItem>
                                                {anime.quantidadeEpisodios}{' '}
                                                episódios
                                            </AnimeMetaItem>

                                            <AnimeMetaItem>
                                                {anime.ano}
                                            </AnimeMetaItem>
                                        </AnimeMeta>
                                    </AnimeInfo>
                                </AnimeLink>
                            </AnimeCard>
                        ))}
                    </AnimeGrid>
                </FeaturedSection>
            )}

            <PersonagemSection>
                <PersonagemHeader>
                    <PersonagemHeading>
                        <PersonagemLabel>
                            Universo
                        </PersonagemLabel>

                        <PersonagemTitle>
                            Personagens em destaque
                        </PersonagemTitle>
                    </PersonagemHeading>

                    <CatalogLink
                        as={Link}
                        to="/personagens"
                    >
                        Ver personagens
                    </CatalogLink>
                </PersonagemHeader>

                {loadingPersonagens && (
                    <LoadingCard>
                        <Tiny>
                            Carregando personagens...
                        </Tiny>
                    </LoadingCard>
                )}

                {!loadingPersonagens && personagemError && (
                    <ErrorMessage>
                        Não foi possível carregar os personagens.
                    </ErrorMessage>
                )}

                {!loadingPersonagens &&
                    !personagemError &&
                    personagens.length > 0 && (
                        <PersonagemGrid>
                            {personagens.map((personagem) => (
                                <PersonagemCard key={personagem.id}>
                                    <PersonagemLink
                                        as={Link}
                                        to={`/personagens/${personagem.id}`}
                                    >
                                        <PersonagemImage
                                            src={
                                                normalizeImageSrc(personagem.imagem) ??
                                                '/placeholder/personagem.png'
                                            }
                                            alt={personagem.nome}
                                        />

                                        <PersonagemInfo>
                                            <PersonagemName>
                                                {personagem.nome}
                                            </PersonagemName>

                                            <PersonagemAnime>
                                                Personagem
                                            </PersonagemAnime>
                                        </PersonagemInfo>
                                    </PersonagemLink>
                                </PersonagemCard>
                            ))}
                        </PersonagemGrid>
                    )}

                {!loadingPersonagens &&
                    !personagemError &&
                    personagens.length === 0 && (
                        <EmptyState>
                            <EmptyText>
                                Nenhum personagem encontrado.
                            </EmptyText>
                        </EmptyState>
                    )}
            </PersonagemSection>
        </Page>
    );
};