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
  width: ${({ $progress }) => `${$progress}%`};
  height: 100%;

  background-color: ${({ theme }) => theme.colors.primary};

  border-radius: ${({ theme }) => theme.radii.badge};

  transition: width 300ms ease;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;

  background-color: ${({ theme }) =>
    theme.colors.surfaceElevated};

  border-radius: ${({ theme }) => theme.radii.badge};

  overflow: hidden;
`;