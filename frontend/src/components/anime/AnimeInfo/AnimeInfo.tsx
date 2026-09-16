import {
  SectionInfo,
  InfoP,
  GenreList,
  GenreChip,
  StrongInfo,
  InfoRow,
  SectionRow,
} from './AnimeInfoStyle';

interface AnimeInfoProps {
  ano?: number | string;
  temporada?: number;
  status?: string;
  estacao?: string;
  generos?: string[];
}

export const AnimeInfo = ({
  ano,
  temporada,
  status,
  estacao,
  generos,
}: AnimeInfoProps) => {
  return (
    <SectionInfo>
      {ano !== undefined && (
        <InfoRow>
          <InfoP>
            <StrongInfo>Ano:</StrongInfo> {ano}
          </InfoP>
        </InfoRow>
      )}

      {temporada !== undefined && (
        <InfoRow>
          <InfoP>
            <StrongInfo>Temporada:</StrongInfo> {temporada}
          </InfoP>
        </InfoRow>
      )}

      {status && (
        <InfoRow>
          <InfoP>
            <StrongInfo>Status:</StrongInfo> {status}
          </InfoP>
        </InfoRow>
      )}

      {estacao && (
        <InfoRow>
          <InfoP>
            <StrongInfo>Estação:</StrongInfo> {estacao}
          </InfoP>
        </InfoRow>
      )}

      {generos && generos.length > 0 && (
        <SectionRow aria-label="Gêneros do anime">
          <InfoP>
            <StrongInfo>Gêneros</StrongInfo>
          </InfoP>

          <GenreList>
            {generos.map((genero) => (
              <GenreChip key={genero}>{genero}</GenreChip>
            ))}
          </GenreList>
        </SectionRow>
      )}
    </SectionInfo>
  );
};