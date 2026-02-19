// Função utilitária para resposta de erro (usada em testes)
export function respostaErro(mensagem: string, codigo = 400) {
  return {
    sucesso: false,
    dados: null,
    erro: {
      mensagem,
      codigo,
      timestamp: Date.now(),
    },
  };
}
import { Response } from 'express';
import type { ApiSucesso, SucessoOptions } from '../types/http';

export function respostaSucesso<T>(
  res: Response,
  dados: T,
  options: SucessoOptions = {},
) {
  const status = options.status ?? 200;

  const payload: ApiSucesso<T> = {
    sucesso: true,
    dados,
    ...(options.mensagem && { mensagem: options.mensagem }),
    ...(options.metadados && { metadados: options.metadados }),
  };

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
  mensagem = 'Recurso deletado com sucesso',
) {
  return respostaSucesso<null>(res, null, {
    mensagem,
  });
}
