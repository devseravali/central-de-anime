import styled, { css } from 'styled-components';

export const Page = styled.section`
    width: min(1240px, 100% - 2rem);
    margin: 0 auto;
    padding: 1.5rem 0 2.7rem;
    display: grid;
    gap: 1rem;
`;

export const Hero = styled.section`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.1rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 16px;
    background:
        radial-gradient(1200px 280px at 96% -40%, rgba(99, 102, 241, 0.18), transparent),
        radial-gradient(900px 220px at -10% 130%, rgba(6, 182, 212, 0.14), transparent),
        ${({ theme }) => theme.colors.surface};

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        align-items: stretch;
        flex-direction: column;
    }
`;

export const HeroContent = styled.div`
    min-width: 0;
`;

export const HeroEyebrow = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    width: fit-content;
    padding: 0.34rem 0.75rem;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: 999px;
    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    letter-spacing: ${({ theme }) => theme.typography.labelSmall.letterSpacing};
    text-transform: uppercase;
`;

export const HeroTitle = styled.h1`
    margin-top: 0.55rem;
    font-family: ${({ theme }) => theme.typography.headlineExtraLarge.fontFamily};
    font-size: clamp(2rem, 5vw, 2.5rem);
    font-weight: ${({ theme }) => theme.typography.headlineExtraLarge.fontWeight};
    letter-spacing: ${({ theme }) => theme.typography.headlineExtraLarge.letterSpacing};
    line-height: 1.05;
`;

export const Span = styled.span`
    color: ${({ theme }) => theme.colors.textPrimary};
`;

export const MetaText = styled.span`
    color: ${({ theme }) => theme.colors.textSecondary};
    overflow-wrap: anywhere;
`;

export const MetaValue = styled.strong`
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 600;
`;

export const ProgressRowText = styled.span`
    color: ${({ theme }) => theme.colors.textMuted};
`;

export const HeroSubtitle = styled.p`
    max-width: 68ch;
    margin-top: 0.45rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyLarge.fontSize};
`;

export const ActionGroup = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        flex-wrap: wrap;
    }
`;

export const ActionButton = styled.button<{ $variant?: 'ghost' }>`
    min-height: 40px;
    padding: 0.56rem 0.9rem;
    border-radius: 10px;
    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    transition:
        transform 140ms ease,
        background-color 140ms ease,
        color 140ms ease,
        box-shadow 140ms ease;

    ${({ $variant, theme }) =>
        $variant === 'ghost'
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

                  &:hover {
                      transform: translateY(-1px);
                  }
              `}

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
`;

export const StatsGrid = styled.section`
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0.7rem;

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr;
    }
`;

export const StatDescription = styled.div`
    margin: 0;
    padding: 0;
`;

export const StatCard = styled.article<{ $highlight?: boolean }>`
    display: grid;
    gap: 0.25rem;
    min-width: 0;
    padding: 0.85rem;
    border: 1px solid ${({ theme, $highlight }) => ($highlight ? theme.colors.primary : theme.colors.border)};
    border-radius: 14px;
    background: ${({ theme, $highlight }) =>
        $highlight
            ? `linear-gradient(165deg, ${theme.colors.surface} 0%, rgba(99, 102, 241, 0.09) 100%)`
            : theme.colors.surface};
`;

export const StatLabel = styled.span`
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    letter-spacing: ${({ theme }) => theme.typography.labelSmall.letterSpacing};
    text-transform: uppercase;
`;

export const StatValue = styled.strong`
    font-family: ${({ theme }) => theme.typography.headlineMedium.fontFamily};
    font-size: clamp(1.05rem, 2.8vw, 1.45rem);
    font-weight: ${({ theme }) => theme.typography.headlineMedium.fontWeight};
`;

export const MainLayout = styled.section`
    display: grid;
    grid-template-columns: minmax(0, 1.9fr) minmax(290px, 1fr);
    gap: 0.85rem;
    align-items: start;

    @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

export const ItemSection = styled.section`
    display: grid;
    gap: 0.7rem;
`;

