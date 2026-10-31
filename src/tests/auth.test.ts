import { describe, it, expect, beforeEach } from 'vitest';
import { useFinanceStore } from '../store/useFinanceStore';

// Ensure localStorage polyfill exists for Node test environment
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, String(val)),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    length: 0,
  } as any;
}

describe('FinTrack Authentication State Management', () => {
  beforeEach(() => {
    localStorage.clear();
    useFinanceStore.setState({
      isAuthenticated: true,
      settings: {
        currency: 'INR',
        theme: 'light',
        monthStartDay: 1,
        userName: 'Arjun Mehta',
        userEmail: 'arjun@fintrack.io',
      },
    });
  });

  it('authenticates user and updates user profile on login', async () => {
    const { login } = useFinanceStore.getState();

    const success = await login('arjun@fintrack.io', 'password123', 'Arjun Mehta');
    expect(success).toBe(true);

    const state = useFinanceStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.settings.userName).toBe('Arjun Mehta');
    expect(state.settings.userEmail).toBe('arjun@fintrack.io');
    expect(localStorage.getItem('fintrack_auth')).toBe('true');
  });

  it('correctly handles logout and updates auth status', async () => {
    const { logout } = useFinanceStore.getState();

    await logout();

    const state = useFinanceStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(localStorage.getItem('fintrack_auth')).toBe('false');
  });

  it('infers name from email when name is not provided', async () => {
    const { login } = useFinanceStore.getState();

    await login('arjun.finance@company.com', 'mypassword');

    const state = useFinanceStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.settings.userName).toBe('Arjun Mehta');
    expect(state.settings.userEmail).toBe('arjun.finance@company.com');
  });
});
