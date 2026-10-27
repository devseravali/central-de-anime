import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const Page = styled.section`
    min-height: calc(100vh - 220px);
    padding: ${({ theme }) => theme.spacing.page.mobile};

    display: grid;
    place-items: center;

    @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
        padding: ${({ theme }) => theme.spacing.page.tablet};
    }

    @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
        padding: ${({ theme }) => theme.spacing.page.desktop};
    }
`;

export const Card = styled.article`
    width: 100%;
    max-width: 540px;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.container};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.card};

    padding: ${({ theme }) => theme.spacing.section.compact};

    @media (max-width: 380px) {
        padding: 1.25rem;
    }
`;

export const Title = styled.h1`
    margin: 0;
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.headlineLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.headlineLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.headlineLarge.lineHeight};
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

export const Form = styled.form`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.medium};
`;

export const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.compact};
`;

export const FieldLabel = styled.label`
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};
`;

export const FieldInput = styled.input`
    width: 100%;
    min-height: 44px;

    border-radius: ${({ theme }) => theme.radii.input};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};

    background: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};

    padding: 0.75rem 0.9rem;

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};

    &:focus {
        border-color: ${({ theme }) => theme.colors.primary};
        box-shadow: ${({ theme }) => theme.shadows.primaryGlow};
    }

    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }

    &[aria-invalid='true'] {
        border-color: ${({ theme }) => theme.colors.danger};
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
    overflow-wrap: anywhere;
`;

export const SubmitButton = styled.button`
    min-height: 46px;

    border-radius: ${({ theme }) => theme.radii.button};
    border: 0;

    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};

    &:hover:not(:disabled) {
        background: ${({ theme }) => theme.colors.primaryHover};
    }

    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
`;

export const Actions = styled.div`
    margin-top: ${({ theme }) => theme.spacing.component.medium};
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const ActionLink = styled(Link)`
    color: ${({ theme }) => theme.colors.primary};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};

    &:hover {
        color: ${({ theme }) => theme.colors.primaryHover};
    }
`;