export const FilterBar = styled.form`
    display: grid;
    gap: 0.6rem;
    padding: 0.8rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 14px;
    background: ${({ theme }) => theme.colors.surface};
`;

export const Tabs = styled.div`
    display: flex;
    align-items: center;
    gap: 0.4rem;
    overflow-x: auto;
    padding-bottom: 0.15rem;
`;

export const Tab = styled.button<{ $active?: boolean }>`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    padding: 0.44rem 0.75rem;
    border: 1px solid ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.border)};
    border-radius: 999px;
    color: ${({ theme, $active }) => ($active ? theme.colors.white : theme.colors.textSecondary)};
    background: ${({ theme, $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
    white-space: nowrap;
    font-family: ${({ theme }) => theme.typography.labelMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelMedium.fontWeight};
`;

export const TabCount = styled.span`
    padding: 0.14rem 0.45rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    font-size: 0.68rem;
`;

export const FilterGroup = styled.div`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 0.55rem;

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        grid-template-columns: minmax(0, 1fr);
    }
`;

export const FilterInput = styled.input`
    min-height: 42px;
    padding: 0.7rem 0.9rem;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.input};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }
`;

export const Select = styled.select`
    min-height: 42px;
    padding: 0.7rem 0.9rem;
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.input};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
`;

export const EmptyState = styled.div`
    padding: 1.3rem;
    border: 1px dashed ${({ theme }) => theme.colors.borderStrong};
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
    background: ${({ theme }) => theme.colors.surface};
`;

export const AuthGateCard = styled.section`
    display: grid;
    gap: 0.8rem;
    padding: 1.2rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 14px;
    background: ${({ theme }) => theme.colors.surface};
`;

export const AuthGateTitle = styled.h2`
    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
    color: ${({ theme }) => theme.colors.textPrimary};
`;

export const AuthGateText = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const AuthGateActions = styled.div`
    display: flex;
    gap: 0.65rem;
    flex-wrap: wrap;
`;

export const AuthGateLink = styled.a<{ $variant?: 'secondary' }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 40px;
    padding: 0.56rem 0.9rem;
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

export const List = styled.div`
    display: grid;
    gap: 0.65rem;
`;

export const ItemCard = styled.article`
    display: grid;
    grid-template-columns: 94px minmax(0, 1fr);
    gap: 0.75rem;
    padding: 0.72rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 14px;
    background: ${({ theme }) => theme.colors.surface};
    min-width: 0;

    &:hover {
        border-color: ${({ theme }) => theme.colors.borderHover};
    }

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        grid-template-columns: 64px minmax(0, 1fr);
    }
`;

export const Poster = styled.div`
    position: relative;
    display: grid;
    place-items: center;
    width: 94px;
    height: 130px;
    border-radius: 12px;
    color: ${({ theme }) => theme.colors.white};
    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
    background:
        linear-gradient(150deg, rgba(99, 102, 241, 0.95) 0%, rgba(6, 182, 212, 0.78) 100%),
        radial-gradient(60px 60px at 20% 30%, rgba(255, 255, 255, 0.35), transparent);

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        width: 64px;
        height: 90px;
    }
`;

export const PosterBadge = styled.span`
    position: absolute;
    top: 0.35rem;
    left: 0.35rem;
    padding: 0.14rem 0.3rem;
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.92);
    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: 0.58rem;
    letter-spacing: 0.03em;
`;

export const ItemContent = styled.div`
    display: grid;
    gap: 0.45rem;
    min-width: 0;
`;

export const CardHeader = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 0.8rem;

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        flex-wrap: wrap;
    }
`;

export const CardInfo = styled.div`
    min-width: 0;
`;

export const CardMeta = styled.span<{ $tone?: 'info' | 'success' | 'muted' }>`
    display: inline-flex;
    width: fit-content;
    padding: 0.16rem 0.5rem;
    border-radius: 999px;

    background: ${({ $tone }) => {
        if ($tone === 'success') {
            return 'rgba(16, 185, 129, 0.16)';
        }

        if ($tone === 'info') {
            return 'rgba(99, 102, 241, 0.14)';
        }

        return 'rgba(148, 163, 184, 0.14)';
    }};

    color: ${({ theme, $tone }) => {
        if ($tone === 'success') {
            return theme.colors.success;
        }

        if ($tone === 'info') {
            return theme.colors.primary;
        }

        return theme.colors.textSecondary;
    }};

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    letter-spacing: ${({ theme }) => theme.typography.labelSmall.letterSpacing};
    text-transform: uppercase;
