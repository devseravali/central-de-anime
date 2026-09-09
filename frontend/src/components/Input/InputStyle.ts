import styled from 'styled-components';

export const InputContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.component.compact};

    width: 100%;
`;

export const InputLabel = styled.label`
    color: ${({ theme }) => theme.colors.textPrimary};

    font-family: ${({ theme }) =>
        theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) =>
        theme.typography.labelLarge.fontWeight};
    line-height: ${({ theme }) =>
        theme.typography.labelLarge.lineHeight};
`;

export const InputWrapper = styled.div`
    position: relative;

    display: flex;
    align-items: center;

    width: 100%;
`;

export const StyledInput = styled.input<{ $hasError?: boolean }>`
    width: 100%;
    min-height: 44px;

    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};

    border: 1px solid
        ${({ theme, $hasError }) =>
            $hasError
                ? theme.colors.danger
                : theme.colors.borderStrong};

    border-radius: ${({ theme }) => theme.radii.input};

    padding: 0.75rem 1rem;

    font-family: ${({ theme }) =>
        theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) =>
        theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) =>
        theme.typography.bodyMedium.lineHeight};

    outline: none;

    transition:
        border-color 200ms ease,
        box-shadow 200ms ease,
        background-color 200ms ease;

    &::placeholder {
        color: ${({ theme }) => theme.colors.textMuted};
    }

    &:hover:not(:disabled) {
        border-color: ${({ theme, $hasError }) =>
            $hasError
                ? theme.colors.danger
                : theme.colors.borderHover};
    }

    &:focus {
        border-color: ${({ theme, $hasError }) =>
            $hasError
                ? theme.colors.danger
                : theme.colors.primary};

        box-shadow: ${({ theme, $hasError }) =>
            $hasError
                ? `0 0 0 3px ${theme.colors.danger}26`
                : theme.shadows.primaryGlow};
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: ${({ theme }) =>
            theme.colors.surfaceElevated};
    }
`;

export const InputError = styled.span`
    color: ${({ theme }) => theme.colors.danger};

    font-family: ${({ theme }) =>
        theme.typography.bodyMedium.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.bodyMedium.fontSize};
    font-weight: ${({ theme }) =>
        theme.typography.bodyMedium.fontWeight};
    line-height: ${({ theme }) =>
        theme.typography.bodyMedium.lineHeight};
`;