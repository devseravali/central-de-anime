import styled from 'styled-components';

export const AnimeCardContainer = styled.article`
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-radius: 12px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.surface || '#fff'};
  box-shadow: 0 6px 18px rgba(0,0,0,0.08);
  transition: transform 0.25s, box-shadow 0.25s;
  will-change: transform;
  &:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 18px 40px rgba(0,0,0,0.12);
  }
  &:active {
    transform: translateY(-2px) scale(0.995);
    box-shadow: 0 10px 24px rgba(0,0,0,0.10);
  }
`;

export const AnimeCardImage = styled.img`
  width: 100%;
  aspect-ratio: 3 / 4;
  max-height: 320px;
  object-fit: cover;
  border: 2px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  display: block;
  &:hover {
  border: 2px solid ${({ theme }) => theme.colors.primary};
  }
`;

export const AnimeCardTitle = styled.h2`
  margin-top: 8px;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
  min-height: 2.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
  text-align: center;
  &:hover{
    color: ${({ theme }) => theme.colors.primary};
  }
`;