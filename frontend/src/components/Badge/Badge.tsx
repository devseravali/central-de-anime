import { StyledBadge } from './StyledBadge';
import React from 'react';

export const Badge = (props: React.HTMLAttributes<HTMLDivElement>) => {
    return <StyledBadge {...props} />;
};