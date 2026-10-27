import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { authService, type ResetPasswordData } from '../../services/auth.service';
import {
    ActionLink,
    Actions,
    Card,
    Field,
    FieldAction,
    FieldControl,
    FieldInput,
    FieldLabel,
    Form,
    Message,
    Page,
    SubmitButton,
    Subtitle,
    Title,
} from './ResetPasswordStyle';

const ERROR_MESSAGE = 'Não foi possível redefinir sua senha. Tente novamente.';

type PasswordField = 'novaSenha' | 'confirmarSenha';

interface PasswordValidationError {
    field: PasswordField;
    message: string;
}

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token')?.trim() ?? '';

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [validationError, setValidationError] =
        useState<PasswordValidationError | null>(null);

    const resetMutation = useMutation({
        mutationFn: async (data: ResetPasswordData): Promise<void> => {
            await authService.resetPassword(data);
        },
        onSuccess: () => {
            setErrorMessage(null);
            setValidationError(null);
            setSuccessMessage('Senha redefinida com sucesso. Agora você já pode entrar.');
            setNovaSenha('');
            setConfirmarSenha('');
        },
        onError: () => {
            setSuccessMessage(null);
            setErrorMessage(ERROR_MESSAGE);
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (resetMutation.isPending) {
            return;
        }

        if (!token) {
            setSuccessMessage(null);
            setErrorMessage('Token de recuperação ausente. Solicite um novo link.');
            return;
        }

        if (!novaSenha) {
            setSuccessMessage(null);
            setErrorMessage(null);
            setValidationError({
                field: 'novaSenha',
                message: 'Informe sua nova senha.',
            });
            return;
        }

        if (novaSenha.length < 6) {
            setSuccessMessage(null);
            setErrorMessage(null);
            setValidationError({
                field: 'novaSenha',
                message: 'A nova senha deve ter pelo menos 6 caracteres.',
            });
            return;
        }

        if (!confirmarSenha) {
            setSuccessMessage(null);
            setErrorMessage(null);
            setValidationError({
                field: 'confirmarSenha',
                message: 'Confirme sua nova senha.',
            });
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setSuccessMessage(null);
            setErrorMessage(null);
            setValidationError({
                field: 'confirmarSenha',
                message: 'As senhas não conferem.',
            });
            return;
        }

        setErrorMessage(null);
        setValidationError(null);
        setSuccessMessage(null);
        resetMutation.mutate({ token, novaSenha });
    };

    const clearFeedback = () => {
        setErrorMessage(null);
        setSuccessMessage(null);
        setValidationError(null);
    };

    return (
        <Page>
            <Card>
                <Title>Redefinir senha</Title>
                <Subtitle>
                    Digite sua nova senha para concluir a recuperação da conta.
                </Subtitle>

                {!token && (
                    <Message role="alert" $variant="error">
                        Token de recuperação ausente. Solicite um novo link.
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

                {token && !successMessage && (
                    <Form
                        onSubmit={handleSubmit}
                        noValidate
                        aria-busy={resetMutation.isPending}
                    >
                        <Field>
                            <FieldLabel htmlFor="reset-password-new">
                                Nova senha
                            </FieldLabel>
                            <FieldControl>
                                <FieldInput
                                    id="reset-password-new"
                                    type={mostrarNovaSenha ? 'text' : 'password'}
                                    name="novaSenha"
                                    value={novaSenha}
                                    onChange={(event) => {
                                        setNovaSenha(event.target.value);
                                        clearFeedback();
                                    }}
                                    placeholder="No mínimo 6 caracteres"
                                    autoComplete="new-password"
                                    aria-invalid={
                                        validationError?.field === 'novaSenha'
                                    }
                                    aria-describedby={
                                        validationError?.field === 'novaSenha'
                                            ? 'reset-password-new-error'
                                            : undefined
                                    }
                                    disabled={resetMutation.isPending}
                                    required
                                />
                                <FieldAction
                                    type="button"
                                    onClick={() =>
                                        setMostrarNovaSenha((prevState) => !prevState)
                                    }
                                    disabled={resetMutation.isPending}
                                    aria-label={
                                        mostrarNovaSenha
                                            ? 'Ocultar senha'
                                            : 'Mostrar senha'
                                    }
                                >
                                    {mostrarNovaSenha ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </FieldAction>
                            </FieldControl>
                            {validationError?.field === 'novaSenha' && (
                                <Message
                                    id="reset-password-new-error"
                                    role="alert"
                                    $variant="error"
                                >
                                    {validationError.message}
                                </Message>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="reset-password-confirm">
                                Confirmar nova senha
                            </FieldLabel>
                            <FieldControl>
                                <FieldInput
                                    id="reset-password-confirm"
                                    type={
                                        mostrarConfirmarSenha ? 'text' : 'password'
                                    }
                                    name="confirmarSenha"
                                    value={confirmarSenha}
                                    onChange={(event) => {
                                        setConfirmarSenha(event.target.value);
                                        clearFeedback();
                                    }}
                                    placeholder="Repita a nova senha"
                                    autoComplete="new-password"
                                    aria-invalid={
                                        validationError?.field ===
                                        'confirmarSenha'
                                    }
                                    aria-describedby={
                                        validationError?.field ===
                                        'confirmarSenha'
                                            ? 'reset-password-confirm-error'
                                            : undefined
                                    }
                                    disabled={resetMutation.isPending}
                                    required
                                />
                                <FieldAction
                                    type="button"
                                    onClick={() =>
                                        setMostrarConfirmarSenha(
                                            (prevState) => !prevState
                                        )
                                    }
                                    disabled={resetMutation.isPending}
                                    aria-label={
                                        mostrarConfirmarSenha
                                            ? 'Ocultar confirmação de senha'
                                            : 'Mostrar confirmação de senha'
                                    }
                                >
                                    {mostrarConfirmarSenha ? (
                                        <EyeOff size={16} />
                                    ) : (
                                        <Eye size={16} />
                                    )}
                                </FieldAction>
                            </FieldControl>
                            {validationError?.field === 'confirmarSenha' && (
                                <Message
                                    id="reset-password-confirm-error"
                                    role="alert"
                                    $variant="error"
                                >
                                    {validationError.message}
                                </Message>
                            )}
                        </Field>

                        {errorMessage && (
                            <Message role="alert" $variant="error">
                                {errorMessage}
                            </Message>
                        )}
                        {resetMutation.isPending && (
                            <Message
                                role="status"
                                aria-live="polite"
                                $variant="info"
                            >
                                Redefinindo sua senha...
                            </Message>
                        )}

                        <SubmitButton
                            type="submit"
                            disabled={resetMutation.isPending}
                        >
                            {resetMutation.isPending
                                ? 'Redefinindo...'
                                : 'Redefinir senha'}
                        </SubmitButton>
                    </Form>
                )}

                <Actions>
                    <ActionLink to="/login">Ir para login</ActionLink>
                    <ActionLink to="/esqueci-minha-senha">Solicitar novo link</ActionLink>
                </Actions>
            </Card>
        </Page>
    );
};
