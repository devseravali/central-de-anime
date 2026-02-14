import { z } from 'zod';

export const FiltrosSchema = z.object({
  busca: z.string().optional(),
  status: z.string().optional(),
  dataInicio: z.string().datetime().optional(),
  dataFim: z.string().datetime().optional(),
});

export type Filtros = z.infer<typeof FiltrosSchema>;

export interface ConstrutorFiltros {
  campo: string;
  valor: unknown;
  operador?: 'igual' | 'contem' | 'maior' | 'menor' | 'entre';
}

export const construirFiltros = (
  params: Record<string, unknown>,
): Record<string, unknown> => {
  const filtros: Record<string, unknown> = {};

  Object.entries(params).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null && valor !== '') {
      filtros[chave] = valor;
    }
  });

  return filtros;
};

export const validarFiltros = (
  queryParams: Record<string, unknown>,
): Filtros => {
  const resultado = FiltrosSchema.safeParse({
    busca: queryParams.busca,
    status: queryParams.status,
    dataInicio: queryParams.dataInicio,
    dataFim: queryParams.dataFim,
  });

  if (!resultado.success) {
    throw new Error('Parâmetros de filtro inválidos');
  }

  return resultado.data;
};


export const normalizarBusca = (termo: string): string => {
  return termo
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, ''); 
};

export const construirQueryString = (
  paginacao: { pagina: number; limite: number },
  filtros: Record<string, unknown>,
): string => {
  const params = new URLSearchParams();

  params.append('pagina', String(paginacao.pagina));
  params.append('limite', String(paginacao.limite));

  Object.entries(filtros).forEach(([chave, valor]) => {
    if (valor !== undefined && valor !== null) {
      params.append(chave, String(valor));
    }
  });

  return params.toString();
};
