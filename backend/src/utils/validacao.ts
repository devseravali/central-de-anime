export function validarEstacaoPayload(data: unknown): { id?: number; nome: string; slug: string } | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  const slug = toRequiredString(p.slug);
  let id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;
  if (!nome || !slug) return false;
  return buildObject({ id: id === null ? undefined : id, nome, slug });
}
import type { ValidacaoPersonagem } from '../types/validacaoPersonagens';
import type { AnimeInput } from '../types/anime';


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

export function validarPersonagemPayload(
  data: unknown,
): ValidacaoPersonagem | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  const id =
    p.id !== undefined ? (toPositiveInt(p.id) ?? undefined) : undefined;
  const nome = toRequiredString(p.nome);
  const idade_inicial = toPositiveInt(p.idade_inicial);
  const sexo =
    typeof p.sexo === 'string' &&
    ['Masculino', 'Feminino', 'Outro'].includes(p.sexo)
      ? p.sexo
      : null;
  const papel = toRequiredString(p.papel);
  const imagem = toRequiredString(p.imagem);
  const aniversario = toRequiredString(p.aniversario);
  const altura_inicial = toPositiveInt(p.altura_inicial);
  const afiliacao = toRequiredString(p.afiliacao);
  const sobre = toRequiredString(p.sobre);
  if (
    nome &&
    idade_inicial &&
    sexo &&
    papel &&
    imagem &&
    aniversario &&
    altura_inicial &&
    afiliacao &&
    sobre
  ) {
    return {
      ...(id ? { id } : {}),
      nome,
      idade_inicial,
      sexo: sexo as 'Masculino' | 'Feminino' | 'Outro',
      papel,
      imagem,
      aniversario,
      altura_inicial,
      afiliacao,
      sobre,
    };
  }
  return false;
}

export function validarTemporadaPayload(data: unknown): any | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  const id =
    p.id !== undefined ? (toPositiveInt(p.id) ?? undefined) : undefined;
  const anime_id = toPositiveInt(p.anime_id);
  const slug = toRequiredString(p.slug);
  const tipo = toOptionalTrimmedString(p.tipo);
  const temporada = toPositiveInt(p.temporada);
  const status_id =
    p.status_id !== undefined
      ? (toPositiveInt(p.status_id) ?? undefined)
      : undefined;
  const ano =
    p.ano !== undefined ? (toPositiveInt(p.ano) ?? undefined) : undefined;
  const estacao_id =
    p.estacao_id !== undefined
      ? (toPositiveInt(p.estacao_id) ?? undefined)
      : undefined;
  const episodios =
    p.episodios !== undefined
      ? (toPositiveInt(p.episodios) ?? undefined)
      : undefined;
  const sinopse = toOptionalTrimmedString(p.sinopse);

  const nome = toOptionalTrimmedString(p.nome) ?? slug ?? tipo;
  if (
    anime_id &&
    slug &&
    nome &&
    tipo &&
    temporada &&
    status_id &&
    ano &&
    estacao_id &&
    episodios &&
    sinopse
  ) {
    return {
      ...(id ? { id } : {}),
      anime_id,
      slug,
      nome,
      tipo,
      temporada,
      status_id,
      ano,
      estacao_id,
      episodios,
      sinopse,
    };
  }
  return false;
}

function toRequiredString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toOptionalTrimmedString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function buildObject<T extends object>(obj: T): T {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) (acc as any)[key] = value;
    return acc;
  }, {} as T);
}

export function validarAnimePayload(data: unknown): AnimeInput | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;

  const anime_id = toPositiveInt(p.anime_id);
  if (anime_id === null) return false;
  const estudio_id = toPositiveInt(p.estudio_id);
  if (estudio_id === null) return false;
  const slug = toRequiredString(p.slug);
  if (!slug) return false;
  const titulo = toRequiredString(p.titulo);
  if (!titulo) return false;
  const tipo = toOptionalTrimmedString(p.tipo);
  const temporada =
    p.temporada !== undefined
      ? (toPositiveInt(p.temporada) ?? undefined)
      : undefined;
  const status_id =
    p.status_id !== undefined
      ? (toPositiveInt(p.status_id) ?? undefined)
      : undefined;
  const ano =
    p.ano !== undefined ? (toPositiveInt(p.ano) ?? undefined) : undefined;
  const estacao_id =
    p.estacao_id !== undefined
      ? (toPositiveInt(p.estacao_id) ?? undefined)
      : undefined;
  const episodios =
    p.episodios !== undefined
      ? (toPositiveInt(p.episodios) ?? undefined)
      : undefined;
  const sinopse = toOptionalTrimmedString(p.sinopse);
  const capaUrl = toOptionalTrimmedString(p.capaUrl);
  const result: AnimeInput = {
    anime_id,
    estudio_id,
    slug,
    titulo,
    ...(tipo ? { tipo } : {}),
    ...(temporada !== undefined ? { temporada } : {}),
    ...(status_id !== undefined ? { status_id } : {}),
    ...(ano !== undefined ? { ano } : {}),
    ...(estacao_id !== undefined ? { estacao_id } : {}),
    ...(episodios !== undefined ? { episodios } : {}),
    ...(sinopse ? { sinopse } : {}),
    ...(capaUrl ? { capaUrl } : {}),
  };
  return result;
}

export type ValidacaoStatus = { id?: number; nome: string };
export type ValidacaoGenero = { id?: number; nome: string };
export type ValidacaoEstudio = {
  id?: number;
  nome: string;
  principaisObras?: string;
};
export type ValidacaoPlataforma = { id?: number; nome: string; url?: string };
export type ValidacaoTag = { id?: number; nome: string };
export type ValidacaoRelacao = {
  id?: number;
  anime_id: number;
  relacionado_id: number;
  tipo: string;
};

export function validarStatusPayload(data: unknown): ValidacaoStatus | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;
  let id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;
  return buildObject({ id: id === null ? undefined : id, nome });
}

export function validarGeneroPayload(data: unknown): ValidacaoGenero | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;
  let id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;
  return buildObject({ id: id === null ? undefined : id, nome });
}

export function validarEstudioPayload(data: unknown): ValidacaoEstudio | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;
  let id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;
  id = id === null ? undefined : id;
  const principaisObras = toOptionalTrimmedString(
    p.principaisObras ?? p.principais_obras,
  );
  return buildObject({ id, nome, principaisObras });
}

export function validarPlataformaPayload(
  data: unknown,
): ValidacaoPlataforma | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;
  let id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;
  id = id === null ? undefined : id;
  const url = toOptionalTrimmedString(p.url);
  return buildObject({ id, nome, url });
}

export function validarTagPayload(data: unknown): ValidacaoTag | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;
  let id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;
  id = id === null ? undefined : id;
  return buildObject({ id, nome });
}

export function validarRelacaoPayload(data: unknown): ValidacaoRelacao | false {
  if (typeof data !== 'object' || data === null) return false;
  const p = data as Record<string, unknown>;
  const tipo = toRequiredString(p.tipo);
  const anime_id = toPositiveInt(p.anime_id);
  const relacionado_id = toPositiveInt(p.relacionado_id);
  if (!tipo || anime_id === null || relacionado_id === null) return false;
  let id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;
  id = id === null ? undefined : id;
  return buildObject({ id, anime_id, relacionado_id, tipo });
}