import { ErroApi } from '../errors/ErroApi';
import { validarAnimePayload } from './validacao';
import type { AnimeInput } from '../types/anime';

export function validarAnimeOuFalhar(body: unknown): AnimeInput {
  const data = validarAnimePayload(body);
  if (!data) {
    throw ErroApi.badRequest(
      'Dados inválidos para anime',
      'INVALID_ANIME_DATA',
    );
  }
  return data;
}
