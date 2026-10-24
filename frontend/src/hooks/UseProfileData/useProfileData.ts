import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';

import { api, getAccessToken } from '../../services/api';
import { favoritoService } from '../../services/favorito.service';
import { progressoService } from '../../services/progresso.service';
import { userService } from '../../services/user.service';

type RankingPontosResponse = {
    pontos?: number;
};

type ConquistaItem = {
    id: string;
    nome: string;
    descricao: string;
    categoria: string;
    unlocked: boolean;
    progress?: {
        current?: number;
        target?: number;
        percent?: number;
    };
};

type ConquistasResponse = {
    resumo?: {
        total?: number;
        desbloqueadas?: number;
    };
    conquistas?: ConquistaItem[];
};

type ProfileData = {
    nome: string;
    email: string;
    avatar: string | null;
    status: string;
    pontosArquivo: number | null;
    totalFavoritosAnimes: number;
    totalFavoritosPersonagens: number;
    episodiosConcluidos: number;
    totalProgressos: number;
    conquistas: ConquistaItem[];
    totalConquistasDesbloqueadas: number;
};

const initialProfileData: ProfileData = {
    nome: 'Perfil',
    email: '',
    avatar: null,
    status: 'Status indisponivel',
    pontosArquivo: null,
    totalFavoritosAnimes: 0,
    totalFavoritosPersonagens: 0,
    episodiosConcluidos: 0,
    totalProgressos: 0,
    conquistas: [],
    totalConquistasDesbloqueadas: 0,
};

const getErrorMessage = (error: unknown): string => {
    if (isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            return '';
        }

        const message = error.response?.data?.message;

        if (typeof message === 'string' && message.trim()) {
            const normalized = message.toLowerCase();

            if (normalized.includes('token') || normalized.includes('autentic')) {
                return '';
            }

            return message;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return 'Não foi possível carregar seu perfil.';
};

export const useProfileData = () => {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [profileData, setProfileData] =
        useState<ProfileData>(initialProfileData);

    useEffect(() => {
        let mounted = true;
        let requestVersion = 0;
        let avatarVersion = 0;

        const carregarPerfil = async () => {
            const currentRequest = ++requestVersion;
            const currentAvatarVersion = avatarVersion;
            setLoading(true);
            setErrorMessage(null);
            setProfileData(initialProfileData);

            if (!getAccessToken()) {
                setErrorMessage(
                    'Sessão não encontrada. Faça login para ver seu perfil.',
                );
                setLoading(false);
                return;
            }

            try {
                const response = await userService.buscarMeuPerfil();
                const usuario = response.usuario;

                if (!mounted || currentRequest !== requestVersion) {
                    return;
                }

                const id = Number(usuario?.id);

                setProfileData((current) => ({
                    ...current,
                    nome: usuario?.nome?.trim() || 'Perfil',
                    email: usuario?.email?.trim() || '',
                    ...(currentAvatarVersion === avatarVersion
                        ? { avatar: usuario?.avatar ?? null }
                        : {}),
                    status: usuario?.status?.trim() || 'Status indisponivel',
                }));

                if (!Number.isInteger(id) || id <= 0) {
                    setErrorMessage(
                        'Não foi possível identificar seu usuário para carregar os demais dados.',
                    );
                    return;
                }

                const [
                    pontosRes,
                    favoritosAnimesRes,
                    favoritosPersonagensRes,
                    progressosRes,
                    conquistasRes,
                ] = await Promise.allSettled([
                    api.get<RankingPontosResponse>(`/ranking/${id}/pontos`),
                    favoritoService.AnimesFavoritos(id),
                    favoritoService.PersonagensFavoritos(id),
                    progressoService.obterProgressosUsuario(id),
                    api.get<ConquistasResponse>(`/usuarios/${id}/conquistas`),
                ]);

                if (!mounted || currentRequest !== requestVersion) {
                    return;
                }

                setProfileData((current) => ({
                    ...current,
                    ...(pontosRes.status === 'fulfilled'
                        ? {
                              pontosArquivo: Number.isFinite(
                                  Number(pontosRes.value.data?.pontos),
                              )
                                  ? Number(pontosRes.value.data?.pontos)
                                  : null,
                          }
                        : {}),
                    ...(favoritosAnimesRes.status === 'fulfilled'
                        ? {
                              totalFavoritosAnimes:
                                  favoritosAnimesRes.value.length,
                          }
                        : {}),
                    ...(favoritosPersonagensRes.status === 'fulfilled'
                        ? {
                              totalFavoritosPersonagens:
                                  favoritosPersonagensRes.value.length,
                          }
                        : {}),
                    ...(progressosRes.status === 'fulfilled'
                        ? {
                              totalProgressos: progressosRes.value.length,
                              episodiosConcluidos:
                                  progressosRes.value.filter(
                                      (item) => item.assistido === true,
                                  ).length,
                          }
                        : {}),
                    ...(conquistasRes.status === 'fulfilled'
                        ? {
                              conquistas: Array.isArray(
                                  conquistasRes.value.data?.conquistas,
                              )
                                  ? conquistasRes.value.data.conquistas
                                  : [],
                              totalConquistasDesbloqueadas: Number(
                                  conquistasRes.value.data?.resumo
                                      ?.desbloqueadas ?? 0,
                              ),
                          }
                        : {}),
                }));
            } catch (error) {
                if (!mounted || currentRequest !== requestVersion) {
                    return;
                }

                setErrorMessage(getErrorMessage(error));
            } finally {
                if (mounted && currentRequest === requestVersion) {
                    setLoading(false);
                }
            }
        };

        const sincronizarSessao = () => {
            void carregarPerfil();
        };

        const sincronizarStorage = (event: StorageEvent) => {
            if (event.key === 'accessToken' || event.key === null) {
                void carregarPerfil();
            } else if (event.key === 'userAvatar') {
                sincronizarAvatar();
            }
        };

        const sincronizarAvatar = () => {
            avatarVersion += 1;
            setProfileData((current) => ({
                ...current,
                avatar: localStorage.getItem('userAvatar') || null,
            }));
        };

        window.addEventListener('user-avatar-updated', sincronizarAvatar);
        window.addEventListener('auth-state-changed', sincronizarSessao);
        window.addEventListener('storage', sincronizarStorage);
        void carregarPerfil();

        return () => {
            mounted = false;
            window.removeEventListener('user-avatar-updated', sincronizarAvatar);
            window.removeEventListener('auth-state-changed', sincronizarSessao);
            window.removeEventListener('storage', sincronizarStorage);
        };
    }, []);

    return {
        loading,
        errorMessage,
        ...profileData,
    };
};
