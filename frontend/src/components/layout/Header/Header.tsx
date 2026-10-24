import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Moon, Sun } from 'lucide-react';
import { useAppTheme } from '../../../providers/ThemeContext';
import { Input } from "../../common/Input/Input";
import { useAvatarImage } from '../../../hooks/UseAvatarImage/useAvatarImage';
import { authService } from '../../../services/auth.service';
import { clearAuthSession, getAccessToken } from '../../../services/api';
import { userService } from '../../../services/user.service';
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
  const [avatarRefreshKey, setAvatarRefreshKey] = useState(0);
  const avatarRequestVersion = useRef(0);
  const [avatarUrl, setAvatarUrl] = useState<string>(() => {
    const localAvatar = localStorage.getItem('userAvatar');
    return toAbsoluteAvatar(localAvatar);
  });
  const avatarImage = useAvatarImage(avatarUrl);
  const searchTermFromUrl = useMemo(() => {
    if (location.pathname !== '/explorar') {
      return '';
    }

    const params = new URLSearchParams(location.search);
    return (params.get('busca') ?? '').trim();
  }, [location.pathname, location.search]);

  useEffect(() => {
    let mounted = true;

    const loadAvatar = async () => {
      const currentRequest = ++avatarRequestVersion.current;
      const token = getAccessToken();

      if (!token) {
        if (mounted && currentRequest === avatarRequestVersion.current) {
          setAvatarUrl(defaultAvatar);
        }
        return;
      }

      const cached = localStorage.getItem('userAvatar');

      if (cached) {
        setAvatarUrl(toAbsoluteAvatar(cached));
      }

      try {
        const response = await userService.buscarMeuPerfil();

        if (!mounted || currentRequest !== avatarRequestVersion.current) {
          return;
        }

        const avatar = response.usuario?.avatar ?? null;
        localStorage.setItem('userAvatar', avatar ?? '');
        setAvatarUrl(toAbsoluteAvatar(avatar));
      } catch {
        if (mounted && currentRequest === avatarRequestVersion.current) {
          setAvatarUrl(toAbsoluteAvatar(cached));
        }
      }
    };

    void loadAvatar();

    return () => {
      mounted = false;
      avatarRequestVersion.current += 1;
    };
  }, [avatarRefreshKey]);

  useEffect(() => {
    const syncAuthState = () => {
      avatarRequestVersion.current += 1;
      setIsAuthenticated(Boolean(getAccessToken()));
      setAvatarRefreshKey((current) => current + 1);
    };

    const handleAvatarUpdated = () => {
      avatarRequestVersion.current += 1;
      const localAvatar = localStorage.getItem('userAvatar');
      setAvatarUrl(toAbsoluteAvatar(localAvatar));
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'accessToken' || event.key === null) {
        syncAuthState();
      } else if (event.key === 'userAvatar') {
        avatarRequestVersion.current += 1;
        setAvatarUrl(toAbsoluteAvatar(event.newValue));
      }
    };

    window.addEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthState);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('user-avatar-updated', handleAvatarUpdated);

    return () => {
      window.removeEventListener(AUTH_STATE_CHANGED_EVENT, syncAuthState);
      window.removeEventListener('storage', handleStorage);
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
            src={avatarImage.src}
            alt="Avatar do usuário"
            onError={avatarImage.onError}
          />
        </ProfileLink>
      </HeaderTwo>
      {storageError && <ThemeStorageNotice role="status">{storageError}</ThemeStorageNotice>}
    </HeaderContainer>
  );
};
