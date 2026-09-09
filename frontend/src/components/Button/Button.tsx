import type { ReactNode } from 'react';

import { StyledButton } from './ButtonStyle';

interface ButtonProps {
    children: ReactNode;
    type?: 'button' | 'submit' | 'reset';
}

export const Button = ({
    children,
    type = 'button',
}: ButtonProps) => {
    return (
        <StyledButton type={type}>
            {children}
        </StyledButton>
    );
};