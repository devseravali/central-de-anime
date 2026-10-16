import { ArrowLeft, Save } from 'lucide-react';
import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../../services/api';
import {
    AvatarOptionButton,
    AvatarOptionImage,
    AvatarOptionName,
    AvatarPreview,
    BackgroundGrid,
    BackgroundOptionButton,
    BackgroundOptionImage,
    BackButton,
    BannerPreview,
    Card,
    Container,
    Feedback,
    FieldInput,
    FieldLabel,
    FieldsGrid,
    FormCard,
    Heading,
    Page,
    PickerGrid,
    PreviewRow,
    SaveButton,
    SubHeading,
    TopActions,
} from './EditarPerfilStyle';

type PerfilApiResponse = {
    usuario?: {
        nome?: string;
        email?: string;
        status?: string;
        avatar?: string | null;
    };
};

type PersonagemApiItem = {
    id?: number;
    nome?: string;
    imagem?: string;
};

type AvatarOption = {
    id: number;
    nome: string;
    imagem: string;
};

type BackgroundOption = {
    id: string;
    nome: string;
    imagem: string;
};

const defaultAvatar = 'https://via.placeholder.com/200';

const profileBackgroundCandidates = [
    'frieren-t1.jpg',
    'one-piece-t1.jpg',
    'jujutsu-kaisen-t1.jpg',
    'shingeki-no-kyojin-t1.jpg',
    'vinland-saga-t1.jpg',
    'your-lie-in-april.jpg',
    'spy-x-family-t1.jpg',
    'naruto-shippuden-t1.jpg',
];

const getApiOrigin = (): string | null => {
    const baseUrl = import.meta.env.VITE_API_URL;

    if (typeof baseUrl !== 'string' || baseUrl.trim() === '') {
        return null;
    }

    try {
        const parsed = new URL(baseUrl);
        return `${parsed.protocol}//${parsed.host}`;
    } catch {
        return null;
    }
};

const normalizeAvatarUrl = (value: string): string => {
    const normalized = value.trim();

    if (/^https?:\/\//i.test(normalized)) {
        return normalized;
    }

    const origin = getApiOrigin();

    if (!origin) {
        return normalized;
    }

    const relative = normalized
        .replace(/\\/g, '/')
        .replace(/^(?:\.\.\/)+/, '')
        .replace(/^\.\/?/, '')
        .replace(/^\/+/, '');

    return `${origin}/${relative}`;
};

const toAvatarOption = (item: PersonagemApiItem): AvatarOption | null => {
    const id = Number(item.id);
    const nome = item.nome?.trim();
    const imagem = item.imagem?.trim();

    if (!Number.isInteger(id) || id <= 0 || !nome || !imagem) {
        return null;
    }

    return {
        id,
        nome,
        imagem: normalizeAvatarUrl(imagem),
    };
};

const toBackgroundOptions = (): BackgroundOption[] => {
    return profileBackgroundCandidates.map((fileName) => ({
        id: fileName,
        nome: fileName
            .replace(/\.jpg$/i, '')
            .replace(/-/g, ' '),
        imagem: normalizeAvatarUrl(`/images/capas/${fileName}`),
    }));
};

const backgroundOptions = toBackgroundOptions();

const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            return 'Sessão inválida. Faça login novamente.';
        }

        const message = error.response?.data?.message;

        if (typeof message === 'string' && message.trim()) {
            return message;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return 'Não foi possível atualizar sua foto de perfil.';
};

