import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { useSearchParams } from 'react-router-dom';

import { authService } from '../../services/auth.service';
import {
    ActionLink,
    Actions,
    Card,
    Message,
    Page,
    RetryButton,
    Title,
} from './ConfirmarEmailStyle';

const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        const apiMessage = error.response?.data?.message;

        if (typeof apiMessage === 'string' && apiMessage.trim()) {
            return apiMessage;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return 'Não foi possível confirmar seu email. Tente novamente.';
};

export const ConfirmarEmail = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token')?.trim() ?? '';
    const lastRequestedToken = useRef<string | null>(null);

    const verifyMutation = useMutation({
        mutationFn: async (verifyToken: string) => {
            return authService.verifyEmail({ token: verifyToken });
        },
    });
    const verifyEmail = verifyMutation.mutate;

    const retryVerification = () => {
        verifyMutation.reset();
        verifyEmail(token);
    };

    useEffect(() => {
        if (!token || lastRequestedToken.current === token) {
            return;
        }

        lastRequestedToken.current = token;
        verifyEmail(token);
    }, [token, verifyEmail]);

    const renderState = () => {
        if (!token) {
            return (
                <>
                    <Message $variant="error">
                        Token de confirmação ausente. Verifique o link recebido no seu email.
                    </Message>
                    <Actions>
                        <ActionLink to="/registro">Voltar para cadastro</ActionLink>
                    </Actions>
                </>
            );
        }

        if (verifyMutation.isPending) {
            return <Message>Confirmando seu email, aguarde...</Message>;
        }

        if (verifyMutation.isError) {
            return (
                <>
                    <Message $variant="error">{getErrorMessage(verifyMutation.error)}</Message>
                    <Actions>
                        <RetryButton
                            type="button"
                            onClick={retryVerification}
                            disabled={verifyMutation.isPending}
                        >
                            Tentar novamente
                        </RetryButton>
                        <ActionLink to="/registro">Criar nova conta</ActionLink>
                    </Actions>
                </>
            );
        }

        if (verifyMutation.isSuccess) {
            return (
                <>
                    <Message $variant="success">
                        Email confirmado com sucesso. Sua conta já está ativa.
                    </Message>
                    <Actions>
                        <ActionLink to="/login">Ir para login</ActionLink>
                    </Actions>
                </>
            );
        }

        return null;
    };

    return (
        <Page>
            <Card>
                <Title>Confirmação de email</Title>
                {renderState()}
            </Card>
        </Page>
    );
};
