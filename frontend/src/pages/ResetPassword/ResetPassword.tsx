import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { Eye, EyeOff } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { authService } from '../../services/auth.service';
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

    return 'Não foi possível redefinir sua senha. Tente novamente.';
};

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token')?.trim() ?? '';

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const resetMutation = useMutation({
        mutationFn: async () => {
            return authService.resetPassword({ token, novaSenha: novaSenha.trim() });
        },
        onSuccess: () => {
            setErrorMessage(null);
            setSuccessMessage('Senha redefinida com sucesso. Agora você já pode entrar.');
            setNovaSenha('');
            setConfirmarSenha('');
        },
        onError: (error) => {
            setSuccessMessage(null);
            setErrorMessage(getErrorMessage(error));
        },
    });

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token) {
            setSuccessMessage(null);
            setErrorMessage('Token de recuperação ausente. Solicite um novo link.');
            return;
        }

        const normalizedPassword = novaSenha.trim();

        if (normalizedPassword.length < 6) {
            setSuccessMessage(null);
            setErrorMessage('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }

        if (normalizedPassword !== confirmarSenha.trim()) {
            setSuccessMessage(null);
            setErrorMessage('As senhas não conferem.');
            return;
        }

        setErrorMessage(null);
        resetMutation.mutate();
    };

    return (
        <Page>
            <Card>
                <Title>Redefinir senha</Title>
                <Subtitle>
                    Digite sua nova senha para concluir a recuperação da conta.
                </Subtitle>

                <Form onSubmit={handleSubmit} noValidate>
                    <Field>
                        <FieldLabel>Nova senha</FieldLabel>
                        <FieldControl>
                            <FieldInput
                                type={mostrarNovaSenha ? 'text' : 'password'}
                                name="novaSenha"
                                value={novaSenha}
                                onChange={(event) => setNovaSenha(event.target.value)}
                                placeholder="No mínimo 6 caracteres"
                                autoComplete="new-password"
                                disabled={resetMutation.isPending}
                            />
                            <FieldAction
                                type="button"
                                onClick={() => setMostrarNovaSenha((prevState) => !prevState)}
                                disabled={resetMutation.isPending}
                                aria-label={mostrarNovaSenha ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {mostrarNovaSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                            </FieldAction>
                        </FieldControl>
                    </Field>

                    <Field>
                        <FieldLabel>Confirmar nova senha</FieldLabel>
                        <FieldControl>
                            <FieldInput
                                type={mostrarConfirmarSenha ? 'text' : 'password'}
                                name="confirmarSenha"
                                value={confirmarSenha}
                                onChange={(event) => setConfirmarSenha(event.target.value)}
                                placeholder="Repita a nova senha"
                                autoComplete="new-password"
                                disabled={resetMutation.isPending}
                            />
                            <FieldAction
                                type="button"
                                onClick={() => setMostrarConfirmarSenha((prevState) => !prevState)}
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
                    </Field>

                    {errorMessage && <Message $variant="error">{errorMessage}</Message>}
                    {successMessage && (
                        <Message $variant="success">{successMessage}</Message>
                    )}

                    <SubmitButton type="submit" disabled={resetMutation.isPending || !token}>
                        {resetMutation.isPending ? 'Redefinindo...' : 'Redefinir senha'}
                    </SubmitButton>
                </Form>

                <Actions>
                    <ActionLink to="/login">Ir para login</ActionLink>
                    <ActionLink to="/esqueci-minha-senha">Solicitar novo link</ActionLink>
                </Actions>
            </Card>
        </Page>
    );
};
