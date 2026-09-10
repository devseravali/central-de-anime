import styled from 'styled-components';

export const HeaderContainer = styled.header`
  width: 100%;

  background-color: ${({ theme }) => theme.colors.background};

  padding: 0.75rem 1rem;

  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.02) inset;
`;

export const HeaderTwo = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  max-width: 1200px;

  margin: 0 auto;

  gap: 1.5rem;

  flex-wrap: nowrap;
`;

export const HeaderNav = styled.nav`
  display: flex;
  align-items: center;

  flex: 0 0 auto;

  min-width: 0;
`;

export const AuthNav = styled.nav`
  display: flex;
  align-items: center;

  flex: 0 0 auto;
`;

export const ProfileLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  margin-left: 0.5rem;

  border-radius: 50%;

  overflow: hidden;

  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;

    object-fit: cover;
  }
`;

export const SearchForm = styled.form`
  display: flex;
  align-items: center;

  flex: 1 1 240px;

  min-width: 160px;
  max-width: 360px;

  margin-left: auto;
`;

export const UlHeader = styled.ul`
  display: flex;
  align-items: center;

  gap: 1.25rem;

  padding: 0;
  margin: 0;

  list-style: none;

  white-space: nowrap;
`;

export const LiHeader = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 0.25rem;

  flex-shrink: 0;
`;

export const ImageHeader = styled.img`
  width: 40px;
  height: 40px;

  border-radius: 50%;

  object-fit: cover;

  flex-shrink: 0;
`;

export const LinkHerf = styled.a`
  color: ${({ theme }) => theme.colors.textPrimary};

  text-decoration: none;

  padding: 0.35rem 0.5rem;

  border-radius: 6px;

  white-space: nowrap;

  transition:
    background-color 120ms ease,
    color 120ms ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const TituloHeader = styled.h1`
  display: inline;

  margin: 0;
  padding: 0;

  color: ${({ theme }) => theme.colors.textPrimary};

  font-family: ${({ theme }) =>
    theme.typography.headlineSmall.fontFamily};

  font-size: ${({ theme }) =>
    theme.typography.headlineSmall.fontSize};

  font-weight: ${({ theme }) =>
    theme.typography.headlineSmall.fontWeight};

  line-height: ${({ theme }) =>
    theme.typography.headlineSmall.lineHeight};

  white-space: nowrap;
`;

export const TituloHref = styled.a`
  display: flex;
  align-items: center;

  color: ${({ theme }) => theme.colors.textPrimary};

  text-decoration: none;

  flex-shrink: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SpanHeader = styled.span`
  display: inline;

  margin: 0;
  padding: 0;

  color: ${({ theme }) => theme.colors.primary};

  font-weight: ${({ theme }) =>
    theme.typography.headlineSmall.fontWeight};
`;