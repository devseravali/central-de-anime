import styled from 'styled-components';

export const StyledCard = styled.div`
    width: 100%;

    background-color: ${({ theme }) => theme.colors.surface};
    color: ${({ theme }) => theme.colors.textPrimary};

    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.radii.card};

    padding: ${({ theme }) => theme.spacing.component.large};

    box-shadow: ${({ theme }) => theme.shadows.card};

    transition:
        border-color 200ms ease,
        box-shadow 200ms ease,
        transform 200ms ease,
        background-color 200ms ease;

    &:hover {
        border-color: ${({ theme }) => theme.colors.borderHover};
    }
`;