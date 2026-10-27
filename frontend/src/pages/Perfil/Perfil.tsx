import { Edit3, Share2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useProfileData } from '../../hooks/UseProfileData/useProfileData';
import { useAvatarImage } from '../../hooks/UseAvatarImage/useAvatarImage';
import { getApiOrigin } from '../../utils/apiUrl';

import {
    ActionButton,
    Avatar,
    BadgeCard,
    BadgeDesc,
    BadgeName,
    BadgesGrid,
    BadgeRow,
    BadgeTag,
    Container,
    GenreItem,
    GenreList,
    GenreName,
    GenreValue,
    Hero,
    HeroActions,
    HeroBanner,
    HeroContent,
    Identity,
    IdentityRow,
    LevelCard,
    LevelTop,
    Meta,
    Name,
    Page,
    Panel,
    PanelTitle,
    Progress,
    ProgressFill,
    Section,
    SectionHeader,
    SectionHeading,
    SectionKicker,
    SectionTitle,
    StatCard,
    StatLabel,
    StatSub,
    StatusBadge,
    StatValue,
    GridStats,
    TwoColumn,
    SpanError,
} from './PerfilStyle';

const normalizeMediaUrl = (value: string | null | undefined): string | null => {
    if (!value) {
        return null;
    }

    const normalized = value.trim();

    if (!normalized) {
        return null;
    }

    if (/^https?:\/\//i.test(normalized)) {
        return normalized;
    }

    const origin = getApiOrigin();

    if (!origin) {
        return normalized;
    }

    const relative = normalized
        .replace(/\\/g, '/')
        .replace(/^(?:\.\.\/)+/, '')
        .replace(/^\/+/, '');

    return `${origin}/${relative}`;
};

