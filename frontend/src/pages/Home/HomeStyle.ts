import styled from 'styled-components';

export const Page = styled.main`
    width: min(1240px, 100% - 2rem);
    margin: 0 auto;
    padding: 1.5rem 0 3rem;

    display: flex;
    flex-direction: column;
    gap: 1.5rem;
`;

export const Hero = styled.section`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 420px;
    gap: 1.5rem;
    align-items: stretch;

    padding: 2rem;

    background: ${({ theme }) => theme.colors.surface};
    border-radius: 16px;
`;

export const HeroLeft = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
`;

export const HeroRight = styled.aside`
    display: flex;
    flex-direction: column;
`;

export const Eyebrow = styled.span`
    width: fit-content;
    padding: 0.35rem 0.75rem;

    border-radius: 999px;
    background: rgba(6, 182, 212, 0.06);

    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) =>
        theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelSmall.fontSize};
    font-weight: 600;
    text-transform: uppercase;
`;

export const Title = styled.h1`
    max-width: 720px;
    margin: 0;

    font-family: ${({ theme }) =>
        theme.typography.display.fontFamily};
    font-size: clamp(2rem, 4.5vw, 3rem);
    line-height: 1.02;
`;

export const Subtitle = styled.p`
    max-width: 56ch;
    margin: 0;

    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
`;

export const Tiny = styled.small`
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
`;

export const CTAGroup = styled.nav`
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;

    margin-top: 0.25rem;
`;

export const PrimaryCTA = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 42px;
    padding: 0.65rem 1rem;

    border-radius: 8px;

    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};

    font-weight: 600;
    text-decoration: none;

    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-2px);
    }
`;

export const SecondaryCTA = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 42px;
    padding: 0.65rem 1rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;

    color: ${({ theme }) => theme.colors.textPrimary};

    font-weight: 600;
    text-decoration: none;

    transition: transform 0.2s ease;

    &:hover {
        transform: translateY(-2px);
    }
`;

export const Counters = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.6rem;

    margin-top: 0.75rem;
`;

export const Counter = styled.div`
    padding: 0.85rem;

    background: ${({ theme }) => theme.colors.surfaceElevated};
    border-radius: 10px;
`;

export const CounterNumber = styled.strong`
    display: block;

    color: ${({ theme }) => theme.colors.primary};
    font-size: 1.15rem;
    font-weight: 700;
`;

export const TrackerCard = styled.article`
    height: 100%;
    padding: 1rem;

    background: ${({ theme }) => theme.colors.surfaceElevated};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;

    box-shadow: 0 8px 28px rgba(2, 6, 23, 0.35);
`;

export const TrackerHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.75rem;
`;

export const TrackerHeaderInfo = styled.div`
    min-width: 0;
`;

export const TrackerTitle = styled.h2`
    margin: 0.2rem 0 0;

    font-size: 1rem;
    line-height: 1.3;
`;

export const TrackerSync = styled.span`
    flex-shrink: 0;

    padding: 0.25rem 0.5rem;

    border-radius: 999px;

    background: rgba(6, 182, 212, 0.08);
    color: ${({ theme }) => theme.colors.primary};

    font-size: 0.7rem;
    font-weight: 600;
`;

export const TrackerAnime = styled.div`
    display: flex;
    gap: 1rem;

    margin-top: 1rem;
`;

export const TrackerImage = styled.img`
    width: 140px;
    height: 200px;

    flex-shrink: 0;

    object-fit: cover;
    border-radius: 10px;

    background: ${({ theme }) => theme.colors.surface};
`;

export const TrackerContent = styled.div`
    flex: 1;
    min-width: 0;
`;

export const TrackerDescription = styled.p`
    margin: 0;

    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.8rem;
    line-height: 1.5;
`;

export const TrackerMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;

    margin-top: 0.7rem;
`;

export const TrackerMetaItem = styled.span`
    padding: 0.2rem 0.45rem;

    border-radius: 5px;

    background: ${({ theme }) => theme.colors.surface};

    color: ${({ theme }) => theme.colors.textSecondary};

    font-size: 0.7rem;
`;

export const TrackerStatus = styled.small`
    display: block;

    margin-top: 0.7rem;

    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.7rem;
`;

export const FeaturedSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const FeaturedHeader = styled.header`
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
`;

export const FeaturedHeading = styled.div`
    display: flex;
    flex-direction: column;
`;

export const FeaturedLabel = styled.small`
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
`;

export const FeaturedTitle = styled.h2`
    margin: 0.25rem 0 0;

    font-size: 1.5rem;
`;

export const CatalogLink = styled.a`
    color: ${({ theme }) => theme.colors.primary};

    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;
`;

export const AnimeGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
`;

export const AnimeCard = styled.article`
    overflow: hidden;

    background: ${({ theme }) => theme.colors.surfaceElevated};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;

    transition:
        transform 0.2s ease,
        border-color 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

export const AnimeLink = styled.a`
    display: block;

    color: inherit;
    text-decoration: none;
`;

export const AnimeImage = styled.img`
    display: block;

    width: 100%;
    aspect-ratio: 16 / 9;

    object-fit: cover;

    background: ${({ theme }) => theme.colors.surface};
`;

export const AnimeInfo = styled.div`
    padding: 0.85rem;
`;

export const AnimeTitle = styled.h3`
    margin: 0;

    overflow: hidden;

    font-size: 1rem;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const AnimeMeta = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    margin-top: 0.4rem;
`;

export const AnimeMetaItem = styled.span`
    color: ${({ theme }) => theme.colors.textSecondary};

    font-size: 0.75rem;
`;

export const LoadingCard = styled.div`
    min-height: 155px;

    display: flex;
    align-items: center;
    justify-content: center;
`;

export const EmptyState = styled.div`
    padding: 2rem;

    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: 12px;

    text-align: center;
`;

export const EmptyText = styled.p`
    margin: 0;

    color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ErrorMessage = styled.p`
    margin: 0;

    color: ${({ theme }) => theme.colors.danger};
`;

export const PersonagemSection = styled.section`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const PersonagemHeader = styled.header`
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 1rem;
`;

export const PersonagemHeading = styled.div`
    display: flex;
    flex-direction: column;
`;

export const PersonagemLabel = styled.small`
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.4;
`;

export const PersonagemTitle = styled.h2`
    margin: 0.25rem 0 0;

    font-size: 1.5rem;
`;

export const PersonagemGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
`;

export const PersonagemCard = styled.article`
    overflow: hidden;

    background: ${({ theme }) => theme.colors.surfaceElevated};
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;

    transition:
        transform 0.2s ease,
        border-color 0.2s ease;

    &:hover {
        transform: translateY(-3px);
        border-color: ${({ theme }) => theme.colors.primary};
    }
`;

export const PersonagemLink = styled.a`
    display: block;

    color: inherit;
    text-decoration: none;
`;

export const PersonagemImage = styled.img`
    display: block;

    width: 100%;
    height: 240px;

    object-fit: cover;

    background: ${({ theme }) => theme.colors.surface};
`;

export const PersonagemInfo = styled.div`
    padding: 0.85rem;
`;

export const PersonagemName = styled.h3`
    margin: 0;

    overflow: hidden;

    font-size: 1rem;
    line-height: 1.3;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const PersonagemAnime = styled.small`
    display: block;

    margin-top: 0.35rem;

    color: ${({ theme }) => theme.colors.textSecondary};
`;