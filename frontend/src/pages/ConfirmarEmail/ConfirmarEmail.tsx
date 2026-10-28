import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

import { authService } from '../../services/auth.service';
import { getSafeAuthErrorMessage } from '../../utils/authErrorMessage';
import {
    ActionLink,
    Actions,
    Card,
    Message,
    Page,
    RetryButton,
    Title,
} from './ConfirmarEmailStyle';

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
                    <Message $variant="error">
                        {getSafeAuthErrorMessage(
                            verifyMutation.error,
                            'emailVerification',
                        )}
                    </Message>
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
