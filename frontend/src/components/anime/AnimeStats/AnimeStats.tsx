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
  return (
    <StatsContainer aria-label="Estatísticas do anime">
      {quantidadeEpisodios !== undefined && (
        <StatItem>
          <StatLabel>Episódios</StatLabel>
          <StatValue>{quantidadeEpisodios}</StatValue>
        </StatItem>
      )}
    </StatsContainer>
  );
};