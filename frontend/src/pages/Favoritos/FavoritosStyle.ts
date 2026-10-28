import styled, { css } from 'styled-components';

export const Page = styled.div`
    width: min(1240px, 100% - 2rem);
    margin: 0 auto;
    padding: 1.4rem 0 2.8rem;

    display: grid;
    gap: 1.1rem;
`;

export const Hero = styled.section`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(260px, 360px);
    gap: 1rem;
`;

export const HeroMain = styled.div`
    display: grid;
    gap: 0.55rem;
`;

export const Eyebrow = styled.span`
    width: fit-content;
    padding: 0.3rem 0.75rem;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: 999px;

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    letter-spacing: ${({ theme }) => theme.typography.labelSmall.letterSpacing};
    text-transform: uppercase;
`;

export const Title = styled.h1`
    font-family: ${({ theme }) => theme.typography.headlineExtraLarge.fontFamily};
    font-size: clamp(1.95rem, 4.6vw, 2.35rem);
    font-weight: ${({ theme }) => theme.typography.headlineExtraLarge.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.headlineExtraLarge.letterSpacing};
    line-height: 1.03;
`;

export const Subtitle = styled.p`
    max-width: 64ch;

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.bodyLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyLarge.fontSize};
`;

export const Stats = styled.aside`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.65rem;

    padding: 0.75rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 14px;

    background: ${({ theme }) => theme.colors.surface};
`;

export const StatCard = styled.div`
    display: grid;
    align-content: start;
    gap: 0.12rem;

    min-width: 0;
    padding: 0.55rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;

    background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const StatValue = styled.strong`
    font-family: ${({ theme }) => theme.typography.metric.fontFamily};
    font-size: clamp(0.95rem, 2.3vw, 1.15rem);
    font-weight: ${({ theme }) => theme.typography.metric.fontWeight};
    font-variant-numeric: tabular-nums;
`;

export const StatLabel = styled.span`
    color: ${({ theme }) => theme.colors.textMuted};

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
`;

export const Toolbar = styled.section`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: center;
    gap: 0.65rem;

    @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
        grid-template-columns: auto minmax(180px, 1fr) auto auto auto;

        & > * {
            grid-column: auto;
        }
    }
`;

export const Segmented = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;

    width: fit-content;
    max-width: 100%;
    padding: 0.24rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 999px;

    background: ${({ theme }) => theme.colors.surface};
`;

export const SegmentButton = styled.button<{ $active?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;

    min-height: 34px;
    padding: 0.35rem 0.75rem;

    border-radius: 999px;

    color: ${({ theme, $active }) =>
        $active ? theme.colors.white : theme.colors.textSecondary};
    background: ${({ theme, $active }) =>
        $active ? theme.colors.primary : 'transparent'};

    font-family: ${({ theme }) => theme.typography.labelMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelMedium.fontWeight};

    transition:
        background-color 160ms ease,
        color 160ms ease,
        transform 160ms ease;

    &:hover {
        transform: translateY(-1px);
    }
`;

export const SegmentCount = styled.span`
    padding: 0.12rem 0.4rem;

    border-radius: 999px;

    background: rgba(255, 255, 255, 0.14);

    font-size: 0.66rem;
`;

export const SearchField = styled.input`
    width: 100%;
    min-width: 0;
    min-height: 42px;
    padding: 0.72rem 0.95rem;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.input};

    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }

    &:focus {
        border-color: ${({ theme }) => theme.colors.primary};
        box-shadow: ${({ theme }) => theme.shadows.primaryGlow};
    }
`;

const controlBase = css`
    min-height: 42px;
    padding: 0.7rem 0.9rem;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.input};

    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const Select = styled.select`
    ${controlBase};
    min-width: 0;
`;

export const ViewMode = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;

    width: fit-content;
    padding: 0.25rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;

    background: ${({ theme }) => theme.colors.surface};
`;

export const ViewButton = styled.button<{ $active?: boolean }>`
    min-width: 36px;
    min-height: 32px;
    padding: 0.3rem 0.55rem;

    border-radius: 7px;

    background: ${({ theme, $active }) =>
        $active ? theme.colors.surfaceFloating : 'transparent'};
    color: ${({ theme, $active }) =>
        $active ? theme.colors.textPrimary : theme.colors.textSecondary};
`;

export const SectionHeader = styled.header`
    display: flex;
    align-items: center;
    gap: 0.45rem;

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const SectionTitle = styled.h2`
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
`;

