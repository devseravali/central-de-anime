import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';

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

const ERROR_MESSAGE =
    'Não foi possível processar sua solicitação. Tente novamente.';

export const EsqueciSenha = () => {
    const [email, setEmail] = useState('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const forgotMutation = useMutation({
        mutationFn: authService.forgotPassword,
        onSuccess: () => {
            setErrorMessage(null);
            setSuccessMessage(
                'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha.'
            );
            setEmail('');
        },
        onError: () => {
            setSuccessMessage(null);
            setErrorMessage(ERROR_MESSAGE);
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (forgotMutation.isPending) {
            return;
        }

        const normalizedEmail = email.trim();

        if (!normalizedEmail) {
            setSuccessMessage(null);
            setErrorMessage('Email é obrigatório.');
            return;
        }

        setErrorMessage(null);
        setSuccessMessage(null);
        forgotMutation.mutate(normalizedEmail);
    };

    return (
        <Page>
            <Card>
                <Title>Esqueci minha senha</Title>
                <Subtitle>
                    Informe o email da sua conta para receber o link de recuperação.
                </Subtitle>

                <Form onSubmit={handleSubmit}>
                    <Field>
                        <FieldLabel htmlFor="forgot-password-email">
                            E-mail
                        </FieldLabel>
                        <FieldInput
                            id="forgot-password-email"
                            type="email"
                            name="email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setErrorMessage(null);
                                setSuccessMessage(null);
                            }}
                            placeholder="seu.email@exemplo.com"
                            autoComplete="email"
                            required
                            aria-invalid={Boolean(errorMessage)}
                            aria-describedby={
                                errorMessage
                                    ? 'forgot-password-error'
                                    : undefined
                            }
                            disabled={forgotMutation.isPending}
                        />
                    </Field>

                    {errorMessage && (
                        <Message
                            id="forgot-password-error"
                            role="alert"
                            $variant="error"
                        >
                            {errorMessage}
                        </Message>
                    )}
                    {successMessage && (
                        <Message
                            role="status"
                            aria-live="polite"
                            $variant="success"
                        >
                            {successMessage}
                        </Message>
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
