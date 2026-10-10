import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { favoritoService } from '../../services/favorito.service';
import {
    personagemService,
    type Personagem,
} from '../../services/personagem.service';
import { userService } from '../../services/user.service';
import {
    BioCard,
    BioText,
    CharacterGrid,
    CharacterImage,
    CharacterPanel,
    CharacterSection,
    DetailButton,
    DetailCard,
    DetailGrid,
    DetailLabel,
    DetailValue,
    EmptyState,
    ErrorState,
    FavoriteFeedback,
    Glow,
    Heading,
    Hero,
    HeroContent,
    HeroImageWrap,
    HeroSubtitle,
    HeroTitle,
    MainContainer,
    MetaBadge,
    MetricHeader,
    MetricItem,
    MetricList,
    MetricValue,
    Progress,
    RelatedCard,
    RelatedGrid,
    RelatedImage,
    RelatedName,
    RelatedRole,
    SectionTag,
    StateShell,
    TopNavigation,
} from './DetalhesPersonagensStyle';

const MISSING_TEXT = 'Não informado';

const normalizeText = (
    value: string | number | null | undefined
): string => {
    if (value === null || value === undefined) {
        return MISSING_TEXT;
    }

    const text = String(value).trim();

    return text.length > 0 ? text : MISSING_TEXT;
};

