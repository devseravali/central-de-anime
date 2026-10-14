import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const AuthPage = styled.section`
    width: 100%;
    min-height: calc(100vh - 220px);

    padding: ${({ theme }) => theme.spacing.page.mobile};

    display: grid;
    place-items: center;

    background:
        radial-gradient(
            1200px 420px at 20% -20%,
            ${({ theme }) => theme.colors.primary}12,
            transparent 60%
        ),
        radial-gradient(
            1000px 380px at 100% 10%,
            ${({ theme }) => theme.colors.cyan}10,
            transparent 65%
        );
`;

export const AuthShell = styled.div`
    width: 100%;
    max-width: 980px;

    display: grid;
    grid-template-columns: 1fr;

    background: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.modal};
    overflow: hidden;
    box-shadow: ${({ theme }) => theme.shadows.interactive};

    @media (min-width: 960px) {
        grid-template-columns: 0.95fr 1.15fr;
    }
`;

export const LeftPanel = styled.aside`
    padding: ${({ theme }) => theme.spacing.section.compact};

    background:
        radial-gradient(
            600px 280px at -10% 20%,
            ${({ theme }) => theme.colors.primary}14,
            transparent 70%
        ),
        linear-gradient(
            165deg,
            ${({ theme }) => theme.colors.surfaceElevated},
            ${({ theme }) => theme.colors.surface}
        );

    border-bottom: 1px solid ${({ theme }) => theme.colors.border};

    @media (min-width: 960px) {
        border-right: 1px solid ${({ theme }) => theme.colors.border};
        border-bottom: 0;
    }
`;

export const Badge = styled.span`
    display: inline-flex;
    align-items: center;

    padding: 0.3rem 0.75rem;
    border-radius: ${({ theme }) => theme.radii.badge};
    border: 1px solid ${({ theme }) => theme.colors.success}55;

    color: ${({ theme }) => theme.colors.success};

    font-family: ${({ theme }) => theme.typography.labelMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelMedium.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.labelMedium.letterSpacing};
    text-transform: uppercase;
`;

export const HeroTitle = styled.h2`
    margin: ${({ theme }) => theme.spacing.component.medium} 0
        ${({ theme }) => theme.spacing.component.small};

    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.headlineLarge.fontFamily};
    font-size: clamp(1.6rem, 3vw, ${({ theme }) => theme.typography.headlineLarge.fontSize});
    font-weight: ${({ theme }) => theme.typography.headlineLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.headlineLarge.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.headlineLarge.letterSpacing};

    span {
        color: ${({ theme }) => theme.colors.primary};
    }
`;

export const HeroText = styled.p`
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

export const Stats = styled.div`
    margin-top: ${({ theme }) => theme.spacing.section.compact};

    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const StatCard = styled.div`
    border-radius: ${({ theme }) => theme.radii.card};
    border: 1px solid ${({ theme }) => theme.colors.border};
    background: ${({ theme }) => theme.colors.surface};

    padding: ${({ theme }) => theme.spacing.component.medium};
`;

export const StatValue = styled.strong`
    display: block;
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
    line-height: ${({ theme }) => theme.typography.headlineSmall.lineHeight};
`;

export const StatLabel = styled.span`
    color: ${({ theme }) => theme.colors.textMuted};

    font-family: ${({ theme }) => theme.typography.labelMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelMedium.lineHeight};
`;

export const RightPanel = styled.article`
    padding: ${({ theme }) => theme.spacing.section.compact};
`;

export const Title = styled.h1`
    margin: 0;

    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.headlineExtraLarge.fontFamily};
    font-size: clamp(2rem, 4vw, ${({ theme }) => theme.typography.headlineExtraLarge.fontSize});
    font-weight: ${({ theme }) => theme.typography.headlineExtraLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.headlineExtraLarge.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.headlineExtraLarge.letterSpacing};
`;

export const Subtitle = styled.p`
    margin: ${({ theme }) => theme.spacing.component.small} 0
        ${({ theme }) => theme.spacing.component.large};

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.bodyLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyLarge.lineHeight};
`;

export const SocialRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const SocialButton = styled.button`
    min-height: 44px;

    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.component.compact};

    border-radius: ${({ theme }) => theme.radii.input};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};

    cursor: default;
`;

