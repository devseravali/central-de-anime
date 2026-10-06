import styled from 'styled-components';

export const ProgressBarContainer = styled.div`
  width: 100%;
  height: 8px;

  background-color: ${({ theme }) =>
    theme.colors.surfaceElevated};

  border-radius: ${({ theme }) => theme.radii.badge};

  overflow: hidden;
`;

interface ProgressBarFillProps {
  $progress: number;
}

export const ProgressBarFill = styled.div<ProgressBarFillProps>`
  width: 100%;
  height: 100%;

  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.colors.primary} 0%,
    ${({ theme }) => theme.colors.cyan} 100%
  );
  border-radius: ${({ theme }) => theme.radii.badge};
  transform-origin: left center;
  transform: scaleX(${({ $progress }) => Math.min(Math.max($progress, 0), 100) / 100});
  transition: transform 340ms cubic-bezier(0.2, 0.9, 0.2, 1), box-shadow 340ms ease;
  box-shadow: 0 2px 8px rgba(6,182,212,0.10);
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;

  background-color: ${({ theme }) =>
    theme.colors.surfaceElevated};

  border-radius: ${({ theme }) => theme.radii.badge};

  overflow: hidden;
`;