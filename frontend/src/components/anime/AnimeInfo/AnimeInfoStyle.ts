import styled from 'styled-components';

export const SectionInfo = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 0;
`;

export const TitleInfo = styled.h2`
  margin: 0;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const InfoP = styled.p`
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  margin: 0;
  font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const GenreList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

export const GenreChip = styled.li`
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.cyan};
  padding: 0.3rem 0.65rem;
  border-radius: 12px;
  font-size: 0.78rem;
  line-height: 1;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(0,0,0,0.22);
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  &:hover {
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const StrongInfo = styled.strong`
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
  letter-spacing: ${({ theme }) => theme.typography.labelLarge.letterSpacing};
`;

export const InfoRow = styled.div`
  display: flex;
  align-items: baseline;
  padding: 0.35rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const SectionRow = styled.section`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.25rem 0 0;
`;