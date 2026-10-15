import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { authService } from '../../services/auth.service';
import {
    ActionLink,
    Actions,
    Card,
    Field,
    FieldInput,
    FieldLabel,
    Form,
    Message,
    Page,
    SubmitButton,
    Subtitle,
    Title,
} from './EsqueciSenhaStyle';

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

    return 'Não foi possível processar sua solicitação. Tente novamente.';
};

export const EsqueciSenha = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const forgotMutation = useMutation({
        mutationFn: async (inputEmail: string) => {
            return authService.forgotPassword(inputEmail);
        },
        onSuccess: () => {
            setErrorMessage(null);
            setSuccessMessage(
                'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
            );
            setEmail('');
        },
        onError: (error) => {
            setSuccessMessage(null);
            setErrorMessage(getErrorMessage(error));
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setSuccessMessage(null);
            setErrorMessage('Email é obrigatório.');
            return;
        }

        setErrorMessage(null);
        forgotMutation.mutate(normalizedEmail);
    };

    return (
        <Page>
            <Card>
                <Title>Esqueci minha senha</Title>
                <Subtitle>
                    Informe o email da sua conta para receber o link de recuperação.
                </Subtitle>

                <Form onSubmit={handleSubmit} noValidate>
                    <Field>
                        <FieldLabel>E-mail</FieldLabel>
                        <FieldInput
                            type="email"
                            name="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="seu.email@exemplo.com"
                            autoComplete="email"
                            disabled={forgotMutation.isPending}
                        />
                    </Field>

                    {errorMessage && <Message $variant="error">{errorMessage}</Message>}
                    {successMessage && (
                        <Message $variant="success">{successMessage}</Message>
                    )}

                    <SubmitButton type="submit" disabled={forgotMutation.isPending}>
                        {forgotMutation.isPending ? 'Enviando...' : 'Enviar link de recuperação'}
                    </SubmitButton>
                </Form>

                <Actions>
                    <ActionLink to="/login">Voltar para login</ActionLink>
                </Actions>
            </Card>
        </Page>
    );
};
