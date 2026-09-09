import type { InputHTMLAttributes } from 'react';

import { StyledInput } from './InputStyle';

export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => {
    return <StyledInput {...props} />;
};