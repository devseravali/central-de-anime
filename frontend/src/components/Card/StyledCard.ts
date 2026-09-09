import styled from 'styled-components';

export const StyledCard = styled.div`
    background-color: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.card};

    padding: 1rem;
`;