export const EditarPerfil = () => {
    const navigate = useNavigate();
    const [avatarAtual, setAvatarAtual] = useState<string | null>(null);
    const [avatarSelecionado, setAvatarSelecionado] = useState<string | null>(null);
    const [avatarOptions, setAvatarOptions] = useState<AvatarOption[]>([]);
    const [filtroAvatar, setFiltroAvatar] = useState('');
    const [fundoSelecionado, setFundoSelecionado] = useState<string | null>(null);
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(true);
    const [savingAvatar, setSavingAvatar] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [feedbackKind, setFeedbackKind] = useState<'success' | 'error' | null>(null);

    useEffect(() => {
        let mounted = true;

        const carregarDados = async () => {
            const token = localStorage.getItem('accessToken');

            try {
                const [perfilRes, personagensRes] = await Promise.allSettled([
                    token
                        ? api.get<PerfilApiResponse>('/usuario/me', {
                              headers: {
                                  Authorization: `Bearer ${token}`,
                              },
                          })
                        : Promise.resolve({ data: { usuario: { avatar: null } } } as { data: PerfilApiResponse }),
                    api.get<PersonagemApiItem[]>('/personagens'),
                ]);

                if (!mounted) {
                    return;
                }

                const avatar =
                    perfilRes.status === 'fulfilled'
                        ? perfilRes.value.data?.usuario?.avatar ?? null
                        : null;

                const payload =
                    personagensRes.status === 'fulfilled' && Array.isArray(personagensRes.value.data)
                        ? personagensRes.value.data
                        : [];

                const options = payload
                    .map(toAvatarOption)
                    .filter((item): item is AvatarOption => item !== null);

                setAvatarOptions(options);

                const avatarNormalizado = avatar ? normalizeAvatarUrl(avatar) : null;

                setAvatarAtual(avatarNormalizado);
                setAvatarSelecionado(avatarNormalizado ?? options[0]?.imagem ?? null);
                setFundoSelecionado(localStorage.getItem('userProfileBanner') || backgroundOptions[0]?.imagem || null);

                if (perfilRes.status === 'fulfilled') {
                    setNome(perfilRes.value.data?.usuario?.nome?.trim() ?? '');
                    setEmail(perfilRes.value.data?.usuario?.email?.trim() ?? '');
                    setStatus(perfilRes.value.data?.usuario?.status?.trim() ?? '');
                }

                if (!token) {
                    setFeedback('Sessão não encontrada. Faça login novamente.');
                    setFeedbackKind('error');
                } else if (perfilRes.status === 'rejected') {
                    setFeedback('Sessão inválida. Faça login novamente.');
                    setFeedbackKind('error');
                } else if (personagensRes.status === 'rejected') {
                    setFeedback('Não foi possível carregar as fotos dos personagens.');
                    setFeedbackKind('error');
                }
            } catch (error) {
                if (!mounted) {
                    return;
                }

                setFeedback(getErrorMessage(error));
                setFeedbackKind('error');
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        carregarDados();

        return () => {
            mounted = false;
        };
    }, []);

    const salvarAvatar = async () => {
        if (savingAvatar) {
            return;
        }

        const token = localStorage.getItem('accessToken');

        if (!token) {
            setFeedback('Sessão não encontrada. Faça login novamente.');
            setFeedbackKind('error');
            return;
        }

        setSavingAvatar(true);
        setFeedback(null);
        setFeedbackKind(null);

        if (novaSenha && novaSenha.length < 6) {
            setFeedback('A nova senha deve ter no mínimo 6 caracteres.');
            setFeedbackKind('error');
            setSavingAvatar(false);
            return;
        }

        if (novaSenha && novaSenha !== confirmarSenha) {
            setFeedback('A confirmação de senha não confere.');
            setFeedbackKind('error');
            setSavingAvatar(false);
            return;
        }

        const payload: {
            nome?: string;
            email?: string;
            senha?: string;
            avatar?: string | null;
        } = {
            avatar: avatarSelecionado ?? null,
        };

        if (nome.trim()) {
            payload.nome = nome.trim();
        }

        if (email.trim()) {
            payload.email = email.trim();
        }

        if (novaSenha.trim()) {
            payload.senha = novaSenha;
        }

        try {
            await api.put(
                '/usuario/me',
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setAvatarAtual(avatarSelecionado);
            localStorage.setItem('userAvatar', avatarSelecionado ?? '');
            localStorage.setItem('userProfileBanner', fundoSelecionado ?? '');
            window.dispatchEvent(new Event('user-avatar-updated'));
            window.dispatchEvent(new Event('user-banner-updated'));
            setNovaSenha('');
            setConfirmarSenha('');
            setFeedback('Perfil atualizado com sucesso.');
            setFeedbackKind('success');
        } catch (error) {
            setFeedback(getErrorMessage(error));
            setFeedbackKind('error');
        } finally {
            setSavingAvatar(false);
        }
    };

    const avatarOptionsFiltradas = avatarOptions.filter((item) => {
        if (!filtroAvatar.trim()) {
            return true;
        }

        return item.nome.toLowerCase().includes(filtroAvatar.trim().toLowerCase());
    });

    const avatarPreview = avatarSelecionado || avatarAtual || defaultAvatar;
    const bannerPreview = fundoSelecionado || backgroundOptions[0]?.imagem || null;

    return (
        <Page as="main" aria-labelledby="editar-perfil-titulo">
            <Container>
                <TopActions>
                    <BackButton type="button" onClick={() => navigate('/perfil')}>
                        <ArrowLeft size={16} />
                        Voltar ao perfil
                    </BackButton>
                </TopActions>

                <Card>
                    <Heading id="editar-perfil-titulo">Editar perfil</Heading>
                    <SubHeading>
                        Atualize seus dados, escolha um avatar e personalize o fundo do seu perfil.
                    </SubHeading>

                    <FormCard>
                        <SubHeading>Dados básicos da conta</SubHeading>
                        <FieldsGrid>
                            <div>
                                <FieldLabel htmlFor="editar-perfil-nome">Nome</FieldLabel>
                                <FieldInput
                                    id="editar-perfil-nome"
                                    value={nome}
                                    onChange={(event) => setNome(event.target.value)}
                                    placeholder="Seu nome"
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="editar-perfil-email">Email</FieldLabel>
                                <FieldInput
                                    id="editar-perfil-email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    placeholder="seuemail@exemplo.com"
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="editar-perfil-status">Status atual</FieldLabel>
                                <FieldInput
                                    id="editar-perfil-status"
                                    value={status || 'Status indisponível'}
                                    disabled
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="editar-perfil-senha">Nova senha (opcional)</FieldLabel>
                                <FieldInput
                                    id="editar-perfil-senha"
                                    type="password"
                                    value={novaSenha}
                                    onChange={(event) => setNovaSenha(event.target.value)}
                                    placeholder="Mínimo de 6 caracteres"
                                />
                            </div>

                            <div>
                                <FieldLabel htmlFor="editar-perfil-confirmar">Confirmar nova senha</FieldLabel>
                                <FieldInput
                                    id="editar-perfil-confirmar"
                                    type="password"
                                    value={confirmarSenha}
                                    onChange={(event) => setConfirmarSenha(event.target.value)}
                                    placeholder="Repita a nova senha"
                                />
                            </div>
                        </FieldsGrid>
                    </FormCard>

                    <PreviewRow>
                        <AvatarPreview src={avatarPreview} alt="Prévia do avatar selecionado" />
                        <SubHeading>{loading ? 'Carregando personagens...' : 'Selecione abaixo sua nova foto.'}</SubHeading>
                    </PreviewRow>

                    <FormCard>
                        <SubHeading>Fundo do perfil</SubHeading>
                        <BannerPreview $imageUrl={bannerPreview} aria-label="Prévia do fundo do perfil" />

                        <BackgroundGrid>
                            {backgroundOptions.map((option) => (
                                <li key={option.id}>
                                    <BackgroundOptionButton
                                        type="button"
                                        $selected={fundoSelecionado === option.imagem}
                                        onClick={() => setFundoSelecionado(option.imagem)}
                                        aria-label={`Selecionar fundo ${option.nome}`}
                                        aria-pressed={fundoSelecionado === option.imagem}
                                    >
                                        <BackgroundOptionImage src={option.imagem} alt={option.nome} />
                                        <AvatarOptionName>{option.nome}</AvatarOptionName>
                                    </BackgroundOptionButton>
                                </li>
                            ))}
                        </BackgroundGrid>
                    </FormCard>

                    <div>
                        <FieldLabel htmlFor="editar-perfil-busca-avatar">Buscar personagem</FieldLabel>
                        <FieldInput
                            id="editar-perfil-busca-avatar"
                            value={filtroAvatar}
                            onChange={(event) => setFiltroAvatar(event.target.value)}
                            placeholder="Digite o nome do personagem"
                        />
                    </div>

                    {!loading && (
                        <PickerGrid>
                            {avatarOptionsFiltradas.map((option) => (
                                <li key={option.id}>
                                    <AvatarOptionButton
                                        type="button"
                                        $selected={avatarSelecionado === option.imagem}
                                        onClick={() => setAvatarSelecionado(option.imagem)}
                                        aria-label={`Selecionar avatar de ${option.nome}`}
                                        aria-pressed={avatarSelecionado === option.imagem}
                                    >
                                        <AvatarOptionImage src={option.imagem} alt={option.nome} />
                                        <AvatarOptionName>{option.nome}</AvatarOptionName>
                                    </AvatarOptionButton>
                                </li>
                            ))}
                        </PickerGrid>
                    )}

                    <TopActions>
                        <SaveButton
                            type="button"
                            onClick={salvarAvatar}
                            disabled={savingAvatar || loading}
                        >
                            <Save size={16} />
                            {savingAvatar ? 'Salvando...' : 'Salvar perfil'}
                        </SaveButton>

                        {feedback && <Feedback $kind={feedbackKind ?? 'error'}>{feedback}</Feedback>}
                    </TopActions>
                </Card>
            </Container>
        </Page>
    );
};