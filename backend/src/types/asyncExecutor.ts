import type { MaybeFactory } from '../types/utils';

export async function executar<T, A extends unknown[] = []>(
  fn: MaybeFactory<T, A>,
  ...args: A
): Promise<T> {
  const resolved = await fn;

  if (typeof resolved === 'function') {
    return (resolved as (...args: A) => T)(...args);
  }

  return resolved;
}