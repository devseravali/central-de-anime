import styled from "styled-components";

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 40vh;
  padding: 1rem;
  gap: 0.75rem;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const LoadingError = styled.div`
  color: ${({ theme }) => theme.colors.danger || 'red'};
  font-weight: 700;
  text-align: center;
  max-width: 640px;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background: rgba(255,0,0,0.04);
`;

export const Progress = styled.progress`
  width: 120px;
  height: 8px;
  appearance: none;
  &::-webkit-progress-bar {
    background: rgba(255,255,255,0.04);
    border-radius: 999px;
  }
  &::-webkit-progress-value {
    background: ${({ theme }) => theme.colors.primary};
    border-radius: 999px;
  }
`;

export const SrOnly = styled.span`
  border: 0;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  white-space: nowrap;
  width: 1px;
`;

export const LoadingMessage = styled.p`
  text-align: center;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const LoadingErrorMessage = styled.p`
  text-align: center;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.danger || 'red'};
`;

export const LoadingH2 = styled.h2`
  text-align: center;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;