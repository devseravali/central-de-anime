import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const MainContainer = styled.main`
    width: min(1240px, 100% - 2rem);
    margin: 0 auto;
    padding: 1.25rem 0 2rem;

    display: grid;
    gap: 1rem;
`;

export const CharacterGrid = styled.section`
    position: relative;
    z-index: 1;

    display: grid;
    grid-template-columns: minmax(270px, 360px) minmax(0, 1fr);
    gap: 1rem;
`;

export const CharacterPanel = styled.section`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;

    align-items: stretch;

    > :nth-child(3),
    > :nth-child(4) {
        grid-column: 1 / -1;
    }
`;

export const TopNavigation = styled.nav`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;

    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) =>
        theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.bodyMedium.fontSize};

    a {
        color: inherit;
        text-decoration: none;
        transition: color 180ms ease;
    }

    a:hover {
        color: ${({ theme }) => theme.colors.cyan};
    }

    strong {
        color: ${({ theme }) => theme.colors.textPrimary};
        font-weight: 600;
    }
`;

export const Hero = styled.section`
    position: relative;
    overflow: hidden;

    display: grid;

    padding: 0.75rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 14px;

    background: linear-gradient(
        160deg,
        ${({ theme }) => theme.colors.surfaceElevated} 0%,
        ${({ theme }) => theme.colors.surface} 60%,
        ${({ theme }) => theme.colors.background} 100%
    );
`;

export const Glow = styled.span`
    position: absolute;
    inset: -60px -40px auto auto;

    width: 260px;
    height: 260px;

    pointer-events: none;

    border-radius: 50%;

    background: radial-gradient(
        circle,
        rgba(99, 102, 241, 0.18) 0%,
        rgba(6, 182, 212, 0.14) 42%,
        rgba(0, 0, 0, 0) 70%
    );
`;

export const HeroImageWrap = styled.figure`
    position: relative;

    min-height: 420px;
    margin: 0;

    overflow: hidden;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: 12px;

    background: ${({ theme }) => theme.colors.surface};
`;

export const CharacterImage = styled.img`
    display: block;

    width: 100%;
    height: 100%;
    min-height: inherit;

    object-fit: cover;
`;

export const MetaBadge = styled.figcaption`
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 2;

    padding: 0.3rem 0.7rem;

    border: 1px solid rgba(6, 182, 212, 0.35);
    border-radius: 999px;

    background: rgba(6, 182, 212, 0.2);
    color: ${({ theme }) => theme.colors.cyan};

    font-family: ${({ theme }) =>
        theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelSmall.fontSize};
    letter-spacing: ${({ theme }) =>
        theme.typography.labelSmall.letterSpacing};
    text-transform: uppercase;
`;

export const HeroContent = styled.article`
    display: grid;
    align-content: start;
    gap: 0.8rem;

    padding: 0.4rem;
`;

export const SectionTag = styled.span`
    width: fit-content;

    padding: 0.2rem 0.6rem;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: 999px;

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) =>
        theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelSmall.fontSize};
    letter-spacing: ${({ theme }) =>
        theme.typography.labelSmall.letterSpacing};
    text-transform: uppercase;
`;

export const HeroTitle = styled.h1`
    margin: 0;

    font-family: ${({ theme }) =>
        theme.typography.display.fontFamily};
    font-size: clamp(2rem, 5vw, 3.15rem);
    line-height: 1;
    letter-spacing: -0.02em;
`;

export const HeroSubtitle = styled.p`
    margin: 0;

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) =>
        theme.typography.bodyLarge.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.bodyLarge.fontSize};
`;

export const DetailGrid = styled.dl`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.65rem;

    margin: 0;
`;

export const DetailCard = styled.div`
    display: grid;
    align-content: start;
    gap: 0.3rem;

    min-width: 0;
    padding: 0.7rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;

    background: ${({ theme }) => theme.colors.surfaceFloating};
`;

export const DetailLabel = styled.dt`
    color: ${({ theme }) => theme.colors.textMuted};

    font-family: ${({ theme }) =>
        theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelSmall.fontSize};
    letter-spacing: ${({ theme }) =>
        theme.typography.labelSmall.letterSpacing};
    text-transform: uppercase;
`;

export const DetailValue = styled.dd`
    margin: 0;

    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) =>
        theme.typography.bodyMediumStrong.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.bodyMediumStrong.fontSize};
    line-height: ${({ theme }) =>
        theme.typography.bodyMediumStrong.lineHeight};
`;

