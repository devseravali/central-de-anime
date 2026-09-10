import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { StyledButton } from './ButtonStyle';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

export const Button = ({
    children,
    type = 'button',
    ...props
}: ButtonProps) => {
    return (
        <StyledButton
            type={type}
            {...props}
        >
            {children}
        </StyledButton>
    );
};