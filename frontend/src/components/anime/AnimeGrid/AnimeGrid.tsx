import { AnimeCard } from '../AnimeCard/AnimeCard';
import type { AnimeData } from '../../../types/AnimeData';
import { AnimeGridContainer } from './AnimeGridStyle';

interface AnimeGridProps {
  animes: AnimeData[];
}

export const AnimeGrid = ({ animes }: AnimeGridProps) => {
  return (
    <AnimeGridContainer>
      {animes.map((anime) => (
        <AnimeCard
          key={anime.id}
          anime={anime}
        />
      ))}
    </AnimeGridContainer>
  );
};