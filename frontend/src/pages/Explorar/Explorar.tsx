import { useSearchParams } from 'react-router-dom';
import { AnimeGrid } from '../../components/anime/AnimeGrid/AnimeGrid';
import { Loading } from '../../components/common/Loading/Loading';
import { ErrorMessage } from '../../components/common/ErrorMessage/ErrorMessage';
import { useAnimes } from '../../hooks/UseAnime/UseAnime';
import { Button } from '../../components/common/Button/Button';
import {
  ButtonContainer,
  MainContainer,
  H1Explorar,
  EmptyStateText,
} from './ExplorarStyle';

export const Explorar = () => {
  const [searchParams] = useSearchParams();
  const buscaNormalizada = (searchParams.get('busca') ?? '').trim();

  const {
    data,
    isLoading,
    error,
    isFetchNextPageError,
    fetchNextPage,
    hasNextPage,
    isRefetching,
    isFetchingNextPage,
    refetch,
  } = useAnimes(buscaNormalizada);

  const animesExibidos =
    data?.pages.flatMap((page) => page.items) ?? [];
  const isSearching = buscaNormalizada.length > 0;

  if (isLoading) {
    return <Loading />;
  }

  if (error && !data) {
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
      <H1Explorar>
        {isSearching
          ? `Resultados para "${buscaNormalizada}"`
          : 'Explorar animes'}
      </H1Explorar>

      {animesExibidos.length === 0 && (
        <EmptyStateText>
          {isSearching
            ? 'Nenhum anime encontrado para essa busca.'
            : 'Nenhum anime disponível no catálogo no momento.'}
        </EmptyStateText>
      )}

      <AnimeGrid animes={animesExibidos} />

      {error && data && (
        <>
          <div role="alert">
            <ErrorMessage
              message={
                isFetchNextPageError
                  ? 'Não foi possível carregar mais animes. Tente novamente.'
                  : 'Não foi possível atualizar os animes. Os resultados carregados continuam disponíveis.'
              }
            />
          </div>
          {!isFetchNextPageError && (
            <Button
              onClick={() => void refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? 'Atualizando...' : 'Tentar atualizar'}
            </Button>
          )}
        </>
      )}

      {animesExibidos.length > 0 && (
        <ButtonContainer>
          <Button
            onClick={carregarMaisAnimes}
            disabled={!hasNextPage || isFetchingNextPage}
          >
            {isFetchingNextPage
              ? 'Carregando...'
              : isFetchNextPageError
              ? 'Tentar novamente'
              : hasNextPage
              ? 'Carregar mais animes'
              : 'Todos os animes foram carregados'}
          </Button>
        </ButtonContainer>
      )}
    </MainContainer>
  );
};