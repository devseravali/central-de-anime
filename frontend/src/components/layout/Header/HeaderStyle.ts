import styled from 'styled-components';

export const HeaderContainer = styled.header`
  width: 100%;

  background-color: ${({ theme }) => theme.colors.background};

  padding: 0.75rem 1rem;

  box-shadow: 0 1px 0 ${({ theme }) => theme.colors.headerInset} inset;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 0.65rem 0.75rem;
  }
`;

export const HeaderTwo = styled.div`
  display: flex;
  align-items: center;

  width: 100%;
  max-width: 1200px;

  margin: 0 auto;

  gap: 1rem;

  flex-wrap: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 0.75rem;
  }
`;

export const HeaderNav = styled.nav`
  display: flex;
  align-items: center;

  flex: 0 0 auto;

  min-width: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    order: 4;
    width: 100%;
    flex: 1 1 100%;
  }
`;

export const AuthNav = styled.nav`
  display: flex;
  align-items: center;

  flex: 0 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    order: 6;
    width: 100%;
    flex: 1 1 100%;
  }
`;

export const ProfileLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  border-radius: 50%;

  overflow: hidden;

  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    order: 3;
  }

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

  min-width: 120px;
  max-width: 360px;

  margin-left: auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    order: 5;
    width: 100%;
    max-width: none;
    min-width: 0;
    margin-left: 0;
    flex: 1 1 100%;
  }
`;

export const UlHeader = styled.ul`
  display: flex;
  align-items: center;

  gap: 0.75rem;

  padding: 0;
  margin: 0;

  list-style: none;

  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
    flex-wrap: wrap;
    gap: 0.5rem;
    white-space: normal;
  }
`;

export const LiHeader = styled.li`
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 0.25rem;

  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 0;
    justify-content: flex-start;
  }
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
    background-color: ${({ theme }) => theme.colors.headerHover};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    white-space: normal;
  }
`;

export const AuthActionButton = styled.button`
  color: ${({ theme }) => theme.colors.textPrimary};

  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  border: 0;
  background: transparent;

  white-space: nowrap;

  transition:
    background-color 120ms ease,
    color 120ms ease;

  &:hover {
    background-color: ${({ theme }) => theme.colors.headerHover};
    font-weight: ${({ theme }) => theme.typography.headlineSmall.fontWeight};
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    white-space: normal;
  }
`;

export const ThemeToggleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 44px;
  padding: 0.5rem 0.65rem;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.surfaceElevated};
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover {
    background: ${({ theme }) => theme.colors.headerHover};
    border-color: ${({ theme }) => theme.colors.primary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 3px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    order: 2;
    margin-left: auto;
    min-height: 40px;
    padding: 0.45rem 0.55rem;
  }
`;

export const ThemeStorageNotice = styled.p`
  max-width: 1200px;
  margin: 0.5rem auto 0;
  color: ${({ theme }) => theme.colors.danger};
  font-size: 0.875rem;
`;

export const TituloHeader = styled.h1`
  display: inline;

  margin: 0;
  padding: 0;

  color: ${({ theme }) => theme.colors.textPrimary};

  font-family: ${({ theme }) => theme.typography.display.fontFamily};

  /* Increase logo title size to stand out on the Home page */
  font-size: clamp(1.25rem, 3vw, 2rem);
  font-weight: 800;
  line-height: 1;

  white-space: nowrap;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    font-size: clamp(1.05rem, 5vw, 1.5rem);
  }
`;

export const TituloHref = styled.a`
  display: flex;
  align-items: center;

  color: ${({ theme }) => theme.colors.textPrimary};

  text-decoration: none;

  flex-shrink: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    order: 1;
    min-width: 0;
  }

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