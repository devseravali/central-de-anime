export interface ValidacaoAnimes {
  id: number;
  anime_id: number;
  nome: string;
  titulo_portugues: string;
  titulo_ingles: string;
  titulo_japones: string;
  estudio_id: number;
}

export type ValidacaoAnimesInput = {
  id?: number | string;
  anime_id?: number | string;
  nome?: string;
  titulo_portugues?: string;
  titulo_ingles?: string;
  titulo_japones?: string;
  estudio_id?: number | string;
};

function toPositiveInt(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;

  const n =
    typeof value === 'number'
      ? value
      : typeof value === 'string'
        ? Number(value)
        : NaN;

  if (!Number.isInteger(n) || n <= 0) return null;
  return n;
}

function toStringOrEmpty(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'string') return '';
  return value.trim();
}

export function validarAnimePayload(data: unknown): ValidacaoAnimes | null {
  if (typeof data !== 'object' || data === null) return null;

  const p = data as ValidacaoAnimesInput;

  const nome = toStringOrEmpty(p.nome);
  if (nome.length < 2) return null;

  const estudioId = toPositiveInt(p.estudio_id);
  if (!estudioId) return null;

  const id = toPositiveInt(p.id) ?? 0;
  const animeId = toPositiveInt(p.anime_id) ?? 0;

  return {
    id,
    anime_id: animeId,
    nome,
    titulo_portugues: toStringOrEmpty(p.titulo_portugues),
    titulo_ingles: toStringOrEmpty(p.titulo_ingles),
    titulo_japones: toStringOrEmpty(p.titulo_japones),
    estudio_id: estudioId,
  };
}