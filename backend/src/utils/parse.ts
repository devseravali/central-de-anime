import { ErroApi } from '../errors/ErroApi';

export function parseId(param: unknown, nomeCampo = 'id'): number {
  const n = Number(param);
  if (!Number.isInteger(n) || n <= 0) {
    throw ErroApi.badRequest(`${nomeCampo} inválido.`);
  }
  return n;
}
