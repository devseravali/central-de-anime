import type { HTMLAttributes, ReactNode } from 'react';

import { StyledCard } from './StyledCard';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
}

export const Card = ({ children, ...props }: CardProps) => {
    return (
        <StyledCard {...props}>
            {children}
        </StyledCard>
    );
};