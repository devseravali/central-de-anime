import styled from "styled-components";

export const StatsContainer = styled.dl`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin: 0.5rem 0;
`;

export const StatItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.45rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const StatLabel = styled.dt`
  margin: 0;
  color: ${({ theme }) => theme.colors.primary};
  font-family: ${({ theme }) => theme.typography.labelLarge.fontFamily};
  font-size: ${({ theme }) => theme.typography.labelLarge.fontSize};
  font-weight: ${({ theme }) => theme.typography.labelLarge.fontWeight};
  letter-spacing: ${({ theme }) => theme.typography.labelLarge.letterSpacing};
`;

export const StatValue = styled.dd`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-family: ${({ theme }) => theme.typography.bodyMedium.fontFamily};
  font-size: ${({ theme }) => theme.typography.bodyMedium.fontSize};
  font-weight: ${({ theme }) => theme.typography.bodyMedium.fontWeight};
  line-height: ${({ theme }) => theme.typography.bodyMedium.lineHeight};
`;