import { Link } from 'react-router-dom';
import {
  AnimeCardContainer,
  AnimeCardImage,
  AnimeCardTitle,
} from './AnimeCardStyle';

interface Anime {
  id: string | number;
  titulo: string;
  capaUrl: string;
}

interface AnimeCardProps {
  anime: Anime;
}

function normalizeCapaFilename(fileName: string): string {
  const directMap: Record<string, string> = {
    'kimetsu-no-yaiba-mugen-t2.jpg': 'kimestu-no-yaiba-t2.jpg',
    'kimetsu-no-yaiba-t4.jpg': 'kimestu-no-yaiba-t4.jpg',
    'kimetsu-no-yaiba-t5.jpg': 'kimestu-no-yaiba-t5.jpg',
    'kimetsu-no-yaiba-filme-1-akaza-sairai.jpg': 'kimestu-no-yaiba-filme-1-akaza-sairai.jpg',
    'jujutsu-kaisen-inventario-oculto.jpg': 'jujutsu-kaisen-kaigyoku-gyokusetsu.jpg',
    'jujutsu-kaisen-incidente-de-shibuya.jpg': 'jujutsu-kaisen-shibuya-x-shimetsu.jpg',
    'made-in-abyss-the-retsujitsu-no-ougonkyou.jpg': 'made-in-abyss-retsujitsu-no-ougonkyou.jpg',
  };

  const mapped = directMap[fileName];

  if (mapped) {
    return mapped;
  }

  const narutoMatch = fileName.match(/^naruto-shippuden-t(\d+)\.jpg$/i);

  if (narutoMatch) {
    return `naruto-shippuden-${narutoMatch[1]}.jpg`;
  }

  return fileName;
}

function resolveCapaUrl(capaUrl: string): string {
  if (!capaUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(capaUrl)) {
    return capaUrl;
  }

  const cleanedPath = capaUrl
    .replace(/^(?:\.\.\/)+/, '')
    .replace(/^\/+/, '');

  const pathParts = cleanedPath.split('/');
  const originalFilename = pathParts[pathParts.length - 1];

  if (originalFilename) {
    pathParts[pathParts.length - 1] = normalizeCapaFilename(originalFilename);
  }

  const normalizedPath = pathParts.join('/');

  const apiBase = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000')
    .replace(/\/+$/, '');

  return `${apiBase}/${normalizedPath}`;
}

export const AnimeCard = ({ anime }: AnimeCardProps) => {
  return (
    <AnimeCardContainer>
        <Link to={`/animes/${anime.id}`}>
          <AnimeCardImage
            src={resolveCapaUrl(anime.capaUrl)}
            alt={`Capa do anime ${anime.titulo}`}
          />
        </Link>

        <AnimeCardTitle>{anime.titulo}</AnimeCardTitle>
    </AnimeCardContainer>
  );
};