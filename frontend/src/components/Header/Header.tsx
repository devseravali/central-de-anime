import { Input } from "../Input/Input";
import {
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
