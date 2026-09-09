import styled from 'styled-components';

export const StyledInput = styled.input`
    width: 100%;

    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};

    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.input};

    padding: 0.75rem 1rem;

    font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};

    outline: none;

    transition:
        border-color 200ms ease,
        box-shadow 200ms ease,
        background-color 200ms ease;

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }

    &:focus {
        border-color: ${({ theme }) => theme.colors.primary};

        box-shadow: ${({ theme }) => theme.shadows.primaryGlow};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;