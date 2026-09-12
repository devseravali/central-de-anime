import { AnimeGrid } from '../../components/anime/AnimeGrid/AnimeGrid';
import { Loading } from '../../components/common/Loading/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { useAnimes } from '../../hooks/UseAnime/UseAnime';
import { Button } from '../../components/common/Button/Button';
import { ButtonContainer, MainContainer, H1Explorar } from './ExplorarStyle';

export const Explorar = () => {
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAnimes();

  const animesExibidos =
    data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <ErrorMessage message="Não foi possível carregar os animes." />
    );
  }

  const carregarMaisAnimes = () => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    fetchNextPage();
  };

  return (
    <MainContainer> 
      <H1Explorar>Explorar animes</H1Explorar>

      <AnimeGrid animes={animesExibidos} />

      <ButtonContainer>
        <Button
          onClick={carregarMaisAnimes}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? 'Carregando...'
            : hasNextPage
            ? 'Carregar mais animes'
            : 'Todos os animes foram carregados'}
        </Button>
      </ButtonContainer>
    </MainContainer>
  );
};