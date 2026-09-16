import { Link } from 'react-router-dom';
import {
  AnimeCardContainer,
  AnimeCardTitle,
} from './AnimeCardStyle';
import { AnimeCover } from '../AnimeCover/AnimeCover';
import type { AnimeData } from '../../../types/AnimeData';

type StudioObj = { nome?: string; name?: string };

type Anime = Omit<AnimeData, 'estudio'> & {
  estudio?: string | StudioObj;
};

interface AnimeCardProps {
  anime: Anime;
}

const estacaoNomePorId: Record<number, string> = {
  1: 'Primavera',
  2: 'Verão',
  3: 'Outono',
  4: 'Inverno',
};

export const AnimeCard = ({ anime }: AnimeCardProps) => {
  const estudioName =
    typeof anime.estudio === 'string'
      ? anime.estudio
      : anime.estudio?.nome || anime.estudio?.name || '';
  const estacaoName =
    anime.estacao ||
    (typeof anime.estacaoId === 'number'
      ? estacaoNomePorId[anime.estacaoId] || `ID ${anime.estacaoId}`
      : '');

  return (
    <AnimeCardContainer>
      <Link to={`/animes/${anime.id}`}>
        <AnimeCover
          src={anime.capaUrl}
          alt={`Capa do anime ${anime.titulo}`}
        />
      </Link>

      <AnimeCardTitle>{anime.titulo}</AnimeCardTitle>
      {typeof anime.temporada === 'number' ? (
        <p>Temporada: {anime.temporada}</p>
      ) : null}
      {estacaoName ? (
        <p>Estação: {estacaoName}</p>
      ) : null}
      {estudioName ? (
        <p>
          {estudioName}
        </p>
      ) : null}
    </AnimeCardContainer>
  );
};