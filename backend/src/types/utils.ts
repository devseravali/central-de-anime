export type AsyncFn<T, A extends unknown[] = []> = (...args: A) => Promise<T>;

export type MaybeFactory<T, A extends unknown[] = []> =
  | Promise<T>
  | AsyncFn<T, A>
  | Promise<AsyncFn<T, A>>;
