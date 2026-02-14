import { z } from 'zod';

export const PaginacaoSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  ordenacao: z.string().optional(),
  direcao: z.enum(['ASC', 'DESC']).default('DESC').optional(),
});

export type Paginacao = z.infer<typeof PaginacaoSchema>;

export interface RespostaPaginada<T> {
  dados: T[];
  paginacao: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
    temProxima: boolean;
    temAnterior: boolean;
  };
}

export const calcularPaginacao = (
  pagina: number,
  limite: number,
  total: number,
): RespostaPaginada<unknown>['paginacao'] => {
  const totalPaginas = Math.ceil(total / limite);
  const offset = (pagina - 1) * limite;

  return {
    pagina,
    limite,
    total,
    totalPaginas,
    temProxima: pagina < totalPaginas,
    temAnterior: pagina > 1,
  };
};

export const obterOffset = (pagina: number, limite: number): number => {
  return (pagina - 1) * limite;
};

export const validarPaginacao = (
  queryParams: Record<string, unknown>,
): Paginacao => {
  const resultado = PaginacaoSchema.safeParse({
    pagina: queryParams.pagina,
    limite: queryParams.limite,
    ordenacao: queryParams.ordenacao,
    direcao: queryParams.direcao,
  });

  if (!resultado.success) {
    throw new Error('Parâmetros de paginação inválidos');
  }

  return resultado.data;
};
