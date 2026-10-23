import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAppTheme } from '../../../providers/ThemeContext';
import { Input } from "../../common/Input/Input";
import { authService } from '../../../services/auth.service';
import { api, clearAuthSession, getAccessToken } from '../../../services/api';
import type { UsuarioProfileResponse } from '../../../services/user.service';
import { getApiOrigin } from '../../../utils/apiUrl';
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
  ThemeToggleButton,
  ThemeStorageNotice,
} from "./HeaderStyle";

const defaultAvatar = 'https://via.placeholder.com/40';
const AUTH_STATE_CHANGED_EVENT = 'auth-state-changed';

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
  const { mode, toggleTheme, storageError } = useAppTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    Boolean(getAccessToken())
  );
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    const localAvatar = localStorage.getItem('userAvatar');
    return toAbsoluteAvatar(localAvatar);
  });
  const searchTermFromUrl = useMemo(() => {
    if (location.pathname !== '/explorar') {
      return '';
    }

    const params = new URLSearchParams(location.search);
    return (params.get('busca') ?? '').trim();
  }, [location.pathname, location.search]);

  useEffect(() => {
    const loadAvatar = async () => {
      const token = getAccessToken();

      if (!token) {
        setAvatarUrl(defaultAvatar);
        return;
      }

      const cached = localStorage.getItem('userAvatar');

      if (cached) {
        setAvatarUrl(toAbsoluteAvatar(cached));
      }

      try {
        const response = await api.get<UsuarioProfileResponse>('/usuario/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const avatar = response.data?.usuario?.avatar ?? null;
        localStorage.setItem('userAvatar', avatar ?? '');
        setAvatarUrl(toAbsoluteAvatar(avatar));
      } catch {
        setAvatarUrl(toAbsoluteAvatar(cached));
      }
    };

    loadAvatar();
  }, [location.pathname]);

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(getAccessToken()));
    };

    const handleAvatarUpdated = () => {
      const localAvatar = localStorage.getItem('userAvatar');
      setAvatarUrl(toAbsoluteAvatar(localAvatar));
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthState);
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('user-avatar-updated', handleAvatarUpdated);

    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthState);
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('user-avatar-updated', handleAvatarUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Falha ao encerrar sessão no servidor:', error);
    } finally {
      clearAuthSession();
      localStorage.removeItem('userAvatar');
      setAvatarUrl(defaultAvatar);
      navigate('/login');
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const rawSearchTerm = formData.get('header-search');
    const normalizedSearch =
      typeof rawSearchTerm === 'string'
        ? rawSearchTerm.trim()
        : '';
    const destination = normalizedSearch
      ? `/explorar?busca=${encodeURIComponent(normalizedSearch)}`
      : '/explorar';

    if (`${location.pathname}${location.search}` === destination) {
      return;
    }

    navigate(destination);
  };

  return (
    <HeaderContainer>
      <HeaderTwo>
        <LinkHerf as={Link} to="/" aria-label="Central de Anime - Página inicial">
          <TituloHeader>
            Central de <SpanHeader>Anime</SpanHeader>
          </TituloHeader>
        </LinkHerf>

        <HeaderNav aria-label="Navegação principal">
          <UlHeader>
            <LiHeader>
              <LinkHerf as={Link} to="/explorar">Explorar</LinkHerf>
            </LiHeader>

            <LiHeader>
              <LinkHerf as={Link} to="/ranking">Ranking</LinkHerf>
            </LiHeader>

            <LiHeader>
              <LinkHerf as={Link} to="/favoritos">Favoritos</LinkHerf>
            </LiHeader>

            <LiHeader>
              <LinkHerf as={Link} to="/progresso">Meu Progresso</LinkHerf>
            </LiHeader>
          </UlHeader>
        </HeaderNav>

        <SearchForm role="search" onSubmit={handleSearchSubmit}>
          <Input
            key={`${location.pathname}:${location.search}`}
            name="header-search"
            type="search"
            placeholder="Buscar animes"
            aria-label="Buscar animes"
            defaultValue={searchTermFromUrl}
          />
        </SearchForm>

        <ThemeToggleButton
          type="button"
          onClick={toggleTheme}
          aria-label={mode === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
          aria-pressed={mode === 'dark'}
        >
          {mode === 'dark' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
        </ThemeToggleButton>

        {!isAuthenticated && (
          <AuthNav aria-label="Autenticação">
            <UlHeader>
              <LiHeader>
                <LinkHerf as={Link} to="/login">Entrar</LinkHerf>
              </LiHeader>

              <LiHeader>
                <LinkHerf as={Link} to="/registro">Registrar</LinkHerf>
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

        <ProfileLink as={Link} to="/perfil" aria-label="Acessar meu perfil">
          <ImageHeader
            src={avatarUrl}
            alt="Avatar do usuário"
          />
        </ProfileLink>
      </HeaderTwo>
      {storageError && <ThemeStorageNotice role="status">{storageError}</ThemeStorageNotice>}
    </HeaderContainer>
  );
};
