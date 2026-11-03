// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
  subscribeToAuthSessionChanges,
} from '../../src/services/api';

describe('auth session helpers', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('stores the access token and notifies same-tab subscribers', () => {
    const onSessionChange = vi.fn();
    const unsubscribe = subscribeToAuthSessionChanges(onSessionChange);

    setAccessToken('access-token');

    expect(getAccessToken()).toBe('access-token');
    expect(localStorage.getItem('authSessionHint')).toBe('1');
    expect(onSessionChange).toHaveBeenCalledOnce();

    unsubscribe();
  });

  it('clears session tokens and emits a session change', () => {
    const onSessionChange = vi.fn();
    const unsubscribe = subscribeToAuthSessionChanges(onSessionChange);
    setAccessToken('access-token');
    onSessionChange.mockClear();
    localStorage.setItem('refreshToken', 'refresh-token');

    clearAuthSession();

    expect(getAccessToken()).toBe('');
    expect(localStorage.getItem('authSessionHint')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(onSessionChange).toHaveBeenCalledOnce();

    unsubscribe();
  });

  it('notifies session changes for token updates and clear-all storage events between tabs', () => {
    const onSessionChange = vi.fn();
    const onOtherStorageChange = vi.fn();
    const unsubscribe = subscribeToAuthSessionChanges(
      onSessionChange,
      onOtherStorageChange,
    );

    window.dispatchEvent(new StorageEvent('storage', { key: 'accessToken' }));
    window.dispatchEvent(new StorageEvent('storage', { key: null }));

    expect(onSessionChange).toHaveBeenCalledTimes(2);
    expect(onOtherStorageChange).not.toHaveBeenCalled();

    unsubscribe();
  });

  it('forwards unrelated storage events without synchronizing the session', () => {
    const onSessionChange = vi.fn();
    const onOtherStorageChange = vi.fn();
    const unsubscribe = subscribeToAuthSessionChanges(
      onSessionChange,
      onOtherStorageChange,
    );
    const event = new StorageEvent('storage', {
      key: 'userAvatar',
      newValue: 'avatar.jpg',
    });

    window.dispatchEvent(event);

    expect(onSessionChange).not.toHaveBeenCalled();
    expect(onOtherStorageChange).toHaveBeenCalledWith(event);

    unsubscribe();
  });

  it('does not notify after a subscriber unsubscribes', () => {
    const onSessionChange = vi.fn();
    const unsubscribe = subscribeToAuthSessionChanges(onSessionChange);
    unsubscribe();

    setAccessToken('access-token');

    expect(onSessionChange).not.toHaveBeenCalled();
  });
});
