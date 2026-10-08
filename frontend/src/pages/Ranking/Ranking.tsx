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
    RankingAvatar,
    RankingInfo,
    RankingTitle,
    RankingScore,
    RankingList,
    RankingItem,
    RankingPosition,
    RankingName,
    RankingRating,
} from './RankingStyle.ts';
import { useRanking } from '../../hooks/UseRanking/useRanking.ts';

const podiumUsuarios = [
    {
        id: 1,
        name: 'Usuário Exemplo 1',
        subtitle: 'Nível 12',
        points: 942,
    },
    {
        id: 2,
        name: 'Usuário Exemplo 2',
        subtitle: 'Nível 11',
        points: 928,
    },
    {
        id: 3,
        name: 'Usuário Exemplo 3',
        subtitle: 'Nível 10',
        points: 914,
    },
];

const rankedUsuarios = [
    { position: 4, name: 'Nome do Usuário', points: 902 },
    { position: 5, name: 'Nome do Usuário', points: 895 },
    { position: 6, name: 'Nome do Usuário', points: 890 },
    { position: 7, name: 'Nome do Usuário', points: 885 },
    { position: 8, name: 'Nome do Usuário', points: 880 },
    { position: 9, name: 'Nome do Usuário', points: 875 },
    { position: 10, name: 'Nome do Usuário', points: 870 },
];

export const Ranking = () => {
    const { data, isLoading, error } = useRanking();

    const podium = data?.podium?.length ? data.podium : podiumUsuarios;
    const ranking = data?.ranking?.length ? data.ranking : rankedUsuarios;

    if (isLoading) {
        return <RankingContainer>Carregando...</RankingContainer>;
    }

    if (error) {
        return <RankingContainer>Erro ao carregar ranking</RankingContainer>;
    }

    return (
        <RankingContainer>
            <RankingHeader>
                <HeaderContent aria-label="Cabeçalho do ranking">
                    <Brand>
                        <BrandIcon aria-hidden="true" />
                        Ranking
                    </Brand>


                </HeaderContent>
            </RankingHeader>

            <RankingMain>
                <RankingIntroduction>
                    <h1>Ranking Geral</h1>

                    <RankingSubtitle>
                        Pontuação da Comunidade
                    </RankingSubtitle>
                </RankingIntroduction>

                <Section aria-labelledby="podium-title">
                    <SectionTitle id="podium-title">
                        Pódio
                    </SectionTitle>

                    <Podium>
                        {podium.map((usuario) => (
                            <RankingCard key={usuario.id ?? usuario.name}>
                                <RankingAvatar
                                    aria-label={`Avatar de ${usuario.name}`}
                                    role="img"
                                >
                                    Avatar
                                </RankingAvatar>

                                <RankingInfo>
                                    <RankingTitle>
                                        {usuario.name}
                                    </RankingTitle>

                                    <RankingScore>
                                        {usuario.subtitle} — {usuario.points} pts
                                    </RankingScore>
                                </RankingInfo>
                            </RankingCard>
                        ))}
                    </Podium>
                </Section>

                <Section aria-labelledby="ranking-list-title">
                    <SectionTitle id="ranking-list-title">
                        Top 4–10
                    </SectionTitle>

                    <RankingList>
                        {ranking.map((usuario) => (
                            <RankingItem key={usuario.position ?? usuario.name}>
                                <RankingPosition>
                                    {usuario.position ? String(usuario.position).padStart(2, '0') : '--'}
                                </RankingPosition>

                                <RankingName>
                                    {usuario.name}
                                </RankingName>

                                <RankingRating>
                                    {usuario.points} pts
                                </RankingRating>
                            </RankingItem>
                        ))}
                    </RankingList>
                </Section>
            </RankingMain>
        </RankingContainer>
    );
};

export default Ranking;