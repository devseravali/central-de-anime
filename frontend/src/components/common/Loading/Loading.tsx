import {
  LoadingContainer,
  LoadingMessage,
  LoadingErrorMessage,
  Progress,
  LoadingH2,
} from './LoadingStyle';

type LoadingProps = {
  error?: string | null;
};

export const Loading = ({ error }: LoadingProps) => {
  if (error) {
    return (
      <LoadingContainer
        as="aside"
        role="alert"
        aria-live="assertive"
      >
        <LoadingH2>Erro</LoadingH2>

        <LoadingErrorMessage>
          Não foi possível carregar o conteúdo: {error}
        </LoadingErrorMessage>
      </LoadingContainer>
    );
  }

  return (
    <LoadingContainer
      as="section"
      role="status"
      aria-busy="true"
    >
      <Progress aria-hidden="true" />

      <LoadingMessage>
        Carregando...
      </LoadingMessage>
    </LoadingContainer>
  );
};