// Faz o parse de JSON e retorna null se inválido
export function parseJson(json: string): any {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}
import { ErroApi } from '../errors/ErroApi';

type ReqComId = {
  params: {
    id?: string;
  };
};

export function parseIdParam(
  req: ReqComId,
  entidade = 'recurso',
  codigo = 'INVALID_ID',
): string {
  const id = req.params.id;
  const n = Number(id);

  if (!id || !Number.isInteger(n) || n <= 0) {
    throw ErroApi.badRequest(`ID do ${entidade} inválido`, codigo);
  }

  return id;
}

export function parseStringParam(
  value: string | string[] | undefined,
  campo: string,
): string {
  const str = Array.isArray(value) ? value[0] : value;

  if (!str || typeof str !== 'string' || str.trim().length === 0) {
    throw ErroApi.badRequest(`${campo} inválido`, 'INVALID_PARAM');
  }

  return str.trim();
}
