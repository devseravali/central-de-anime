import { Medal } from 'lucide-react';
import {
    RankingContainer,
    RankingHeader,
    HeaderContent,
    Brand,
    BrandIcon,
    RankingMain,
    RankingIntroduction,
    Section,
    SectionTitle,
    RankingSubtitle,
    Podium,
    RankingCard,
    RankingCover,
    RankingInfo,
    RankingTitle,
    RankingScore,
    RankingList,
    RankingItem,
    RankingPosition,
    RankingName,
    RankingRating,
    RankingLink,
    RankingItemLink,
} from './RankingStyle.ts';
import { useAnimeRanking, usePersonagemRanking } from '../../hooks/UseRanking/useRanking.ts';
import { resolveAnimeCoverUrl } from '../../utils/animeCoverUrl';
import { resolveApiMediaUrl } from '../../utils/mediaUrl';

function toAnimeCoverImage(value: string | null | undefined): string {
    return resolveAnimeCoverUrl(value) || '/placeholder/capa-anime.png';
}

function toAbsoluteImage(value: string | null | undefined): string {
    return resolveApiMediaUrl(value) ?? '/placeholder/capa-anime.png';
}

export const Ranking = () => {
    const animeQuery = useAnimeRanking();
    const personagemQuery = usePersonagemRanking();

    const animePodium = animeQuery.data?.podium ?? [];
    const animeRanking = animeQuery.data?.ranking ?? [];
    const personagemPodium = personagemQuery.data?.podium ?? [];
    const personagemRanking = personagemQuery.data?.ranking ?? [];

    return (
        <RankingContainer>
            <RankingHeader>
                <HeaderContent>
                    <Brand>
                        <BrandIcon aria-hidden="true">
                            <Medal size={18} strokeWidth={2.2} />
                        </BrandIcon>
                        Ranking
                    </Brand>
                </HeaderContent>
            </RankingHeader>

            <RankingMain>
                <RankingIntroduction>
                    <h1>Ranking de Animes e Personagens</h1>

                    <RankingSubtitle>
                        Conteúdos mais favoritados da comunidade
                    </RankingSubtitle>
                </RankingIntroduction>

                <Section aria-labelledby="animes-title">
                    <SectionTitle id="animes-title">Animes</SectionTitle>

                    {animeQuery.isLoading ? (
                        <RankingSubtitle>Carregando ranking de animes...</RankingSubtitle>
                    ) : animeQuery.error ? (
                        <RankingSubtitle>Erro ao carregar ranking de animes.</RankingSubtitle>
                    ) : animePodium.length === 0 && animeRanking.length === 0 ? (
                        <RankingSubtitle>Ainda não há animes suficientes para o ranking.</RankingSubtitle>
                    ) : (
                        <>
                            <Podium>
                                {animePodium.map((anime) => (
                                    <RankingCard key={`anime-${anime.id}`}>
                                        <RankingLink to={`/animes/${anime.id}`} aria-label={`Ver detalhes de ${anime.titulo}`}>
                                            <RankingCover
                                                src={toAnimeCoverImage(anime.capaUrl)}
                                                alt={`Capa de ${anime.titulo}`}
                                            />

                                            <RankingInfo>
                                                <RankingTitle>{anime.titulo}</RankingTitle>

                                                <RankingScore>
                                                    {anime.tipo} • {anime.ano} — {anime.totalFavoritos} favoritos
                                                </RankingScore>
                                            </RankingInfo>
                                        </RankingLink>
                                    </RankingCard>
                                ))}
                            </Podium>

                            <RankingList>
                                {animeRanking.map((anime) => (
                                    <RankingItem key={`anime-${anime.position ?? anime.id}`}>
                                        <RankingItemLink to={`/animes/${anime.id}`} aria-label={`Ver detalhes de ${anime.titulo}`}>
                                            <RankingPosition>
                                                {anime.position ? String(anime.position).padStart(2, '0') : '--'}
                                            </RankingPosition>

                                            <RankingName>{anime.titulo}</RankingName>

                                            <RankingRating>{anime.totalFavoritos} favoritos</RankingRating>
                                        </RankingItemLink>
                                    </RankingItem>
                                ))}
                            </RankingList>
                        </>
                    )}
                </Section>

                <Section aria-labelledby="personagens-title">
                    <SectionTitle id="personagens-title">Personagens</SectionTitle>

                    {personagemQuery.isLoading ? (
                        <RankingSubtitle>Carregando ranking de personagens...</RankingSubtitle>
                    ) : personagemQuery.error ? (
                        <RankingSubtitle>Erro ao carregar ranking de personagens.</RankingSubtitle>
                    ) : personagemPodium.length === 0 && personagemRanking.length === 0 ? (
                        <RankingSubtitle>Ainda não há personagens suficientes para o ranking.</RankingSubtitle>
                    ) : (
                        <>
                            <Podium>
                                {personagemPodium.map((personagem) => (
                                    <RankingCard key={`personagem-${personagem.id}`}>
                                        <RankingLink to={`/personagens/${personagem.id}`} aria-label={`Ver detalhes de ${personagem.nome}`}>
                                            <RankingCover
                                                src={toAbsoluteImage(personagem.imagem)}
                                                alt={`Imagem de ${personagem.nome}`}
                                            />

                                            <RankingInfo>
                                                <RankingTitle>{personagem.nome}</RankingTitle>

                                                <RankingScore>
                                                    {personagem.papel ?? 'Personagem'} — {personagem.totalFavoritos} favoritos
                                                </RankingScore>
                                            </RankingInfo>
                                        </RankingLink>
                                    </RankingCard>
                                ))}
                            </Podium>

                            <RankingList>
                                {personagemRanking.map((personagem) => (
                                    <RankingItem key={`personagem-${personagem.position ?? personagem.id}`}>
                                        <RankingItemLink to={`/personagens/${personagem.id}`} aria-label={`Ver detalhes de ${personagem.nome}`}>
                                            <RankingPosition>
                                                {personagem.position ? String(personagem.position).padStart(2, '0') : '--'}
                                            </RankingPosition>

                                            <RankingName>{personagem.nome}</RankingName>

                                            <RankingRating>{personagem.totalFavoritos} favoritos</RankingRating>
                                        </RankingItemLink>
                                    </RankingItem>
                                ))}
                            </RankingList>
                        </>
                    )}
                </Section>
            </RankingMain>
        </RankingContainer>
    );
};

export default Ranking;
