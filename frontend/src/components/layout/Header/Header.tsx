import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from "../../common/Input/Input";
import { authService } from '../../../services/auth.service';
import { api } from '../../../services/api';
import {
  AuthActionButton,
  HeaderContainer,
  HeaderNav,
  AuthNav,
  SearchForm,
  UlHeader,
  LiHeader,
  LinkHerf,
  HeaderTwo,
  ProfileLink,
  ImageHeader,
  SpanHeader,
  TituloHeader,
} from "./HeaderStyle";

type HeaderPerfilResponse = {
  usuario?: {
    avatar?: string | null;
  };
};

const defaultAvatar = 'https://via.placeholder.com/40';

const getApiOrigin = (): string | null => {
  const baseUrl = import.meta.env.VITE_API_URL;

  if (typeof baseUrl !== 'string' || !baseUrl.trim()) {
    return null;
  }

  try {
    return new URL(baseUrl).origin;
  } catch {
    return null;
  }
};

const toAbsoluteAvatar = (value: string | null | undefined): string => {
  if (!value) {
    return defaultAvatar;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const origin = getApiOrigin();

  if (!origin) {
    return value;
  }

  const normalized = String(value)
    .trim()
    .replace(/\\/g, '/')
    .replace(/^(?:\.\.\/)+/, '')
    .replace(/^\/+/, '');

  return `${origin}/${normalized}`;
};

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('accessToken'))
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    const localAvatar = localStorage.getItem('userAvatar');
    return toAbsoluteAvatar(localAvatar);
  });

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('accessToken')));
  }, [location.pathname]);

  useEffect(() => {
    const loadAvatar = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setAvatarUrl(defaultAvatar);
        return;
      }

      const cached = localStorage.getItem('userAvatar');

      if (cached) {
        setAvatarUrl(toAbsoluteAvatar(cached));
      }

      try {
        const response = await api.get<HeaderPerfilResponse>('/usuario/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const avatar = response.data?.usuario?.avatar ?? null;
        localStorage.setItem('userAvatar', avatar ?? '');
        setAvatarUrl(toAbsoluteAvatar(avatar));
      } catch {
      }
    };

    loadAvatar();
  }, [location.pathname]);

  useEffect(() => {
    const handleAvatarUpdated = () => {
      const localAvatar = localStorage.getItem('userAvatar');
      setAvatarUrl(toAbsoluteAvatar(localAvatar));
    };

    window.addEventListener('user-avatar-updated', handleAvatarUpdated);

    return () => {
      window.removeEventListener('user-avatar-updated', handleAvatarUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_error) {
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userAvatar');
      setIsAuthenticated(false);
      setAvatarUrl(defaultAvatar);
      navigate('/login');
    }
  };

  return (
    <HeaderContainer>
      <HeaderTwo>
        <LinkHerf href="/" aria-label="Central de Anime - Página inicial">
          <TituloHeader>
            Central de <SpanHeader>Anime</SpanHeader>
          </TituloHeader>
        </LinkHerf>

        <HeaderNav aria-label="Navegação principal">
          <UlHeader>
            <LiHeader>
              <LinkHerf href="/explorar">Explorar</LinkHerf>
            </LiHeader>

            <LiHeader>
              <LinkHerf href="/ranking">Ranking</LinkHerf>
            </LiHeader>

            <LiHeader>
              <LinkHerf href="/favoritos">Favoritos</LinkHerf>
            </LiHeader>

            <LiHeader>
              <LinkHerf href="/progresso">Meu Progresso</LinkHerf>
            </LiHeader>
          </UlHeader>
        </HeaderNav>

        <SearchForm role="search">
          <Input
            type="search"
            placeholder="Buscar animes"
            aria-label="Buscar animes"
          />
        </SearchForm>

        {!isAuthenticated && (
          <AuthNav aria-label="Autenticação">
            <UlHeader>
              <LiHeader>
                <LinkHerf href="/login">Entrar</LinkHerf>
              </LiHeader>

              <LiHeader>
                <LinkHerf href="/registro">Registrar</LinkHerf>
              </LiHeader>
            </UlHeader>
          </AuthNav>
        )}

        {isAuthenticated && (
          <AuthNav aria-label="Sessão">
            <UlHeader>
              <LiHeader>
                <AuthActionButton type="button" onClick={handleLogout}>
                  Sair
                </AuthActionButton>
              </LiHeader>
            </UlHeader>
          </AuthNav>
        )}

        <ProfileLink href="/perfil" aria-label="Acessar meu perfil">
          <ImageHeader
            src={avatarUrl}
            alt="Avatar do usuário"
          />
        </ProfileLink>
      </HeaderTwo>
    </HeaderContainer>
  );
};
