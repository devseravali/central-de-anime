import styled from 'styled-components';

export const StyledBadge = styled.div`
    display: inline-flex;
    align-items: center;
    justify-content: center;

    width: fit-content;

    padding: 0.25rem 0.625rem;

    background-color: ${({ theme }) => theme.colors.surfaceElevated};
    color: ${({ theme }) => theme.colors.textSecondary};

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.badge};

    font-family: ${({ theme }) =>
        theme.typography.labelMedium.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelMedium.fontSize};
    font-weight: ${({ theme }) =>
        theme.typography.labelMedium.fontWeight};
    line-height: ${({ theme }) =>
        theme.typography.labelMedium.lineHeight};

    white-space: nowrap;

    transition:
        background-color 200ms ease,
        border-color 200ms ease,
        color 200ms ease;

    &:hover {
        background-color: ${({ theme }) =>
            theme.colors.surfaceFloating};

        border-color: ${({ theme }) =>
            theme.colors.borderHover};
    }
`;