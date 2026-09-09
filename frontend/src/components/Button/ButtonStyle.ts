import styled from 'styled-components';

export const StyledButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.component.compact};

    min-height: 44px;
    padding: 0.75rem 1.5rem;

    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};

    border: 1px solid transparent;
    border-radius: ${({ theme }) => theme.radii.button};

    cursor: pointer;

    font-family: ${({ theme }) =>
        theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) =>
        theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) =>
        theme.typography.labelLarge.lineHeight};

    white-space: nowrap;

    transition:
        background-color 200ms ease,
        border-color 200ms ease,
        box-shadow 200ms ease,
        transform 200ms ease,
        opacity 200ms ease;

    &:hover:not(:disabled) {
        background-color: ${({ theme }) =>
            theme.colors.primaryHover};

        transform: translateY(-2px);
    }

    &:focus-visible {
        outline: none;

        box-shadow: ${({ theme }) =>
            theme.shadows.primaryGlow};
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;