import styled from 'styled-components';

export const AnimeGridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 380px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;