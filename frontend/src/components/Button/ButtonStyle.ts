import styled from 'styled-components';

export const StyledButton = styled.button`
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};

    border: none;

    padding: 0.75rem 1.5rem;
    border-radius: ${({ theme }) => theme.radii.button};

    cursor: pointer;

    font-family: ${({ theme }) =>
        theme.typography.labelLarge.fontFamily};
    font-size: ${({ theme }) =>
        theme.typography.labelLarge.fontSize};
    font-weight: ${({ theme }) =>
        theme.typography.labelLarge.fontWeight};

    transition:
        background-color 200ms ease,
        transform 200ms ease;

    &:hover {
        background-color: ${({ theme }) =>
            theme.colors.primaryHover};

        transform: translateY(-2px);
    }

    &:active {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;