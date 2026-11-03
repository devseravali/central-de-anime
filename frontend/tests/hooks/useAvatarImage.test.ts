// @vitest-environment jsdom

import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { useAvatarImage } from '../../src/hooks/UseAvatarImage/useAvatarImage';
import placeholder from '../../src/assets/placeholder.jpg';

afterEach(cleanup);

describe('useAvatarImage', () => {
  it('usa placeholder quando não existe avatar e não repete o tratamento de erro', () => {
    const { result } = renderHook(() => useAvatarImage());
    expect(result.current.src).toBe(placeholder);
    expect(result.current.onError).toBeUndefined();
  });

  it('aplica fallback apenas para a URL que falhou e aceita nova URL', () => {
    const { result, rerender } = renderHook(({ src }) => useAvatarImage(src), {
      initialProps: { src: '/avatars/a.jpg' },
    });
    expect(result.current.src).toBe('/avatars/a.jpg');
    act(() => result.current.onError?.());
    expect(result.current.src).toBe(placeholder);
    expect(result.current.onError).toBeUndefined();
    rerender({ src: '/avatars/b.jpg' });
    expect(result.current.src).toBe('/avatars/b.jpg');
    expect(result.current.onError).toBeTypeOf('function');
  });
});
