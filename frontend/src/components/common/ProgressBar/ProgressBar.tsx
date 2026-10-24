import React from 'react';
import {
  ProgressBarContainer,
  ProgressBarFill,
} from './ProgressBarStyle';

interface ProgressBarProps {
  value: number;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label }) => {
  const validValue = Number.isFinite(value) ? value : 0;
  const progress = Math.min(Math.max(validValue, 0), 100);
  const accessibleLabel = label?.trim() || 'Progresso';

  return (
    <ProgressBarContainer
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={accessibleLabel}
    >
      <ProgressBarFill $progress={progress} />
    </ProgressBarContainer>
  );
};