export const Dot = styled.span`
    width: 7px;
    height: 7px;

    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
`;

export const Grid = styled.div<{ $compact?: boolean }>`
    display: grid;
    grid-template-columns: ${({ $compact }) =>
        $compact
            ? 'repeat(auto-fit, minmax(180px, 1fr))'
            : 'repeat(auto-fit, minmax(190px, 1fr))'};
    gap: 0.85rem;
`;

export const AnimeCard = styled.article`
    min-width: 0;
    overflow: hidden;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 13px;

    background: ${({ theme }) => theme.colors.surface};

    transition:
        transform 180ms ease,
        border-color 180ms ease;

    &:hover {
        transform: translateY(-2px);
        border-color: ${({ theme }) => theme.colors.borderHover};
    }
`;

export const Cover = styled.div`
    position: relative;

    aspect-ratio: 3 / 4;

    background: ${({ theme }) => theme.colors.surfaceElevated};

    img {
        width: 100%;
        height: 100%;

        object-fit: cover;
    }
`;

export const Rating = styled.span`
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;

    padding: 0.18rem 0.5rem;

    border: 1px solid ${({ theme }) => theme.colors.imageBadgeBorder};
    border-radius: 999px;

    background: ${({ theme }) => theme.colors.imageBadgeBackground};
    color: ${({ theme }) => theme.colors.cyan};

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
`;

export const FavoriteAction = styled.button`
    position: absolute;
    top: 0.48rem;
    right: 0.48rem;

    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: 28px;
    height: 28px;

    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 999px;

    background: rgba(0, 0, 0, 0.35);
    color: ${({ theme }) => theme.colors.white};

    font-size: 0.88rem;
`;

export const CardBody = styled.div`
    display: grid;
    gap: 0.5rem;

    min-width: 0;
    padding: 0.65rem;
`;

export const Genre = styled.span`
    width: fit-content;
    padding: 0.15rem 0.45rem;

    border-radius: 999px;

    background: ${({ theme }) => theme.colors.surfaceElevated};
    color: ${({ theme }) => theme.colors.textMuted};

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    text-transform: uppercase;
`;

export const CardTitle = styled.h3`
    display: -webkit-box;
    overflow: hidden;

    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;

    min-height: 2.35rem;

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
`;

export const Meta = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    overflow-wrap: anywhere;

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const Status = styled.span`
    color: ${({ theme }) => theme.colors.success};
    overflow-wrap: anywhere;

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
`;

export const EmptyState = styled.div`
    display: grid;
    justify-items: center;
    gap: 0.55rem;

    padding: 2.2rem 1rem;

    border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
    border-radius: 14px;

    background: ${({ theme }) => theme.colors.surface};

    text-align: center;
`;

export const EmptyTitle = styled.h3`
    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
`;

export const EmptyText = styled.p`
    max-width: 48ch;

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const AuthGateActions = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.65rem;
    flex-wrap: wrap;
    margin-top: 0.4rem;
`;

export const AuthGateLink = styled.a<{ $variant?: 'secondary' }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 40px;
    padding: 0.56rem 0.95rem;

    border-radius: 10px;
    text-decoration: none;

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};

    ${({ $variant, theme }) =>
        $variant === 'secondary'
            ? css`
                  border: 1px solid ${theme.colors.borderStrong};
                  background: ${theme.colors.surface};
                  color: ${theme.colors.textSecondary};

                  &:hover {
                      color: ${theme.colors.textPrimary};
                      border-color: ${theme.colors.borderHover};
                  }
              `
            : css`
                  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover});
                  color: ${theme.colors.white};
                  box-shadow: ${theme.shadows.card};
              `}
`;

export const SyncPanel = styled.section`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.9rem;
    flex-wrap: wrap;

    padding: 1rem;

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 14px;

    background: ${({ theme }) => theme.colors.surface};
`;

export const SyncText = styled.div`
    display: grid;
    gap: 0.24rem;
`;

export const SyncTitle = styled.h3`
    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
`;

export const SyncDescription = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const ActionGroup = styled.div`
    display: inline-flex;
    gap: 0.5rem;
    flex-wrap: wrap;
`;

export const ActionButton = styled.button`
    min-height: 40px;
    padding: 0.62rem 0.95rem;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.button};

    background: ${({ theme }) => theme.colors.surfaceElevated};
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
`;