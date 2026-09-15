import { Link } from 'react-router-dom';
import {
  AnimeCardContainer,
  AnimeCardTitle,
} from './AnimeCardStyle';
import { AnimeCover } from '../AnimeCover/AnimeCover';

interface Anime {
  id: string | number;
  titulo: string;
  capaUrl: string;
}

interface AnimeCardProps {
  anime: Anime;
}

export const AnimeCard = ({ anime }: AnimeCardProps) => {
  return (
    <AnimeCardContainer>
      <Link to={`/animes/${anime.id}`}>
        <AnimeCover
          src={anime.capaUrl}
          alt={`Capa do anime ${anime.titulo}`}
        />
      </Link>

      <AnimeCardTitle>{anime.titulo}</AnimeCardTitle>
    </AnimeCardContainer>
  );
};