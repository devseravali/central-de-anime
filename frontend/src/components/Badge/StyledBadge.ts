import styled from 'styled-components';

export const StyledBadge = styled.div`
    background-color: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.borderStrong};
    border-radius: ${({ theme }) => theme.radii.card};

    padding: 0.5rem 1rem;
`;