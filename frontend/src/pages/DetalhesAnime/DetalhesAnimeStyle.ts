import styled from 'styled-components';

export const DetalhesAnimeContainer = styled.main`
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 1rem;
  padding: 1rem 1.25rem;
  max-width: 1200px;
  margin: 0 auto;
`;

export const FigureImage = styled.img`
  width: 320px;
  height: 480px;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.16);
    border-color: ${({ theme }) => theme.colors.primary};
  }
  @media (max-width: 768px) {
    width: 280px;
    height: 420px;
  }
`;

export const FigureContainer = styled.figure`
  display: block;
  margin: 0;
`;

export const DetalhesContent = styled.section`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  width: 100%;
  flex-direction: row;
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
  }
`;

export const InfoColumn = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 760px;
  flex: 1 1 auto;
`;

export const DetalhesH1 = styled.h1`
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 800;
  margin: 0 0 0.75rem 0;
  padding: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
`;

export const MetaRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
`;

export const SectionInfo = styled.section`
  display: flex;
  flex-direction: column;
  column-gap: 1rem;
  gap: 1rem;
  margin-bottom: 2rem;
  &:last-of-type {
    margin-bottom: 0;
  }
`;

export const CoverWrapper = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

export const SectionBlock = styled.section`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
`;

export const DetalhesH2 = styled.h2`
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: ${({ theme }) => theme.colors.cyan};
  font-weight: 700;
`;

export const DetalhesParagraph = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.5;
  white-space: pre-wrap;
`;

export const FavoriteButton = styled.button`
  width: 100%;

  padding: 0.6rem 0.8rem;

  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 8px;

  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};

  font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};

  transition:
    transform 160ms ease,
    background-color 160ms ease,
    opacity 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    background: ${({ theme }) => theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const FavoriteFeedback = styled.small`
  display: block;
  margin-top: 0.45rem;

  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ArticleDetalhes = styled.article`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

export const DetalhesHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
`;

export const ErrorDetalhes = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  text-align: center;
`;

export const LoadingDetalhes = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  text-align: center;
`;

export const NoDataDetalhes = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  text-align: center;
`;


export const DetalhesPersonagem = styled.section`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;