export const Divider = styled.div`
    margin: ${({ theme }) => theme.spacing.component.medium} 0;

    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.component.small};

    color: ${({ theme }) => theme.colors.textMuted};

    font-family: ${({ theme }) => theme.typography.labelSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelSmall.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelSmall.lineHeight};
    letter-spacing: ${({ theme }) => theme.typography.labelSmall.letterSpacing};
    text-transform: uppercase;

    &::before,
    &::after {
        content: '';
        height: 1px;
        background: ${({ theme }) => theme.colors.borderStrong};
    }
`;

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.medium};
`;

export const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.compact};
`;

export const FieldLabel = styled.span`
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};
`;

export const FieldControl = styled.div`
    position: relative;
`;

export const FieldInput = styled.input`
    width: 100%;
    min-height: 44px;

    border-radius: ${({ theme }) => theme.radii.input};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};

    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};

    padding: 0.75rem 2.5rem;

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};

    transition:
        border-color 200ms ease,
        box-shadow 200ms ease;

    &:hover:not(:disabled) {
        border-color: ${({ theme }) => theme.colors.borderHover};
    }

    &:focus {
        border-color: ${({ theme }) => theme.colors.primary};
        box-shadow: ${({ theme }) => theme.shadows.primaryGlow};
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${({ theme }) => theme.colors.surfaceElevated};
    }
`;

export const FieldIcon = styled.span`
    position: absolute;
    top: 50%;
    left: 0.85rem;
    transform: translateY(-50%);

    color: ${({ theme }) => theme.colors.textMuted};

    display: inline-flex;
    align-items: center;
`;

export const FieldAction = styled.button`
    position: absolute;
    top: 50%;
    right: 0.55rem;
    transform: translateY(-50%);

    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-width: 32px;
    min-height: 32px;
    border-radius: ${({ theme }) => theme.radii.badge};

    background: transparent;
    color: ${({ theme }) => theme.colors.textMuted};

    &:hover:not(:disabled) {
        color: ${({ theme }) => theme.colors.textPrimary};
        background: ${({ theme }) => theme.colors.surfaceElevated};
    }
`;

export const HelperRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const CheckboxLabel = styled.label`
    display: inline-flex;
    align-items: center;
    gap: ${({ theme }) => theme.spacing.component.compact};

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};

    input {
        accent-color: ${({ theme }) => theme.colors.primary};
    }
`;

export const InlineLinkButton = styled.button`
    padding: 0;

    border: 0;
    background: transparent;

    color: ${({ theme }) => theme.colors.primary};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};

    &:hover {
        color: ${({ theme }) => theme.colors.primaryHover};
    }
`;

export const Message = styled.p<{ $variant: 'success' | 'error' }>`
    margin: 0;
    padding: ${({ theme }) => theme.spacing.component.small}
        ${({ theme }) => theme.spacing.component.medium};

    border-radius: ${({ theme }) => theme.radii.input};
    border: 1px solid
        ${({ theme, $variant }) =>
            $variant === 'error'
                ? theme.colors.danger
                : theme.colors.success};

    color: ${({ theme, $variant }) =>
        $variant === 'error'
            ? theme.colors.danger
            : theme.colors.success};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;

export const SubmitButton = styled.button`
    margin-top: ${({ theme }) => theme.spacing.component.compact};
    min-height: 48px;

    border-radius: ${({ theme }) => theme.radii.input};
    border: 0;

    background: linear-gradient(
        90deg,
        ${({ theme }) => theme.colors.primary},
        ${({ theme }) => theme.colors.primaryHover}
    );
    color: ${({ theme }) => theme.colors.white};

    font-family: ${({ theme }) => theme.typography.headlineSmall.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineSmall.fontSize};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
    line-height: ${({ theme }) => theme.typography.headlineSmall.lineHeight};

    transition:
        opacity 180ms ease,
        transform 180ms ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export const Footer = styled.div`
    margin-top: ${({ theme }) => theme.spacing.component.medium};

    color: ${({ theme }) => theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};

    text-align: center;
`;

export const FooterLink = styled(Link)`
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};

    &:hover {
        color: ${({ theme }) => theme.colors.primaryHover};
    }
`;
