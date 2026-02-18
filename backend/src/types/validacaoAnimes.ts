export interface ValidacaoAnimes {
  id: number;
  anime_id: number;
  titulo: string;
  estudio_id: number;
  tipo?: string;
  temporada?: number;
  status_id?: number;
  ano?: number;
  estacao_id?: number;
  episodios?: number;
  sinopse?: string;
  capaUrl?: string;
}

export type ValidacaoAnimesInput = {
  id?: number | string;
  anime_id?: number | string;
  titulo?: string;
  estudio_id?: number | string;
  tipo?: string;
  temporada?: number | string;
  status_id?: number | string;
  ano?: number | string;
  estacao_id?: number | string;
  episodios?: number | string;
  sinopse?: string;
  capaUrl?: string;
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

  const titulo = toStringOrEmpty(p.titulo);
  if (titulo.length < 2) return null;

  const estudio_id = toPositiveInt(p.estudio_id);
  if (!estudio_id) return null;

  const id = toPositiveInt(p.id) ?? 0;
  const anime_id = toPositiveInt(p.anime_id) ?? 0;

  const tipo = toStringOrEmpty(p.tipo);
  const temporada = toPositiveInt(p.temporada);
  const status_id = toPositiveInt(p.status_id);
  const ano = toPositiveInt(p.ano);
  const estacao_id = toPositiveInt(p.estacao_id);
  const episodios = toPositiveInt(p.episodios);
  const sinopse = toStringOrEmpty(p.sinopse);
  const capaUrl = toStringOrEmpty(p.capaUrl);

  return {
    id,
    anime_id,
    titulo,
    estudio_id,
    ...(tipo ? { tipo } : {}),
    ...(temporada ? { temporada } : {}),
    ...(status_id ? { status_id } : {}),
    ...(ano ? { ano } : {}),
    ...(estacao_id ? { estacao_id } : {}),
    ...(episodios ? { episodios } : {}),
    ...(sinopse ? { sinopse } : {}),
    ...(capaUrl ? { capaUrl } : {}),
  };
}
