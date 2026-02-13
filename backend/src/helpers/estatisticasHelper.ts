import type { MaybeFactory } from '../types/utils';
import { executar } from '../types/asyncExecutor';

export type Resumo<TPopulares> = {
  total: number;
  populares: TPopulares;
};

export async function obterResumo<TPopulares, A extends unknown[] = []>(
  totalFn: () => Promise<number>,
  popularesFn: MaybeFactory<TPopulares, A>,
  popularesArgs: A = [] as unknown as A,
): Promise<Resumo<TPopulares>> {
  const [total, populares] = await Promise.all([
    totalFn(),
    executar(popularesFn, ...popularesArgs),
  ]);

  return { total, populares };
}
