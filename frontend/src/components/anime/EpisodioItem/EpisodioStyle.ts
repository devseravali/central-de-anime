import styled from 'styled-components';

export const EpisodiosGrid = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 8px;
  justify-items: center;
`;

export const EpisodioItemContainer = styled.article`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 280px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
`;

export const EpisodioItemImage = styled.img`
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 5px;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease-in-out;

  &:hover {
    transform: scale(1.05);
    cursor: pointer;
  }
`;

export const EpisodioItemTitle = styled.h3`
  margin: 0;
  font-family: ${({ theme }) => theme.typography.fontFamily.heading};
  font-size: ${({ theme }) =>
    theme.typography.headlineSmall.fontSize};
  font-weight: ${({ theme }) =>
    theme.typography.headlineSmall.fontWeight ?? 700};
  color: ${({ theme }) => theme.colors.cyan};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    cursor: pointer;
  }
`;

export const Small = styled.small`
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: ${({ theme }) =>
  theme.typography.bodyMedium.fontWeight ? 700 : 400};
  color: ${({ theme }) => theme.colors.textPrimary};
  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    cursor: default;
  }
`;

export const EpisodioItemSinopse = styled.p`
  margin: 0;
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: ${({ theme }) =>
    theme.typography.bodyMedium.fontWeight ? 600 : 500};
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};

  &:hover {
    color: ${({ theme }) => theme.colors.primaryHover};
    cursor: default;
  }
`;

export const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: ${({ theme }) =>
    theme.typography.bodyMedium.fontWeight ? 600 : 500};
  color: ${({ theme }) => theme.colors.warning};
`;

export const LoadingMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: ${({ theme }) =>
    theme.typography.bodyMedium.fontWeight ? 600 : 500};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const NoEpisodiosMessage = styled.p`
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: ${({ theme }) =>
    theme.typography.bodyMedium.fontWeight ? 600 : 500};
  color: ${({ theme }) => theme.colors.textPrimary};
`;