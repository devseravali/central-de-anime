import { useParams } from 'react-router-dom';
import { resolveAnimeCoverUrl } from '../../utils/animeCoverUrl';
import { AnimeInfo } from '../../components/anime/AnimeInfo/AnimeInfo';
import { AnimeStats } from '../../components/anime/AnimeStats/AnimeStats';
import { useAnimeDetails } from '../../hooks/UseAnimeDetails/useAnimeDetails';
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
import placeholder from '../../assets/placeholder.jpg';
import {
    EpisodiosGrid,
    EpisodioItemContainer,
    EpisodioItemImage,
    EpisodioItemTitle,
    Small,
    EpisodioItemSinopse,
} from '../../components/anime/EpisodioItem/EpisodioStyle';

const apiUrl = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
).replace(/\/+$/, '');

const serverUrl = apiUrl.replace(/\/api\/v1$/, '');

function resolveEpisodioImageUrl(imagemUrl: string): string {
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

export const DetalhesAnime = () => {
    const { id } = useParams<{ id: string }>();
    const animeId = Number(id);
    const {
        anime,
        loading,
        error,
        isFavorite,
        favoriteLoading,
        favoriteError,
        temporadas,
        loadingTemporadas,
        errorTemporadas,
        handleToggleFavorite,
    } = useAnimeDetails(id);

    const { data: personagens, loading: loadingPersonagens, error: errorPersonagens } =
        usePersonagens({
            animeId,
            enabled: Number.isInteger(animeId) && animeId > 0,
        });

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
                                src={resolveAnimeCoverUrl(anime.capaUrl)}
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

            <SectionBlock aria-labelledby="episodios-anime">
                <DetalhesH2 id="episodios-anime">Episodios por temporada</DetalhesH2>

                {loadingTemporadas ? (
                    <DetalhesParagraph>Carregando episodios...</DetalhesParagraph>
                ) : errorTemporadas ? (
                    <ErrorDetalhes>Erro: {errorTemporadas}</ErrorDetalhes>
                ) : temporadas.length > 0 ? (
                    temporadas.map((temporada) => (
                        <SectionBlock
                            key={`${temporada.animeId ?? anime.id}-${temporada.numero}`}
                            aria-label={`Temporada ${temporada.numero}`}
                        >
                            <DetalhesH2>
                                Temporada {temporada.numero} ({temporada.quantidadeEpisodios} episodios)
                            </DetalhesH2>

                            <EpisodiosGrid>
                                {temporada.episodios.map((episodio) => {
                                    const imagemSrc = episodio.imagemUrl
                                        ? resolveEpisodioImageUrl(episodio.imagemUrl)
                                        : placeholder;

                                    return (
                                        <EpisodioItemContainer key={episodio.id}>
                                            <EpisodioItemTitle>{episodio.titulo}</EpisodioItemTitle>
                                            <Small>Ep. {episodio.numero ?? '-'}</Small>
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
                        </SectionBlock>
                    ))
                ) : (
                    <DetalhesParagraph>Nenhum episodio disponivel para este anime.</DetalhesParagraph>
                )}
            </SectionBlock>

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
                                personagem={p}
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