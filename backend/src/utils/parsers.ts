import { Request } from 'express';

export function parseIdParam(req: Request): number | null {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return null;
  }
  return Number(id);
}

export function parseNomeParam(req: Request): string | null {
  const { nome } = req.params;
  if (!nome || typeof nome !== 'string' || nome.trim() === '') {
    return null;
  }
  return nome.trim();
}

export function readPersonagemBody(body: unknown) {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Body inválido');
  }
  const b = body as Record<string, unknown>;
  const personagem: Record<string, string | number> = {};
  if (typeof b.nome === 'string') personagem.nome = b.nome;
  if (typeof b.idade === 'number') personagem.idade_inicial = b.idade;
  if (typeof b.idade_inicial === 'number')
    personagem.idade_inicial = b.idade_inicial;
  if (typeof b.sexo === 'string') personagem.sexo = b.sexo;
  if (typeof b.papel === 'string') personagem.papel = b.papel;
  if (typeof b.imagem === 'string') personagem.imagem = b.imagem;
  if (typeof b.aniversario === 'string') personagem.aniversario = b.aniversario;
  if (
    typeof b.altura_inicial === 'string' ||
    typeof b.altura_inicial === 'number'
  )
    personagem.altura_inicial = b.altura_inicial;
  if (
    typeof b.alturaInicial === 'string' ||
    typeof b.alturaInicial === 'number'
  )
    personagem.altura_inicial = b.alturaInicial;
  if (typeof b.afiliacao === 'string') personagem.afiliacao = b.afiliacao;
  if (typeof b.sobre === 'string') personagem.sobre = b.sobre;
  if (typeof b.Sobre === 'string') personagem.sobre = b.Sobre;
  return personagem;
}

export function readPlataformaBody(body: unknown) {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Body inválido');
  }
  const b = body as Record<string, unknown>;
  const plataforma: Record<string, string> = {};
  if (typeof b.nome === 'string') plataforma.nome = b.nome;
  return plataforma;
}

export function readStatusBody(body: unknown) {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Body inválido');
  }
  const b = body as Record<string, unknown>;
  const status: Record<string, string> = {};
  if (typeof b.nome === 'string') status.nome = b.nome;
  return status;
}

export function readTagBody(body: unknown) {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Body inválido');
  }
  const b = body as Record<string, unknown>;
  const tag: Record<string, string> = {};
  if (typeof b.nome === 'string') tag.nome = b.nome;
  return tag;
}

export function readTemporadaBody(body: unknown) {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Body inválido');
  }
  const b = body as Record<string, unknown>;
  const temporada: Record<string, string | number> = {};

  // Aceita tanto camelCase quanto snake_case
  if (typeof b.anime_id === 'number') temporada.anime_id = b.anime_id;
  if (typeof b.animeId === 'number') temporada.anime_id = b.animeId;

  if (typeof b.slug === 'string') temporada.slug = b.slug;
  if (typeof b.nome === 'string') temporada.nome = b.nome;
  if (typeof b.tipo === 'string') temporada.tipo = b.tipo;
  if (typeof b.temporada === 'number') temporada.temporada = b.temporada;

  if (typeof b.status_id === 'number') temporada.status_id = b.status_id;
  if (typeof b.statusId === 'number') temporada.status_id = b.statusId;

  if (typeof b.ano === 'number') temporada.ano = b.ano;
  if (typeof b.ano === 'string') temporada.ano = b.ano;

  if (typeof b.estacao_id === 'number') temporada.estacao_id = b.estacao_id;
  if (typeof b.estacaoId === 'number') temporada.estacao_id = b.estacaoId;

  if (typeof b.episodios === 'number') temporada.episodios = b.episodios;
  if (typeof b.sinopse === 'string') temporada.sinopse = b.sinopse;

  return temporada;
}

export function readGeneroBody(body: unknown) {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Body inválido');
  }
  const b = body as Record<string, unknown>;
  const genero: Record<string, string> = {};
  if (typeof b.nome === 'string') genero.nome = b.nome;
  return genero;
}

export function readEstudioBody(body: unknown) {
  if (typeof body !== 'object' || body === null) {
    throw new Error('Body inválido');
  }
  const b = body as Record<string, unknown>;
  const estudio: Record<string, string> = {};
  if (typeof b.nome === 'string') estudio.nome = b.nome;
  const principaisObras = b.principaisObras ?? b.principais_obras;
  if (typeof principaisObras === 'string')
    estudio.principaisObras = principaisObras;
  return estudio;
}
