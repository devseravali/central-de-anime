import { getApiBaseUrl } from './apiUrl';

function normalizeCapaFilename(fileName: string): string {
  const directMap: Record<string, string> = {
    'kimetsu-no-yaiba-mugen-t2.jpg': 'kimestu-no-yaiba-t2.jpg',
    'kimetsu-no-yaiba-t4.jpg': 'kimestu-no-yaiba-t4.jpg',
    'kimetsu-no-yaiba-t5.jpg': 'kimestu-no-yaiba-t5.jpg',
    'kimetsu-no-yaiba-filme-1-akaza-sairai.jpg':
      'kimestu-no-yaiba-filme-1-akaza-sairai.jpg',
    'jujutsu-kaisen-inventario-oculto.jpg':
      'jujutsu-kaisen-kaigyoku-gyokusetsu.jpg',
    'jujutsu-kaisen-incidente-de-shibuya.jpg':
      'jujutsu-kaisen-shibuya-x-shimetsu.jpg',
    'made-in-abyss-the-retsujitsu-no-ougonkyou.jpg':
      'made-in-abyss-retsujitsu-no-ougonkyou.jpg',
  };

  const mapped = directMap[fileName];

  if (mapped) {
    return mapped;
  }

  const narutoMatch = fileName.match(
    /^naruto-shippuden-(?:t)?(\d+)\.jpg$/i
  );

  if (narutoMatch) {
    return `naruto-shippuden-t${narutoMatch[1]}.jpg`;
  }

  return fileName;
}

export function resolveAnimeCoverUrl(
  capaUrl: string | null | undefined
): string {
  if (!capaUrl) {
    return '';
  }

  if (/^https?:\/\//i.test(capaUrl)) {
    return capaUrl;
  }

  const cleanedPath = capaUrl
    .trim()
    .replace(/^(?:\.\.\/)+/, '')
    .replace(/^\/+/, '');

  const pathParts = cleanedPath.split('/');
  const originalFilename = pathParts[pathParts.length - 1];

  if (originalFilename) {
    pathParts[pathParts.length - 1] =
      normalizeCapaFilename(originalFilename);
  }

  return `${getApiBaseUrl()}/${pathParts.join('/')}`;
}
