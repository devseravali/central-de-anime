import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { animeService } from '../../services/anime.service';
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
    ArticleDetalhes,
    DetalhesHeader,
    ErrorDetalhes,
    LoadingDetalhes,
    NoDataDetalhes,
} from './DetalhesAnimeStyle';

export const DetalhesAnime = () => {
    const { id } = useParams<{ id: string }>();

    const [anime, setAnime] =
        useState<AnimeData | null>(null);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState<string | null>(null);

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

    const animeId = Number(id);

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
                    </InfoColumn>
                </DetalhesContent>
            </ArticleDetalhes>

            <EpisodioItem animeId={anime.id} />
        </DetalhesAnimeContainer>
    );
};