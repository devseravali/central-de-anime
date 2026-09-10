import type { HTMLAttributes } from 'react';

import { StyledBadge } from './StyledBadge';

export const Badge = (props: HTMLAttributes<HTMLDivElement>) => {
    return <StyledBadge {...props} />;
};