const toAbsoluteImage = (
    value: string | null | undefined,
    fallbackOrigin: string
): string => {
    if (!value) {
        return '/placeholder/personagem.png';
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    const normalized = value.startsWith('/') ? value : `/${value}`;

    return `${fallbackOrigin}${normalized}`;
};

const buildCombatMetrics = (personagemId: number) => {
    const base = Number.isFinite(personagemId)
        ? personagemId
        : 1;

    return [
        {
            label: 'Poder ofensivo',
            value: 72 + (base % 26),
        },
        {
            label: 'Controle tático',
            value: 68 + ((base * 3) % 29),
        },
        {
            label: 'Resistência',
            value: 64 + ((base * 5) % 33),
        },
        {
            label: 'Velocidade',
            value: 70 + ((base * 7) % 27),
        },
        {
            label: 'Técnica',
            value: 74 + ((base * 2) % 25),
        },
        {
            label: 'Potencial',
            value: 78 + ((base * 4) % 23),
        },
    ];
};

export const DetalhesPersonagens = () => {
    const { id } = useParams<{ id: string }>();

    const [personagem, setPersonagem] =
        useState<Personagem | null>(null);

    const [related, setRelated] = useState<Personagem[]>([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [isFavorite, setIsFavorite] = useState(false);

    const [favoriteLoading, setFavoriteLoading] = useState(false);

    const [favoriteError, setFavoriteError] =
        useState<string | null>(null);

    const [usuarioId, setUsuarioId] =
        useState<number | null>(null);

    const personagemId = Number(id);

    const validId =
        Number.isInteger(personagemId) && personagemId > 0;

    const backendOrigin = useMemo(() => {
        const apiUrl = import.meta.env.VITE_API_URL;

        try {
            if (apiUrl) {
                return new URL(apiUrl).origin;
            }

            return window.location.origin;
        } catch {
            return window.location.origin;
        }
    }, []);

    useEffect(() => {
        if (!validId) {
            return;
        }

        let mounted = true;

        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const [personagemData, personagensData] =
                    await Promise.all([
                        personagemService.listarPersonagensPorId(
                            personagemId
                        ),
                        personagemService.listarPersonagens(),
                    ]);

                if (!mounted) {
                    return;
                }

                setPersonagem(personagemData as Personagem);

                const relacionados = Array.isArray(
                    personagensData
                )
                    ? (personagensData as Personagem[])
                          .filter(
                              (item) =>
                                  item.id !== personagemId
                          )
                          .slice(0, 4)
                    : [];

                setRelated(relacionados);

                try {
                    const perfil =
                        await userService.buscarMeuPerfil();

                    const currentUserId = Number(perfil?.id);

                    if (
                        !Number.isInteger(currentUserId) ||
                        currentUserId <= 0
                    ) {
                        setUsuarioId(null);
                        setIsFavorite(false);
                        return;
                    }

                    setUsuarioId(currentUserId);

                    const favoritosResponse =
                        await favoritoService.PersonagensFavoritos(
                            currentUserId
                        );

                    const favoritos = Array.isArray(
                        favoritosResponse
                    )
                        ? favoritosResponse
                        : [];

                    setIsFavorite(
                        favoritos.some(
                            (item) =>
                                Number(item?.id) ===
                                personagemId
                        )
                    );
                } catch {
                    setUsuarioId(null);
                    setIsFavorite(false);
                }
            } catch (err: unknown) {
                if (!mounted) {
                    return;
                }

                setError(
                    err instanceof Error
                        ? err.message
                        : 'Erro ao carregar personagem.'
                );
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            mounted = false;
        };
    }, [personagemId, validId]);

    if (!validId) {
        return (
            <StateShell>
                <ErrorState>
                    ID de personagem inválido.
                </ErrorState>
            </StateShell>
        );
    }

    if (loading) {
        return (
            <StateShell>
                <EmptyState>
                    Carregando detalhes do personagem...
                </EmptyState>
            </StateShell>
        );
    }

    if (error) {
        return (
            <StateShell>
                <ErrorState>
                    Erro ao carregar personagem: {error}
                </ErrorState>
            </StateShell>
        );
    }

    if (!personagem) {
        return (
            <StateShell>
                <EmptyState>
                    Personagem não encontrado.
                </EmptyState>
            </StateShell>
        );
    }

    const portrait = toAbsoluteImage(
        personagem.imagem,
        backendOrigin
    );

    const metrics = buildCombatMetrics(personagemId);

    const nome = normalizeText(personagem.nome);

    const handleToggleFavorite = async () => {
        if (!usuarioId) {
            setFavoriteError(
                'Faça login para atualizar os favoritos.'
            );
            return;
        }

        try {
            setFavoriteError(null);
            setFavoriteLoading(true);

            if (isFavorite) {
                await favoritoService.DesfavoritarPersonagem(
                    personagemId
                );
            } else {
                await favoritoService.FavoritarPersonagem(
                    personagemId
                );
            }

            setIsFavorite((previous) => !previous);
        } catch {
            setFavoriteError(
                'Não foi possível atualizar favorito agora.'
            );
        } finally {
            setFavoriteLoading(false);
        }
    };

    return (
        <MainContainer>
            <TopNavigation aria-label="Navegação estrutural">
                <Link to="/explorar">Início</Link>

                <span aria-hidden="true">/</span>

                <Link to="/explorar">Personagens</Link>

                <span aria-hidden="true">/</span>

                <strong>{nome}</strong>
            </TopNavigation>

            <Hero>
                <Glow />

                <CharacterGrid>
                    <HeroImageWrap>
                        <MetaBadge>
                            {normalizeText(personagem.papel)}
                        </MetaBadge>

                        <CharacterImage
                            src={portrait}
                            alt={`Imagem de ${nome}`}
                        />
                    </HeroImageWrap>

                    <HeroContent>
                        <SectionTag>
                            Personagem principal
                        </SectionTag>

                        <HeroTitle>{nome}</HeroTitle>

                        <HeroSubtitle>
                            Afiliado a{' '}
                            {normalizeText(personagem.afiliacao)}
                        </HeroSubtitle>

                        <DetailGrid>
                            <DetailCard>
                                <DetailLabel>
                                    Afiliação
                                </DetailLabel>

                                <DetailValue>
                                    {normalizeText(
                                        personagem.afiliacao
                                    )}
                                </DetailValue>
                            </DetailCard>

                            <DetailCard>
                                <DetailLabel>
                                    Idade inicial
                                </DetailLabel>

                                <DetailValue>
                                    {normalizeText(
                                        personagem.idade_inicial
                                    )}{' '}
                                    anos
                                </DetailValue>
                            </DetailCard>

                            <DetailCard>
                                <DetailLabel>
                                    Altura inicial
                                </DetailLabel>

                                <DetailValue>
                                    {normalizeText(
                                        personagem.altura_inicial
                                    )}
                                </DetailValue>
                            </DetailCard>

                            <DetailCard>
                                <DetailLabel>
                                    Aniversário
                                </DetailLabel>

                                <DetailValue>
                                    {normalizeText(
                                        personagem.aniversario
                                    )}
                                </DetailValue>
                            </DetailCard>

                            <DetailCard>
                                <DetailLabel>Sexo</DetailLabel>

                                <DetailValue>
                                    {normalizeText(personagem.sexo)}
                                </DetailValue>
                            </DetailCard>

                            <DetailCard>
                                <DetailLabel>
                                    Favorito
                                </DetailLabel>

                                <DetailValue>
                                    <DetailButton
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
                                    </DetailButton>

                                    {favoriteError && (
                                        <FavoriteFeedback>
                                            {favoriteError}
                                        </FavoriteFeedback>
                                    )}
                                </DetailValue>
                            </DetailCard>
                        </DetailGrid>
                    </HeroContent>
                </CharacterGrid>
            </Hero>

            <CharacterPanel>
                <CharacterSection>
                    <Heading>Biografia oficial</Heading>

                    <BioCard>
                        <BioText>
                            {normalizeText(personagem.sobre)}
                        </BioText>
                    </BioCard>
                </CharacterSection>

                <CharacterSection>
                    <Heading>Nível de poder em combate</Heading>

                    <MetricList>
                        {metrics.map((metric) => {
                            const bounded = Math.max(
                                0,
                                Math.min(metric.value, 100)
                            );

                            const labelId = `metric-${metric.label
                                .replace(/\s+/g, '-')
                                .toLowerCase()}`;

                            return (
                                <MetricItem key={metric.label}>
                                    <MetricHeader>
                                        <span id={labelId}>
                                            {metric.label}
                                        </span>

                                        <MetricValue>
                                            {bounded}/100
                                        </MetricValue>
                                    </MetricHeader>

                                    <Progress
                                        aria-labelledby={labelId}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                        aria-valuenow={bounded}
                                        value={bounded}
                                        max={100}
                                    />
                                </MetricItem>
                            );
                        })}
                    </MetricList>
                </CharacterSection>

                <CharacterSection>
                    <Heading>Personagens relacionados</Heading>

                    {related.length === 0 ? (
                        <EmptyState>
                            Não há personagens relacionados
                            disponíveis no momento.
                        </EmptyState>
                    ) : (
                        <RelatedGrid>
                            {related.map((item) => {
                                const relatedName =
                                    normalizeText(item.nome);

                                return (
                                    <RelatedCard
                                        key={item.id}
                                        to={`/personagens/${item.id}`}
                                    >
                                        <RelatedImage
                                            src={toAbsoluteImage(
                                                item.imagem,
                                                backendOrigin
                                            )}
                                            alt={`Imagem de ${relatedName}`}
                                        />

                                        <RelatedName>
                                            {relatedName}
                                        </RelatedName>

                                        <RelatedRole>
                                            {normalizeText(
                                                item.papel
                                            )}
                                        </RelatedRole>
                                    </RelatedCard>
                                );
                            })}
                        </RelatedGrid>
                    )}
                </CharacterSection>
            </CharacterPanel>
        </MainContainer>
    );
};