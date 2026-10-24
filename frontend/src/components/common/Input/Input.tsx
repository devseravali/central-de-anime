import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

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
    const generatedId = useId();
    const inputId = props.id ?? generatedId;
    const errorId = `${inputId}-error`;
    const describedBy = [props['aria-describedby'], error ? errorId : null]
        .filter(Boolean)
        .join(' ') || undefined;

    return (
        <InputContainer>
            {label && <InputLabel htmlFor={inputId}>{label}</InputLabel>}

            <div>
                {icon}
                <StyledInput
                    {...props}
                    id={inputId}
                    aria-invalid={Boolean(error)}
                    aria-describedby={describedBy}
                    $hasError={Boolean(error)}
                />
            </div>

            {error && <InputError id={errorId}>{error}</InputError>}
        </InputContainer>
    );
};