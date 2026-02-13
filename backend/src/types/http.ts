import { Response } from 'express';

export interface SucessoOptions {
  status?: number;
  mensagem?: string;
  metadados?: Record<string, unknown>;
}

export interface ApiSucesso<T> {
  sucesso: boolean;
  dados: T;
  mensagem?: string;
  metadados?: Record<string, unknown>;
}

export function respostaSucesso<T>(
  res: Response,
  dados: T,
  options: SucessoOptions = {},
) {
  const status = options.status ?? 200;

  const payload: ApiSucesso<T> = {
    sucesso: true,
    dados,
  };

  if (options.mensagem) {
    payload.mensagem = options.mensagem;
  }

  if (options.metadados) {
    payload.metadados = options.metadados;
  }

  return res.status(status).json(payload);
}

export function respostaLista<T>(
  res: Response,
  dados: T[],
  options: Omit<SucessoOptions, 'status'> = {},
) {
  return respostaSucesso(res, dados, {
    ...options,
    metadados: {
      total: dados.length,
      ...options.metadados,
    },
  });
}

export function respostaCriado<T>(
  res: Response,
  dados: T,
  mensagem = 'Recurso criado com sucesso',
) {
  return respostaSucesso(res, dados, {
    status: 201,
    mensagem,
  });
}

export function respostaAtualizado<T>(
  res: Response,
  dados: T,
  mensagem = 'Recurso atualizado com sucesso',
) {
  return respostaSucesso(res, dados, {
    mensagem,
  });
}

export function respostaDeletado(
  res: Response,
  mensagem = 'Recurso removido com sucesso',
) {
  return respostaSucesso(res, null, {
    mensagem,
  });
}