`;

export const CardTitle = styled.h3`
    margin-top: 0.3rem;
    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
`;

export const CardDescription = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    overflow-wrap: anywhere;
`;

export const CounterGroup = styled.div`
    display: inline-flex;
    align-items: center;
    gap: 0.32rem;
    padding: 0.25rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.surfaceElevated};
    flex-shrink: 0;
`;

export const CounterButton = styled.button`
    width: 30px;
    height: 30px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 1rem;
    font-weight: 700;
`;

export const CounterText = styled.span`
    min-width: 92px;
    text-align: center;
    font-family: ${({ theme }) => theme.typography.metric.fontFamily};
    font-size: ${({ theme }) => theme.typography.metric.fontSize};
`;

export const ItemMeta = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.7rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};

    @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
        flex-wrap: wrap;
    }
`;

export const CardProgress = styled.div`
    display: grid;
    gap: 0.3rem;
`;

export const StatRow = styled.div`
    display: flex;
    justify-content: space-between;
    color: ${({ theme }) => theme.colors.textMuted};
    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    gap: 0.5rem;
    flex-wrap: wrap;
`;

export const ProgressRail = styled.div`
    width: 100%;
    height: 8px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.surfaceElevated};
`;

export const ProgressBar = styled.div<{ $value: number }>`
    width: ${({ $value }) => `${$value}%`};
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.cyan});
    transition: width 200ms ease;

    @media (prefers-reduced-motion: reduce) {
        transition: none;
    }
`;

export const ItemFooter = styled.div`
    display: flex;
    justify-content: flex-end;
`;

export const RightPanel = styled.aside`
    display: grid;
    gap: 0.65rem;
`;

export const SidebarContent = styled.div`
    min-width: 0;
`;

export const SidebarCard = styled.section`
    display: grid;
    gap: 0.55rem;
    padding: 0.85rem;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 14px;
    background: ${({ theme }) => theme.colors.surface};
`;

export const SidebarTitle = styled.h4`
    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
`;

export const SidebarText = styled.p`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
`;

export const Grid = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.7rem;
    align-items: center;
`;

export const WeeklyGoalCircle = styled.div<{ $value: number }>`
    width: 76px;
    height: 76px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background:
        radial-gradient(circle, ${({ theme }) => theme.colors.surface} 58%, transparent 59%),
        conic-gradient(
            ${({ theme }) => theme.colors.success} ${({ $value }) => `${$value}%`},
            ${({ theme }) => theme.colors.surfaceElevated} ${({ $value }) => `${$value}%`} 100%
        );
    font-family: ${({ theme }) => theme.typography.metric.fontFamily};
    font-size: ${({ theme }) => theme.typography.metric.fontSize};
    font-weight: ${({ theme }) => theme.typography.metric.fontWeight};
`;

export const WeeklyGoalLegend = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0.6rem;
    border-radius: 10px;
    background: ${({ theme }) => theme.colors.surfaceElevated};
    font-family: ${({ theme }) => theme.typography.labelMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelMedium.fontSize};
`;

export const WeekBars = styled.div`
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    align-items: end;
    gap: 0.35rem;
    height: 72px;
`;


export const WeekBarItem = styled.div`
    height: 100%;
    display: flex;
    align-items: end;
`;

export const WeekBar = styled.div<{ $height: number }>`
    width: 100%;
    height: ${({ $height }) => `${$height}%`};
    border-radius: 999px;
    background: linear-gradient(180deg, ${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.cyan});
`;

export const WeekMeta = styled.div`
    display: flex;
    justify-content: space-between;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
`;

export const StrongText = styled.strong`
    color: ${({ theme }) => theme.colors.textPrimary};
`;