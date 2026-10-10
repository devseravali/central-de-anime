import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { animeService } from '../../services/anime.service';
import { favoritoService } from '../../services/favorito.service';
import { userService } from '../../services/user.service';
import { AnimeInfo } from '../../components/anime/AnimeInfo/AnimeInfo';
import { AnimeStats } from '../../components/anime/AnimeStats/AnimeStats';
import { EpisodioItem } from '../../components/anime/EpisodioItem/EpisodioItem';
import type { AnimeData } from '../../types/AnimeData';
import {
    DetalhesAnimeContainer,
    FigureImage,
    FigureContainer,
    DetalhesH1,
    SectionInfo,
    InfoColumn,
    DetalhesContent,
    CoverWrapper,
    SectionBlock,
    DetalhesH2,
    DetalhesParagraph,
    FavoriteButton,
    FavoriteFeedback,
    ArticleDetalhes,
    DetalhesHeader,
    ErrorDetalhes,
    LoadingDetalhes,
    NoDataDetalhes,
    DetalhesPersonagem,
} from './DetalhesAnimeStyle';
import { PersonagemCard } from '../../components/anime/PersonagemCard/PersonagemCard';
import usePersonagens from '../../hooks/UsePersonagens/UsePersonagens';

export const DetalhesAnime = () => {
    const { id } = useParams<{ id: string }>();

    const [anime, setAnime] =
        useState<AnimeData | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

    const [isFavorite, setIsFavorite] =
        useState(false);

    const [favoriteLoading, setFavoriteLoading] =
        useState(false);

    const [favoriteError, setFavoriteError] =
        useState<string | null>(null);

    const [usuarioId, setUsuarioId] =
        useState<number | null>(null);

    useEffect(() => {
        if (!id) {
            return;
        }

        const animeId = Number(id);

        if (!Number.isInteger(animeId) || animeId <= 0) {
            return;
        }

        let mounted = true;

        const fetchAnime = async () => {
            setLoading(true);
            setError(null);

            try {
                const data =
                    await animeService.buscarAnime(animeId);

                if (mounted) {
                    setAnime(data);
                }
            } catch (err: unknown) {
                if (!mounted) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Erro ao buscar anime.'
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchAnime();

        return () => {
            mounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (!id) {
            return;
        }

        const animeId = Number(id);

        if (!Number.isInteger(animeId) || animeId <= 0) {
            return;
        }

        let mounted = true;

        const fetchFavoriteState = async () => {
            try {
                const perfil = await userService.buscarMeuPerfil();
                const currentUserId = Number(perfil?.id);

                if (!mounted) {
                    return;
                }

                if (!Number.isInteger(currentUserId) || currentUserId <= 0) {
                    setUsuarioId(null);
                    setIsFavorite(false);
                    return;
                }

                setUsuarioId(currentUserId);

                const favoritesResponse =
                    await favoritoService.AnimesFavoritos(currentUserId);

                if (!mounted) {
                    return;
                }

                const favorites = Array.isArray(favoritesResponse)
                    ? favoritesResponse
                    : [];

                setIsFavorite(
                    favorites.some(
                        (item) => Number(item?.id) === animeId
                    )
                );
            } catch {
                if (mounted) {
                    setUsuarioId(null);
                    setIsFavorite(false);
                }
            }
        };

        fetchFavoriteState();

        return () => {
            mounted = false;
        };
    }, [id]);

    const animeId = Number(id);

    const handleToggleFavorite = async () => {
        if (!Number.isInteger(animeId) || animeId <= 0) {
            return;
        }

        if (!usuarioId) {
            setFavoriteError('Faça login para atualizar os favoritos.');
            return;
        }

        try {
            setFavoriteError(null);
            setFavoriteLoading(true);

            if (isFavorite) {
                await favoritoService.Desfavoritar(animeId);
            } else {
                await favoritoService.Favoritar(animeId);
            }

            setIsFavorite((previous) => !previous);
        } catch {
            setFavoriteError('Não foi possível atualizar favorito agora.');
        } finally {
            setFavoriteLoading(false);
        }
    };

    const { data: personagens, loading: loadingPersonagens, error: errorPersonagens } =
        usePersonagens({ animeId: animeId, enabled: Boolean(animeId) });

    if (!id || !Number.isInteger(animeId) || animeId <= 0) {
        return (
            <ErrorDetalhes>
                Erro: ID do anime inválido.
            </ErrorDetalhes>
        );
    }

    if (loading) {
        return (
            <LoadingDetalhes>
                Carregando...
            </LoadingDetalhes>
        );
    }

    if (error) {
        return (
            <ErrorDetalhes>
                Erro: {error}
            </ErrorDetalhes>
        );
    }

    if (!anime) {
        return (
            <NoDataDetalhes>
                Anime não encontrado.
            </NoDataDetalhes>
        );
    }

    const estudioExibicao =
        anime.estudio ||
        (anime.estudioId
            ? `ID ${anime.estudioId}`
            : 'Desconhecido');

    return (
        <DetalhesAnimeContainer>
            <ArticleDetalhes>
                <DetalhesHeader>
                    <DetalhesH1>
                        {anime.titulo}
                    </DetalhesH1>
                </DetalhesHeader>

                <DetalhesContent>
                    <CoverWrapper>
                        <FigureContainer>
                            <FigureImage
                                src={anime.capaUrl}
                                alt={anime.titulo}
                            />
                        </FigureContainer>
                    </CoverWrapper>

                    <InfoColumn>
                        <SectionInfo
                            aria-labelledby="informacoes-anime"
                        >
                            <AnimeInfo
                                temporada={anime.temporada}
                                ano={anime.ano}
                                status={anime.status}
                                estacao={anime.estacao}
                                generos={anime.generos}
                            />

                            <AnimeStats
                                quantidadeEpisodios={
                                    anime.quantidadeEpisodios
                                }
                            />
                        </SectionInfo>

                        <SectionBlock
                            aria-labelledby="estudio-anime"
                        >
                            <DetalhesH2 id="estudio-anime">
                                Estúdio
                            </DetalhesH2>

                            <DetalhesParagraph>
                                {estudioExibicao}
                            </DetalhesParagraph>
                        </SectionBlock>

                        <SectionBlock
                            aria-labelledby="sinopse-anime"
                        >
                            <DetalhesH2 id="sinopse-anime">
                                Sinopse
                            </DetalhesH2>

                            <DetalhesParagraph>
                                {anime.sinopse}
                            </DetalhesParagraph>
                        </SectionBlock>

                        <SectionBlock
                            aria-labelledby="favorito-anime"
                        >
                            <DetalhesH2 id="favorito-anime">
                                Favorito
                            </DetalhesH2>

                            <FavoriteButton
                                type="button"
                                onClick={() => {
                                    void handleToggleFavorite();
                                }}
                                aria-pressed={isFavorite}
                                disabled={favoriteLoading}
                            >
                                {favoriteLoading
                                    ? 'Atualizando...'
                                    : isFavorite
                                        ? 'Remover dos favoritos'
                                        : 'Adicionar aos favoritos'}
                            </FavoriteButton>

                            {favoriteError && (
                                <FavoriteFeedback>
                                    {favoriteError}
                                </FavoriteFeedback>
                            )}
                        </SectionBlock>
                    </InfoColumn>
                </DetalhesContent>
            </ArticleDetalhes>

            <EpisodioItem animeId={anime.id} />

            <SectionBlock aria-labelledby="personagens-anime">
                <DetalhesH2 id="personagens-anime">Personagens</DetalhesH2>

                {loadingPersonagens ? (
                    <DetalhesParagraph>Carregando personagens...</DetalhesParagraph>
                ) : errorPersonagens ? (
                    <ErrorDetalhes>Erro: {errorPersonagens}</ErrorDetalhes>
                ) : personagens && personagens.length > 0 ? (
                    <DetalhesPersonagem>
                        {personagens.map((p) => (
                            <PersonagemCard
                                key={String(p.id ?? p.nome)}
                                id={p.id}
                                nome={String(p.nome ?? 'Personagem')}
                                imagem={String(p.imagem ?? '/placeholder/personagem.png')}
                            />
                        ))}
                    </DetalhesPersonagem>
                ) : (
                    <DetalhesParagraph>Nenhum personagem encontrado.</DetalhesParagraph>
                )}
            </SectionBlock>
        </DetalhesAnimeContainer>
    );
};