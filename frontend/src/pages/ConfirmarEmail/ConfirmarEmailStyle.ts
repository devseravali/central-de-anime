import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Page = styled.section`
    min-height: calc(100vh - 220px);
    padding: ${({ theme }) => theme.spacing.page.mobile};

    display: grid;
    place-items: center;
`;

export const Card = styled.article`
    width: 100%;
    max-width: 540px;

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.container};
    background: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.card};

    padding: ${({ theme }) => theme.spacing.section.compact};
`;

export const Title = styled.h1`
    margin: 0 0 ${({ theme }) => theme.spacing.component.small};
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) => theme.typography.headlineLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.headlineLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.headlineLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.headlineLarge.lineHeight};
`;

export const Message = styled.p<{ $variant?: 'error' | 'success' }>`
    margin: 0;
    color: ${({ theme, $variant }) =>
        $variant === 'error'
            ? theme.colors.danger
            : $variant === 'success'
              ? theme.colors.success
              : theme.colors.textSecondary};

    font-family: ${({ theme }) => theme.typography.bodyLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.bodyLarge.lineHeight};
`;

export const Actions = styled.div`
    margin-top: ${({ theme }) => theme.spacing.section.compact};
    display: flex;
    gap: ${({ theme }) => theme.spacing.component.small};
`;

export const ActionLink = styled(Link)`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 44px;
    padding: 0.65rem 1.1rem;

    border-radius: ${({ theme }) => theme.radii.button};
    border: 1px solid transparent;

    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};

    font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) => theme.typography.labelLarge.lineHeight};

    &:hover {
        background: ${({ theme }) => theme.colors.primaryHover};
    }
`;