export const Perfil = () => {
    const navigate = useNavigate();
    const {
        loading,
        errorMessage,
        hasPartialData,
        nome,
        email,
        avatar,
        status,
        pontosArquivo,
        totalFavoritosAnimes,
        totalFavoritosPersonagens,
        episodiosConcluidos,
        totalProgressos,
        conquistas,
        totalConquistasDesbloqueadas,
    } = useProfileData();
    const [bannerPerfil, setBannerPerfil] = useState<string | null>(() => {
        return normalizeMediaUrl(localStorage.getItem('userProfileBanner'));
    });

    useEffect(() => {
        const syncBanner = () => {
            setBannerPerfil(normalizeMediaUrl(localStorage.getItem('userProfileBanner')));
        };

        syncBanner();
        window.addEventListener('user-banner-updated', syncBanner);

        return () => {
            window.removeEventListener('user-banner-updated', syncBanner);
        };
    }, []);

    const metaPerfil = useMemo(() => {
        const emailLabel = email || 'e-mail indisponível';
        return `${emailLabel}`;
    }, [email]);
    const avatarImage = useAvatarImage(normalizeMediaUrl(avatar) ?? undefined);

    const statCards = useMemo(() => {
        return [
            {
                label: 'Registros',
                value: String(totalProgressos),
                sub: 'Entradas no logbook',
            },
            {
                label: 'Concluídos',
                value: String(episodiosConcluidos),
                sub: 'Episódios finalizados',
            },
            {
                label: 'Favoritos',
                value: String(totalFavoritosAnimes + totalFavoritosPersonagens),
                sub: `${totalFavoritosAnimes} animes + ${totalFavoritosPersonagens} personagens`,
            },
            {
                label: 'Ranking',
                value: pontosArquivo !== null ? pontosArquivo.toLocaleString('pt-BR') : '—',
                sub: 'Pontos acumulados',
            },
        ];
    }, [episodiosConcluidos, pontosArquivo, totalFavoritosAnimes, totalFavoritosPersonagens, totalProgressos]);

    return (
        <Page as="main" aria-labelledby="perfil-titulo-principal">
            <Container>
                <Hero as="header">
                    <HeroBanner aria-hidden="true" $imageUrl={bannerPerfil} />

                    <HeroContent>
                        <IdentityRow>
                            <Avatar
                                src={avatarImage.src}
                                alt="Avatar do usuário"
                                onError={avatarImage.onError}
                            />

                            <Identity>
                                <Name id="perfil-titulo-principal">{loading ? 'Carregando...' : nome}</Name>
                                <Meta>{metaPerfil}</Meta>

                                <BadgeRow aria-label="Status do perfil">
                                    <StatusBadge as="li">{status}</StatusBadge>
                                    <StatusBadge as="li">
                                        {loading
                                            ? 'Carregando dados'
                                            : hasPartialData
                                              ? 'Dados parciais'
                                              : errorMessage
                                                ? 'Dados indisponíveis'
                                                : 'Dados sincronizados'}
                                    </StatusBadge>
                                </BadgeRow>
                            </Identity>
                        </IdentityRow>

                        <HeroActions aria-label="Ações do perfil">
                            <ActionButton onClick={() => navigate('/editar-perfil')}>
                                <Edit3 size={16} />
                                Editar perfil
                            </ActionButton>

                            <ActionButton $variant="secondary">
                                <Share2 size={16} />
                                Compartilhar
                            </ActionButton>
                        </HeroActions>
                    </HeroContent>
                </Hero>

                <LevelCard as="section" aria-label="Progresso de nível">
                    <LevelTop>
                        <span>Progresso no ranking</span>
                        <strong>{pontosArquivo !== null ? `${pontosArquivo.toLocaleString('pt-BR')} pts` : 'Sem dados'}</strong>
                    </LevelTop>
                    <Progress>
                        <ProgressFill $value={pontosArquivo !== null ? Math.min(100, Math.max(0, (pontosArquivo / 10000) * 100)) : 0} />
                    </Progress>
                </LevelCard>

                {errorMessage && (
                    <LevelCard
                        as="section"
                        aria-label="Erro no carregamento do perfil"
                        role="alert"
                    >
                        <LevelTop>
                            <SpanError>{errorMessage}</SpanError>
                        </LevelTop>
                    </LevelCard>
                )}

                <Section aria-labelledby="indicadores-arquivo">
                    <SectionHeader>
                        <SectionHeading>
                            <SectionKicker>Visão geral</SectionKicker>
                            <SectionTitle id="indicadores-arquivo">Indicadores da sua conta</SectionTitle>
                        </SectionHeading>
                    </SectionHeader>

                    <GridStats>
                        {statCards.map((item) => (
                            <StatCard as="li" key={item.label}>
                                <StatLabel>{item.label}</StatLabel>
                                <StatValue>{item.value}</StatValue>
                                <StatSub>{item.sub}</StatSub>
                            </StatCard>
                        ))}
                    </GridStats>
                </Section>

                <TwoColumn>
                    <Panel as="section" aria-labelledby="generos-afinidade">
                        <PanelTitle as="h3" id="generos-afinidade">
                            Resumo
                        </PanelTitle>

                        <GenreList aria-label="Mapa de afinidade por gênero">
                            <GenreItem>
                                <GenreName>Animes favoritados</GenreName>
                                <GenreValue>{totalFavoritosAnimes}</GenreValue>
                            </GenreItem>

                            <GenreItem>
                                <GenreName>Personagens favoritados</GenreName>
                                <GenreValue>{totalFavoritosPersonagens}</GenreValue>
                            </GenreItem>

                            <GenreItem>
                                <GenreName>Episódios concluídos</GenreName>
                                <GenreValue>{episodiosConcluidos}</GenreValue>
                            </GenreItem>
                        </GenreList>
                    </Panel>
                </TwoColumn>

                <Section aria-labelledby="conquistas-badges">
                    <SectionHeader>
                        <SectionTitle id="conquistas-badges">
                            Conquistas e badges
                        </SectionTitle>
                    </SectionHeader>

                    <BadgesGrid>
                        {conquistas.length > 0 ? (
                            conquistas.map((conquista) => {
                                const percent = Number(conquista.progress?.percent ?? 0);
                                const current = Number(conquista.progress?.current ?? 0);
                                const target = Number(conquista.progress?.target ?? 0);

                                return (
                                    <BadgeCard as="li" key={conquista.id}>
                                        <BadgeTag>{conquista.unlocked ? 'Desbloqueada' : 'Em progresso'}</BadgeTag>
                                        <BadgeName>{conquista.nome}</BadgeName>
                                        <BadgeDesc>{conquista.descricao}</BadgeDesc>
                                        <BadgeDesc>
                                            Progresso: {current}/{target} ({Math.max(0, Math.min(100, percent))}%)
                                        </BadgeDesc>
                                    </BadgeCard>
                                );
                            })
                        ) : (
                            <BadgeCard as="li">
                                <BadgeTag>Sem dados</BadgeTag>
                                <BadgeName>Nenhuma conquista encontrada</BadgeName>
                                <BadgeDesc>
                                    Continue assistindo episodios e favoritando conteudos para desbloquear badges.
                                </BadgeDesc>
                            </BadgeCard>
                        )}
                    </BadgesGrid>

                    {conquistas.length > 0 && (
                        <BadgeDesc>
                            {totalConquistasDesbloqueadas} de {conquistas.length} conquistas desbloqueadas.
                        </BadgeDesc>
                    )}
                </Section>
            </Container>
        </Page>
    );
};