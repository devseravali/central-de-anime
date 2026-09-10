import { StyledErrorMessage } from './ErrorMessageStyle';

interface ErrorMessageProps {
    message?: string;
}

export const ErrorMessage = ({
    message,
}: ErrorMessageProps) => {
    if (!message) {
        return null;
    }

    return (
        <StyledErrorMessage>
            {message}
        </StyledErrorMessage>
    );
};