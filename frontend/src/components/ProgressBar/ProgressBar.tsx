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
  const progress = Math.min(Math.max(value, 0), 100);

  return (
    <ProgressBarContainer
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <ProgressBarFill $progress={progress} />
    </ProgressBarContainer>
  );
};