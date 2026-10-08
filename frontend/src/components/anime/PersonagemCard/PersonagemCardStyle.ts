import styled from "styled-components";

export const PersonagemCardContainer = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 180px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

export const FigurePersonagem = styled.figure`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin: 0;
`;

export const PersonagemImage = styled.img`
  display: block;
  width: 100%;
  height: 220px;
  object-fit: cover;
  object-position: center;
  border-radius: 6px;
  &:hover {
    filter: brightness(0.95);
    border: 2px solid ${({ theme }) => theme.colors.borderHover};
    transition: filter 0.3s ease, background-color 0.3s ease;
    transform: scale(1.02);
    cursor: pointer;
  }
  transition: transform 0.3s ease;  
`;

export const PersonagemCaption = styled.figcaption`
  width: 100%;
  margin-top: 10px;
  text-align: center;
`;

export const PersonagemName = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  &:hover {
    text-decoration: underline;
    color: ${({ theme }) => theme.colors.cyan};
    cursor: pointer;
  }
`;

export const PersonagemRole = styled.p`
  cursor: ${({ onClick }) => (onClick ? 'pointer' : 'default')};
`;