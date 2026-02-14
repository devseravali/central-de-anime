import type { AnimeInput } from '../types/anime';
import type { EstacaoInput } from '../types/estacao';
import type { ValidacaoPersonagem } from '../types/validacaoPersonagens';
import type { ValidacaoTemporada } from '../types/validacaoTemporadas';
import type { ValidacaoGenero } from '../types/validacaoGeneros';
import type { ValidacaoEstudio } from '../types/validacaoEstudios';
import type { ValidacaoTag } from '../types/validacaoTags';
import type { ValidacaoRelacao } from '../types/validacaoRelacoes';
import type { ValidacaoPlataforma } from '../types/validacaoPlataformas';

type ValidacaoStatus = {
  id?: number;
  nome: string;
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

function toRequiredString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function toOptionalTrimmedString(value: unknown): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return undefined;
  return value.trim();
}

export function validarAnimePayload(data: unknown):
  | (AnimeInput & {
      id?: number;
      anime_id?: number;
    })
  | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;

  const nome = toRequiredString(p.nome);
  if (!nome) return false;

  const estudio_id = toPositiveInt(p.estudio_id);
  if (estudio_id === null) return false;

  if (
    p.titulo_portugues !== undefined &&
    typeof p.titulo_portugues !== 'string'
  )
    return false;

  if (p.titulo_ingles !== undefined && typeof p.titulo_ingles !== 'string')
    return false;

  if (p.titulo_japones !== undefined && typeof p.titulo_japones !== 'string')
    return false;

  if (p.slug !== undefined && typeof p.slug !== 'string') return false;

  const id = p.id !== undefined ? toPositiveInt(p.id) : null;
  if (p.id !== undefined && id === null) return false;

  const anime_id = p.anime_id !== undefined ? toPositiveInt(p.anime_id) : null;
  if (p.anime_id !== undefined && anime_id === null) return false;

  const result: AnimeInput & { id?: number; anime_id?: number } = {
    nome,
    estudio_id,
  };

  if (id !== null) result.id = id;
  if (anime_id !== null) result.anime_id = anime_id;

  const titulo_portugues = toOptionalTrimmedString(p.titulo_portugues);
  if (titulo_portugues !== undefined)
    result.titulo_portugues = titulo_portugues;

  const titulo_ingles = toOptionalTrimmedString(p.titulo_ingles);
  if (titulo_ingles !== undefined) result.titulo_ingles = titulo_ingles;

  const titulo_japones = toOptionalTrimmedString(p.titulo_japones);
  if (titulo_japones !== undefined) result.titulo_japones = titulo_japones;

  const slug = toOptionalTrimmedString(p.slug);
  if (slug !== undefined) result.slug = slug;

  return result;
}

export function validarEstacaoPayload(data: unknown): EstacaoInput | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;

  if (p.slug !== undefined && typeof p.slug !== 'string') return false;
  const slug = toOptionalTrimmedString(p.slug);

  return {
    nome,
    slug,
  };
}

export function validarGeneroPayload(data: unknown): ValidacaoGenero | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;

  const id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;

  return {
    id: id ?? 0,
    nome,
  };
}

export function validarPlataformaPayload(
  data: unknown,
): ValidacaoPlataforma | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;

  const id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;

  const url =
    p.url === null
      ? null
      : p.url !== undefined
        ? toOptionalTrimmedString(p.url)
        : undefined;

  return {
    ...(id !== undefined ? { id } : {}),
    nome,
    ...(url !== undefined ? { url } : {}),
  };
}

export function validarStatusPayload(data: unknown): ValidacaoStatus | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;

  const id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;

  return {
    ...(id !== undefined ? { id } : {}),
    nome,
  };
}

export function validarTagPayload(data: unknown): ValidacaoTag | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;

  const id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;

  return {
    id: id ?? 0,
    nome,
  };
}

export function validarEstudioPayload(data: unknown): ValidacaoEstudio | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;
  const nome = toRequiredString(p.nome);
  if (!nome) return false;

  const id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;

  const principaisObras = toOptionalTrimmedString(
    p.principaisObras ?? p.principais_obras,
  );

  return {
    id: id ?? 0,
    nome,
    principaisObras: principaisObras ?? '',
  };
}

export function validarPersonagemPayload(
  data: unknown,
): ValidacaoPersonagem | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;

  const nome = toRequiredString(p.nome);
  const sexo = toRequiredString(p.sexo);
  const papel = toRequiredString(p.papel);
  const imagem = toRequiredString(p.imagem);
  const aniversario = toRequiredString(p.aniversario);
  const afiliacao = toRequiredString(p.afiliacao);
  const sobre = toRequiredString(p.sobre ?? p.Sobre);

  const idade_inicial = toPositiveInt(p.idade_inicial);
  const altura_inicial = toPositiveInt(p.altura_inicial);

  if (
    !nome ||
    !sexo ||
    !papel ||
    !imagem ||
    !aniversario ||
    !afiliacao ||
    !sobre ||
    idade_inicial === null ||
    altura_inicial === null
  ) {
    return false;
  }

  if (!['Masculino', 'Feminino', 'Outro'].includes(sexo)) return false;

  const id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;

  return {
    ...(id !== undefined ? { id } : {}),
    nome,
    idade_inicial,
    sexo: sexo as ValidacaoPersonagem['sexo'],
    papel,
    imagem,
    aniversario,
    altura_inicial,
    afiliacao,
    sobre,
  };
}

export function validarTemporadaPayload(
  data: unknown,
): ValidacaoTemporada | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;

  const slug = toRequiredString(p.slug);
  const nome = toRequiredString(p.nome);
  const tipo = toRequiredString(p.tipo);
  const sinopse = toOptionalTrimmedString(p.sinopse) ?? '';

  const anime_id = toPositiveInt(p.anime_id);
  const temporada = toPositiveInt(p.temporada);
  const status_id = toPositiveInt(p.status_id);
  const ano = toPositiveInt(p.ano);
  const estacao_id = toPositiveInt(p.estacao_id);
  const episodios = toPositiveInt(p.episodios) ?? 0;

  if (
    !slug ||
    !nome ||
    !tipo ||
    anime_id === null ||
    temporada === null ||
    status_id === null ||
    ano === null ||
    estacao_id === null ||
    episodios === null
  ) {
    return false;
  }

  const id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;

  return {
    id: id ?? 0,
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

export function validarRelacaoPayload(data: unknown): ValidacaoRelacao | false {
  if (typeof data !== 'object' || data === null) return false;

  const p = data as Record<string, unknown>;
  const tipo = toRequiredString(p.tipo);
  const anime_id = toPositiveInt(p.anime_id);
  const relacionado_id = toPositiveInt(p.relacionado_id);

  if (!tipo || anime_id === null || relacionado_id === null) return false;

  const id = p.id !== undefined ? toPositiveInt(p.id) : undefined;
  if (p.id !== undefined && id === null) return false;

  return {
    id: id ?? 0,
    anime_id,
    relacionado_id,
    tipo,
  };
}
