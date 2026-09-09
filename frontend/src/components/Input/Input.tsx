import type { InputHTMLAttributes, ReactNode } from 'react';

import { StyledInput, InputContainer, InputLabel, InputError } from './InputStyle';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: ReactNode;
}

export const Input = ({
    label,
    error,
    icon,
    ...props
}: InputProps) => {
    return (
        <InputContainer>
            {label && <InputLabel>{label}</InputLabel>}

            <div>
                {icon}
                <StyledInput
                    {...props}
                    aria-invalid={Boolean(error)}
                />
            </div>

            {error && <InputError>{error}</InputError>}
        </InputContainer>
    );
};