import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from "../../common/Input/Input";
import { authService } from '../../../services/auth.service';
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

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem('accessToken'))
  );

  useEffect(() => {
    setIsAuthenticated(Boolean(localStorage.getItem('accessToken')));
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (_error) {
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
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
            src="https://via.placeholder.com/40"
            alt="Avatar do usuário"
          />
        </ProfileLink>
      </HeaderTwo>
    </HeaderContainer>
  );
};
