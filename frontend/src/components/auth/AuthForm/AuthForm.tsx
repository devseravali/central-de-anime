import { useMemo, useState } from 'react';
import { isAxiosError } from 'axios';
import { useMutation } from '@tanstack/react-query';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { authService } from '../../../services/auth.service';
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

    return 'Nao foi possivel concluir a solicitacao. Tente novamente.';
};

export const AuthForm = ({ mode }: AuthFormProps) => {
    const navigate = useNavigate();

    const isLogin = mode === 'login';

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [lembrar, setLembrar] = useState(false);
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
                alternateText: 'Nao tem uma conta?',
                alternateLinkLabel: 'Cadastre-se gratuitamente',
                alternateLinkTo: '/registro',
            }
            : {
                title: 'Crie sua conta',
                subtitle:
                    'Configure seu perfil para salvar favoritos, notas e acompanhar cada episodio.',
                submitLabel: 'Criar conta na Central',
                alternateText: 'Ja possui uma conta?',
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
        onSuccess: () => {
            setErrorMessage(null);

            if (isLogin) {
                setSuccessMessage('Login realizado com sucesso.');
                navigate('/explorar');
                return;
            }

            setSuccessMessage('Conta criada com sucesso. Faça login para continuar.');
            setNome('');
            setEmail('');
            setSenha('');
            setConfirmarSenha('');
            navigate('/login');
        },
        onError: (error) => {
            setSuccessMessage(null);
            setErrorMessage(getErrorMessage(error));
        },
    });

    const validateFields = (): string | null => {
        if (!isLogin && !nome.trim()) {
            return 'Nome e obrigatorio.';
        }

        if (!email.trim()) {
            return 'Email e obrigatorio.';
        }

        if (!senha.trim()) {
            return 'Senha e obrigatoria.';
        }

        if (!isLogin && senha.trim().length < 6) {
            return 'A senha deve ter pelo menos 6 caracteres.';
        }

        if (!isLogin && senha !== confirmarSenha) {
            return 'As senhas nao conferem.';
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
                    <Badge>Central de Anime v3.4</Badge>

                    <HeroTitle>
                        Organize sua <span>jornada otaku</span>
                        <br />
                        com precisao.
                    </HeroTitle>

                    <HeroText>
                        Rastreamento em tempo real de cada episodio, analise de estatisticas da sua colecao e
                        listas inteligentes.
                    </HeroText>

                    <Stats>
                        <StatCard>
                            <StatValue>+12.400</StatValue>
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
                                                ? 'Ocultar confirmacao de senha'
                                                : 'Mostrar confirmacao de senha'
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
                                Lembrar de mim por 30 dias
                            </CheckboxLabel>

                            {isLogin && (
                                <InlineLinkButton type="button">
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
