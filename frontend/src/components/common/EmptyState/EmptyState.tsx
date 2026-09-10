import { EmptyStyle, EmptyMessage, EmptyError } from './EmptyStyle';

interface EmptyStateProps {
    message?: string;
    error?: string;
}

export const EmptyState = ({
    message = 'Nenhum conteúdo disponível',
    error,
}: EmptyStateProps) => {
    return (
        <EmptyStyle>
            <EmptyMessage>{message}</EmptyMessage>

            {error && (
                <EmptyError>
                    {error}
                </EmptyError>
            )}
        </EmptyStyle>
    );
};