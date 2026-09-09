import type { HTMLAttributes } from 'react';

import { StyledCard } from './StyledCard';

export const Card = (props: HTMLAttributes<HTMLDivElement>) => {
    return <StyledCard {...props} />;
};