export const DetailButton = styled.button`
    width: 100%;

    padding: 0.4rem 0.6rem;

    border: 0;
    border-radius: 8px;

    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};

    font-family: ${({ theme }) =>
        theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelLarge.fontSize};

    cursor: pointer;

    transition:
        transform 160ms ease,
        background-color 160ms ease;

    &:hover {
        transform: translateY(-1px);
        background: ${({ theme }) =>
            theme.colors.primaryHover};
    }

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

export const FavoriteFeedback = styled.small`
    display: block;
    margin-top: 0.4rem;

    color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CharacterSection = styled.section`
    display: grid;
    align-content: start;
    gap: 0.75rem;

    min-width: 0;
    padding: 0.9rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 12px;

    background: ${({ theme }) => theme.colors.surface};
`;

export const Heading = styled.h2`
    margin: 0;

    font-family: ${({ theme }) =>
        theme.typography.headlineMedium.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.headlineMedium.fontSize};
    line-height: ${({ theme }) =>
        theme.typography.headlineMedium.lineHeight};
`;

export const BioCard = styled.article`
    display: grid;

    padding: 0.85rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;

    background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const BioText = styled.p`
    margin: 0;

    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.6;
    white-space: pre-wrap;
`;

export const TraitList = styled.ul`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, max-content));
    gap: 0.5rem;

    margin: 0;
    padding: 0;

    list-style: none;
`;

export const TraitChip = styled.li`
    padding: 0.3rem 0.65rem;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: 999px;

    background: ${({ theme }) => theme.colors.surfaceElevated};

    font-family: ${({ theme }) =>
        theme.typography.labelMedium.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelMedium.fontSize};
`;

export const MetricList = styled.ul`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem 1rem;

    margin: 0;
    padding: 0;

    list-style: none;
`;

export const MetricItem = styled.li`
    display: grid;
    gap: 0.35rem;

    min-width: 0;
`;

export const MetricHeader = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.5rem;

    min-width: 0;

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) =>
        theme.typography.bodyMedium.fontFamily};
    font-size: 0.78rem;
    line-height: 1.2;
`;

export const MetricValue = styled.span`
    color: ${({ theme }) => theme.colors.cyan};

    font-family: ${({ theme }) =>
        theme.typography.metric.fontFamily};
    font-size: 0.75rem;
    font-weight: 600;
`;

export const Progress = styled.progress`
    display: block;

    width: 100%;
    height: 5px;

    border: 0;
    border-radius: 999px;

    overflow: hidden;

    appearance: none;

    &::-webkit-progress-bar {
        border-radius: 999px;
        background: ${({ theme }) =>
            theme.colors.surfaceElevated};
    }

    &::-webkit-progress-value {
        border-radius: 999px;

        background: linear-gradient(
            90deg,
            ${({ theme }) => theme.colors.primary} 0%,
            ${({ theme }) => theme.colors.cyan} 100%
        );

        transition: width 340ms
            cubic-bezier(0.2, 0.9, 0.2, 1);
    }

    &::-moz-progress-bar {
        border-radius: 999px;

        background: linear-gradient(
            90deg,
            ${({ theme }) => theme.colors.primary} 0%,
            ${({ theme }) => theme.colors.cyan} 100%
        );
    }
`;


export const RelatedGrid = styled.section`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.8rem;
`;

export const RelatedCard = styled(Link)`
    display: grid;
    grid-template-rows: auto auto auto;

    min-width: 0;
    overflow: hidden;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;

    background: ${({ theme }) => theme.colors.surfaceElevated};

    text-decoration: none;

    transition:
        transform 170ms ease,
        border-color 170ms ease;

    &:hover {
        transform: translateY(-2px);
        border-color: ${({ theme }) =>
            theme.colors.primary};
    }
`;

export const RelatedImage = styled.img`
    display: block;

    width: 100%;
    height: auto;

    background: ${({ theme }) => theme.colors.surface};
`;

export const RelatedName = styled.p`
    margin: 0;
    padding: 0.65rem 0.7rem 0.25rem;

    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) =>
        theme.typography.bodyMediumStrong.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.bodyMediumStrong.fontSize};
    line-height: ${({ theme }) =>
        theme.typography.bodyMediumStrong.lineHeight};
`;

export const RelatedRole = styled.p`
    margin: 0;
    padding: 0 0.7rem 0.75rem;

    color: ${({ theme }) => theme.colors.textMuted};

    font-family: ${({ theme }) =>
        theme.typography.labelMedium.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelMedium.fontSize};
`;

export const StateShell = styled.main`
    width: min(1240px, 100% - 2rem);
    margin: 0 auto;
    padding: 1.25rem 0;

    display: grid;
`;

export const ErrorState = styled.section`
    display: grid;
    place-items: center;

    padding: 1rem;

    border: 1px solid ${({ theme }) => theme.colors.danger};
    border-radius: 10px;

    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.danger};

    text-align: center;
`;

export const EmptyState = styled.section`
    display: grid;
    place-items: center;

    padding: 1rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;

    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textSecondary};

    text-align: center;
`;