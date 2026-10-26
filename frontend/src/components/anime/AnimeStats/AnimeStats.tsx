import {
  StatsContainer,
  StatItem,
  StatLabel,
  StatValue,
} from './AnimeStatsStyle';

interface AnimeStatsProps {
  quantidadeEpisodios?: number;
}

export const AnimeStats = ({
  quantidadeEpisodios,
}: AnimeStatsProps) => {
  if (
    typeof quantidadeEpisodios !== 'number' ||
    !Number.isFinite(quantidadeEpisodios) ||
    !Number.isInteger(quantidadeEpisodios) ||
    quantidadeEpisodios < 0
  ) {
    return null;
  }

  return (
    <StatsContainer aria-label="Estatísticas do anime">
      <StatItem>
        <StatLabel>Episódios</StatLabel>
        <StatValue>{quantidadeEpisodios}</StatValue>
      </StatItem>
    </StatsContainer>
  );
};