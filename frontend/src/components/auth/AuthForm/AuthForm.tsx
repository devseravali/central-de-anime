import { useEffect, useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { authService } from '../../../services/auth.service';
import { setAccessToken } from '../../../services/api';
import {
    AuthPage,
    AuthShell,
    Badge,
    CheckboxLabel,
    Field,
    FieldAction,
    FieldControl,
    FieldIcon,
    FieldInput,
    FieldLabel,
    Footer,
    FooterLink,
    Form,
    HelperRow,
    HeroText,
    HeroTitle,
    InlineLinkButton,
    LeftPanel,
    Message,
    RightPanel,
    StatCard,
    StatLabel,
    StatValue,
    Stats,
    SubmitButton,
    Subtitle,
    Title,
} from './AuthFormStyle';

type AuthMode = 'login' | 'registro';

interface AuthFormProps {
    mode: AuthMode;
}

const REMEMBER_CREDENTIALS_KEY = 'rememberCredentials';
const REMEMBER_EMAIL_KEY = 'rememberedEmail';
const LEGACY_REMEMBER_PASSWORD_KEY = 'rememberedPassword';

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

    return 'Não foi possível concluir a solicitação. Tente novamente.';
};

export const AuthForm = ({ mode }: AuthFormProps) => {
    const navigate = useNavigate();

    const isLogin = mode === 'login';

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        localStorage.removeItem(LEGACY_REMEMBER_PASSWORD_KEY);
    }, []);

    const rememberedLoginData = (() => {
        if (!isLogin || typeof window === 'undefined') {
            return {
                lembrar: false,
                email: '',
            };
        }

        const shouldRemember =
            localStorage.getItem(REMEMBER_CREDENTIALS_KEY) === 'true';

        if (!shouldRemember) {
            return {
                lembrar: false,
                email: '',
            };
        }

        return {
            lembrar: true,
            email: localStorage.getItem(REMEMBER_EMAIL_KEY) ?? '',
        };
    })();

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState(rememberedLoginData.email);
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [lembrar, setLembrar] = useState(rememberedLoginData.lembrar);
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const content = useMemo(() => {
        return isLogin
            ? {
                title: 'Acesse sua conta',
                subtitle:
                    'Bem-vindo de volta. Digite suas credenciais para continuar acompanhando seus animes.',
                submitLabel: 'Entrar na Central',
                alternateText: 'Não tem uma conta?',
                alternateLinkLabel: 'Cadastre-se gratuitamente',
                alternateLinkTo: '/registro',
            }
            : {
                title: 'Crie sua conta',
                subtitle:
                    'Configure seu perfil para salvar favoritos, notas e acompanhar cada episódio.',
                submitLabel: 'Criar conta na Central',
                alternateText: 'Já possui uma conta?',
                alternateLinkLabel: 'Entre agora',
                alternateLinkTo: '/login',
            };
    }, [isLogin]);

    const authMutation = useMutation({
        mutationFn: async () => {
            if (isLogin) {
                return authService.login({ email, senha });
            }

            return authService.register({ nome, email, senha });
        },
        onSuccess: (result) => {
            setErrorMessage(null);

            if (isLogin) {
                const accessToken =
                    typeof result === 'object' &&
                    result !== null &&
                    'accessToken' in result &&
                    typeof result.accessToken === 'string'
                        ? result.accessToken
                        : '';

                if (accessToken) {
                    setAccessToken(accessToken);
                }

                if (lembrar) {
                    localStorage.setItem(REMEMBER_CREDENTIALS_KEY, 'true');
                    localStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
                } else {
                    localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
                    localStorage.removeItem(REMEMBER_EMAIL_KEY);
                }

                localStorage.removeItem(LEGACY_REMEMBER_PASSWORD_KEY);

                setSuccessMessage('Login realizado com sucesso.');
                navigate('/explorar');
                return;
            }

            setSuccessMessage('Conta criada. Enviamos um link de confirmação para o seu email.');
            setNome('');
            setEmail('');
            setSenha('');
            setConfirmarSenha('');
            setLembrar(false);
        },
        onError: (error) => {
            setSuccessMessage(null);
            setErrorMessage(getErrorMessage(error));
        },
    });

    const validateFields = (): string | null => {
        if (!isLogin && !nome.trim()) {
            return 'Nome é obrigatório.';
        }

        if (!email.trim()) {
            return 'Email é obrigatório.';
        }

        if (!senha.trim()) {
            return 'Senha é obrigatória.';
        }

        if (!isLogin && senha.trim().length < 6) {
            return 'A senha deve ter pelo menos 6 caracteres.';
        }

        if (!isLogin && senha !== confirmarSenha) {
            return 'As senhas não conferem.';
        }

        return null;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = validateFields();

        if (validationError) {
            setSuccessMessage(null);
            setErrorMessage(validationError);
            return;
        }

        setErrorMessage(null);
        authMutation.mutate();
    };

    return (
        <AuthPage>
            <AuthShell>
                <LeftPanel>
                    <Badge>Central de Anime</Badge>

                    <HeroTitle>
                        Organize sua <span>jornada otaku</span>
                        <br />
                        com precisão.
                    </HeroTitle>

                    <HeroText>
                        Rastreamento em tempo real de cada episódio, análise de estatísticas da sua coleção e
                        listas inteligentes.
                    </HeroText>

                    <Stats>
                        <StatCard>
                            <StatValue>+150</StatValue>
                            <StatLabel>Obras catalogadas</StatLabel>
                        </StatCard>

                        <StatCard>
                            <StatValue>Zero</StatValue>
                            <StatLabel>Spoilers indesejados</StatLabel>
                        </StatCard>
                    </Stats>
                </LeftPanel>

                <RightPanel>
                    <Title>{content.title}</Title>
                    <Subtitle>{content.subtitle}</Subtitle>

                    <Form onSubmit={handleSubmit} noValidate>
                        {!isLogin && (
                            <Field>
                                <FieldLabel>Nome</FieldLabel>
                                <FieldControl>
                                    <FieldInput
                                        name="nome"
                                        type="text"
                                        placeholder="Seu nome"
                                        value={nome}
                                        onChange={(event) => setNome(event.target.value)}
                                        disabled={authMutation.isPending}
                                        autoComplete="name"
                                    />
                                </FieldControl>
                            </Field>
                        )}

                        <Field>
                            <FieldLabel>E-mail</FieldLabel>
                            <FieldControl>
                                <FieldIcon>
                                    <Mail size={16} />
                                </FieldIcon>
                                <FieldInput
                                    name="email"
                                    type="email"
                                    placeholder="seu.email@exemplo.com"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    disabled={authMutation.isPending}
                                    autoComplete="email"
                                />
                            </FieldControl>
                        </Field>

                        <Field>
                            <FieldLabel>Senha</FieldLabel>
                            <FieldControl>
                                <FieldIcon>
                                    <Lock size={16} />
                                </FieldIcon>
                                <FieldInput
                                    name="senha"
                                    type={mostrarSenha ? 'text' : 'password'}
                                    placeholder="Digite sua senha"
                                    value={senha}
                                    onChange={(event) => setSenha(event.target.value)}
                                    disabled={authMutation.isPending}
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                />
                                <FieldAction
                                    type="button"
                                    onClick={() => setMostrarSenha((prevState) => !prevState)}
                                    disabled={authMutation.isPending}
                                    aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                                </FieldAction>
                            </FieldControl>
                        </Field>

                        {!isLogin && (
                            <Field>
                                <FieldLabel>Confirmar senha</FieldLabel>
                                <FieldControl>
                                    <FieldIcon>
                                        <Lock size={16} />
                                    </FieldIcon>
                                    <FieldInput
                                        name="confirmarSenha"
                                        type={mostrarConfirmarSenha ? 'text' : 'password'}
                                        placeholder="Repita sua senha"
                                        value={confirmarSenha}
                                        onChange={(event) => setConfirmarSenha(event.target.value)}
                                        disabled={authMutation.isPending}
                                        autoComplete="new-password"
                                    />
                                    <FieldAction
                                        type="button"
                                        onClick={() =>
                                            setMostrarConfirmarSenha((prevState) => !prevState)
                                        }
                                        disabled={authMutation.isPending}
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
                        )}

                        <HelperRow>
                            <CheckboxLabel>
                                <input
                                    type="checkbox"
                                    checked={lembrar}
                                    onChange={(event) => setLembrar(event.target.checked)}
                                    disabled={authMutation.isPending}
                                />
                                Lembrar minha senha
                            </CheckboxLabel>

                            {isLogin && (
                                <InlineLinkButton
                                    type="button"
                                    onClick={() => navigate('/esqueci-minha-senha')}
                                >
                                    Esqueci minha senha
                                </InlineLinkButton>
                            )}
                        </HelperRow>

                        {errorMessage && <Message $variant="error">{errorMessage}</Message>}
                        {successMessage && (
                            <Message $variant="success">{successMessage}</Message>
                        )}

                        <SubmitButton type="submit" disabled={authMutation.isPending}>
                            {authMutation.isPending ? 'Enviando...' : content.submitLabel}
                        </SubmitButton>
                    </Form>

                    <Footer>
                        {content.alternateText}{' '}
                        <FooterLink to={content.alternateLinkTo}>
                            {content.alternateLinkLabel}
                        </FooterLink>
                    </Footer>
                </RightPanel>
            </AuthShell>
        </AuthPage>
    );
};
