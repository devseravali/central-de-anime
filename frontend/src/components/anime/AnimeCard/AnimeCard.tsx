import {
  AnimeCardContainer,
  AnimeCardLink,
  AnimeCardTitle,
} from './AnimeCardStyle';
import { AnimeCover } from '../AnimeCover/AnimeCover';
import type { AnimeData } from '../../../types/AnimeData';

type StudioObj = {
  nome?: string;
  name?: string;
};

type Anime = Omit<AnimeData, 'estudio'> & {
  estudio?: string | StudioObj;
};

interface AnimeCardProps {
  anime: Anime;
}

export const AnimeCard = ({ anime }: AnimeCardProps) => {
  return (
    <AnimeCardContainer>
      <AnimeCardLink to={`/animes/${anime.id}`}>
        <AnimeCover
          src={anime.capaUrl}
          alt={`Capa do anime ${anime.titulo}`}
        />
        <AnimeCardTitle>{anime.titulo}</AnimeCardTitle>
      </AnimeCardLink>
    </AnimeCardContainer>
  );
};