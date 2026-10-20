import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const Page = styled.main`
    min-height: calc(100vh - 220px);
    padding: ${({ theme }) => theme.spacing.page.mobile};

    display: grid;
    place-items: center;
`;

export const Card = styled.article`
    width: min(960px, 100%);
    padding: clamp(1.25rem, 3vw, 2.5rem);

    border-radius: ${({ theme }) => theme.radii.container};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    background:
        radial-gradient(
            circle at 50% -10%,
            rgba(6, 182, 212, 0.18),
            rgba(6, 182, 212, 0) 45%
        ),
        ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.interactive};

    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`;

export const HeroHeader = styled.header`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.85rem;
`;

export const Badge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;

    border-radius: ${({ theme }) => theme.radii.badge};
    padding: 0.35rem 0.7rem;

    background: rgba(6, 182, 212, 0.1);
    color: ${({ theme }) => theme.colors.cyan};

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelSmall.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelSmall.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.labelSmall.letterSpacing};
    text-transform: uppercase;
`;

export const HeroCode = styled.p`
    margin: 0;

    color: ${({ theme }) => theme.colors.primary};
    font-family: ${({ theme }) => theme.typography.display.fontFamily};
    font-size: clamp(4.2rem, 13vw, 7rem);
    font-weight: ${({ theme }) => theme.typography.display.fontWeight};
    line-height: 0.9;
    letter-spacing: -0.05em;
`;

export const HeroCodeAccent = styled.span`
    color: ${({ theme }) => theme.colors.cyan};
`;

export const Title = styled.h1`
    margin: 0;
    text-align: center;

    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.typography.headlineExtraLarge.fontFamily};
    font-size: clamp(1.75rem, 5vw, 3rem);
    font-weight: ${({ theme }) => theme.typography.headlineExtraLarge.fontWeight};
    line-height: 1.15;
`;

export const Description = styled.p`
    width: min(70ch, 100%);
    margin: 0.9rem auto 0;
    text-align: center;

    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyLarge.lineHeight};
`;

export const SearchForm = styled.form`
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
`;

export const SearchLabel = styled.label`
    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};
`;

export const SearchField = styled.div`
    display: flex;
    align-items: center;
    gap: 0.6rem;

    min-height: 56px;
    padding: 0.5rem;

    border-radius: ${({ theme }) => theme.radii.card};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surfaceElevated};

    @media (max-width: 840px) {
        flex-wrap: wrap;
    }
`;

export const HeroIcon = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    color: ${({ theme }) => theme.colors.textMuted};
    margin-left: 0.15rem;
`;

export const SearchInput = styled.input`
    flex: 1;
    min-width: 0;

    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }
`;

export const SearchHint = styled.small`
    padding: 0.25rem 0.45rem;
    border-radius: 6px;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.textMuted};

    font-family: ${({ theme }) => theme.typography.labelMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelMedium.lineHeight};

    @media (max-width: 840px) {
        display: none;
    }
`;

export const SearchButton = styled.button`
    min-height: 42px;
    padding: 0.6rem 1.1rem;

    border-radius: ${({ theme }) => theme.radii.button};
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};

    &:hover {
        background: ${({ theme }) => theme.colors.primaryHover};
    }

    @media (max-width: 840px) {
        width: 100%;
    }
`;

export const Actions = styled.nav`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;

    @media (max-width: 840px) {
        grid-template-columns: 1fr;
    }
`;

const actionLinkStyles = css`
    min-height: 48px;
    border-radius: ${({ theme }) => theme.radii.button};
    border: 1px solid transparent;
    padding: 0.65rem 0.95rem;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};
`;

export const MainActionLink = styled(Link)`
    ${actionLinkStyles}

    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};

    &:hover {
        background: ${({ theme }) => theme.colors.primaryHover};
    }
`;

export const SecondaryActionLink = styled(Link)`
    ${actionLinkStyles}

    background: ${({ theme }) => theme.colors.surfaceElevated};
    border-color: ${({ theme }) => theme.colors.borderStrong};
    color: ${({ theme }) => theme.colors.textPrimary};

    &:hover {
        border-color: ${({ theme }) => theme.colors.borderHover};
    }
`;

export const Subtitle = styled.p`
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    color: ${({ theme }) => theme.colors.textSecondary};
    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

export const StatusDot = styled.span`
    width: 0.55rem;
    height: 0.55rem;
    border-radius: ${({ theme }) => theme.radii.avatar};
    background: ${({ theme }) => theme.colors.success};
`;

export const FooterActions = styled.nav`
    margin-top: 0.85rem;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
`;

export const FooterLink = styled(Link)`
    color: ${({ theme }) => theme.colors.textMuted};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};

    &:hover {
        color: ${({ theme }) => theme.colors.textPrimary};
    }
`;
