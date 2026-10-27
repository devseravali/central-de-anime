import styled from 'styled-components';

export const Page = styled.section`
    width: 100%;
    min-height: calc(100vh - 220px);

    background:
        radial-gradient(
            900px 320px at 12% 0%,
            ${({ theme }) => theme.colors.primary}22,
            transparent 65%
        ),
        radial-gradient(
            760px 280px at 88% 8%,
            ${({ theme }) => theme.colors.cyan}16,
            transparent 68%
        ),
        ${({ theme }) => theme.colors.background};

    padding: ${({ theme }) => theme.spacing.page.mobile};
`;

export const Container = styled.section`
    width: 100%;
    max-width: 1180px;
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.large};
`;

export const Hero = styled.section`
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.container};
    overflow: hidden;
    box-shadow: ${({ theme }) => theme.shadows.card};
    background: ${({ theme }) => theme.colors.surface};
`;

export const HeroBanner = styled.div<{ $imageUrl?: string | null }>`
    min-height: 168px;
    background:
        linear-gradient(
            145deg,
            ${({ theme, $imageUrl }) => ($imageUrl ? theme.colors.bannerOverlay : theme.colors.surfaceElevated)},
            ${({ theme }) => theme.colors.surface}
        ),
        radial-gradient(
            500px 170px at 20% 0%,
            ${({ theme }) => theme.colors.primary}2f,
            transparent 70%
        )
        ${({ $imageUrl }) => ($imageUrl ? `, url(${$imageUrl})` : '')};
    background-size: cover;
    background-position: center;
`;

export const HeroContent = styled.section`
    margin-top: -52px;
    padding: ${({ theme }) => theme.spacing.section.compact};

    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.medium};
`;

export const IdentityRow = styled.figure`
    display: flex;
    gap: ${({ theme }) => theme.spacing.component.medium};
    align-items: flex-end;

    margin: 0;
`;

export const Avatar = styled.img`
    width: 92px;
    height: 92px;
    border-radius: ${({ theme }) => theme.radii.card};
    border: 2px solid ${({ theme }) => theme.colors.borderStrong};
    object-fit: cover;
    background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const Identity = styled.figcaption`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.compact};

    margin: 0;
`;

export const Name = styled.h1`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.headlineExtraLarge.fontFamily};
    font-size: clamp(1.6rem, 4vw, 2.6rem);
    line-height: 1.1;
`;

export const Meta = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const BadgeRow = styled.ul`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.component.compact};
`;

export const StatusBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    border-radius: ${({ theme }) => theme.radii.badge};
    border: 1px solid ${({ theme }) => theme.colors.success}55;
    background: ${({ theme }) => theme.colors.success}1f;
    color: ${({ theme }) => theme.colors.success};

    padding: 0.3rem 0.6rem;

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelSmall.fontWeight};
`;

export const HeroActions = styled.nav`
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const ActionButton = styled.button<{ $variant?: 'secondary' }>`
    min-height: 42px;
    border-radius: ${({ theme }) => theme.radii.button};
    padding: 0.55rem 1rem;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;

    color: ${({ theme, $variant }) =>
        $variant === 'secondary' ? theme.colors.textPrimary : theme.colors.white};

    border: 1px solid
        ${({ theme, $variant }) =>
            $variant === 'secondary' ? theme.colors.borderStrong : 'transparent'};

    background: ${({ theme, $variant }) =>
        $variant === 'secondary'
            ? theme.colors.surfaceElevated
            : `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};

    &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

export const LevelCard = styled.section`
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.card};
    background: ${({ theme }) => theme.colors.surface};
    padding: ${({ theme }) => theme.spacing.component.medium};

    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.compact};
`;

export const LevelTop = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.component.small};

    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
`;

export const Progress = styled.div`
    width: 100%;
    height: 10px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.surfaceElevated};
    overflow: hidden;
`;

export const ProgressFill = styled.span<{ $value: number }>`
    display: block;
    height: 100%;
    width: ${({ $value }) => `${Math.max(0, Math.min(100, $value))}%`};

    background: linear-gradient(
        90deg,
        ${({ theme }) => theme.colors.cyan},
        ${({ theme }) => theme.colors.primary}
    );
`;

export const Section = styled.section`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.medium};
`;

export const SectionHeader = styled.header`
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const SectionHeading = styled.hgroup`
    margin: 0;
`;

export const SectionTitle = styled.h2`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.headlineLarge.fontFamily};
    font-size: clamp(1.4rem, 2.6vw, 1.95rem);
`;

export const SectionKicker = styled.span`
    color: ${({ theme }) => theme.colors.cyan};
    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.labelLarge.letterSpacing};
`;

export const GridStats = styled.ul`
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing.component.small};

    @media (min-width: 620px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (min-width: 980px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
`;

export const StatCard = styled.article`
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.card};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.card};

    padding: ${({ theme }) => theme.spacing.component.medium};

    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.compact};
`;

export const StatLabel = styled.span`
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    text-transform: uppercase;
    letter-spacing: ${({ theme }) => theme.typography.labelSmall.letterSpacing};
`;

export const StatValue = styled.strong`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.headlineExtraLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineExtraLarge.fontSize};
    line-height: 1;
`;

export const StatSub = styled.span`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const TwoColumn = styled.section`
    display: grid;
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.component.medium};

    @media (min-width: 1000px) {
        grid-template-columns: 1.1fr 1.3fr;
    }
`;

export const Panel = styled.article`
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.card};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.card};

    padding: ${({ theme }) => theme.spacing.component.medium};

    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.medium};
`;

export const PanelTitle = styled.h3`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
`;

export const GenreList = styled.ul`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const GenreItem = styled.li`
    display: grid;
    grid-template-columns: 1fr auto;
    gap: ${({ theme }) => theme.spacing.component.small};
    align-items: center;
`;

export const GenreName = styled.span`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const GenreValue = styled.span`
    color: ${({ theme }) => theme.colors.cyan};
    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
`;

export const BadgesGrid = styled.ul`
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: ${({ theme }) => theme.spacing.component.small};

    @media (min-width: 700px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (min-width: 1020px) {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
`;

export const BadgeCard = styled.li`
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.card};
    background: ${({ theme }) => theme.colors.surface};
    padding: ${({ theme }) => theme.spacing.component.medium};

    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.compact};
`;

export const BadgeTag = styled.span`
    align-self: flex-start;
    border-radius: ${({ theme }) => theme.radii.badge};
    border: 1px solid ${({ theme }) => theme.colors.primary}55;
    background: ${({ theme }) => theme.colors.primary}18;
    color: ${({ theme }) => theme.colors.primary};
    padding: 0.2rem 0.55rem;

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
`;

export const BadgeName = styled.strong`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
`;

export const BadgeDesc = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const SpanError = styled.span`
    color: ${({ theme }) => theme.colors.danger};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;