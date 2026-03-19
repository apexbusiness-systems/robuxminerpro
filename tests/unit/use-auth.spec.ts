import { beforeEach, describe, expect, test } from 'vitest';
import { clearSupabaseAuthStorage } from '@/hooks/useAuth';

describe('useAuth storage cleanup', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  test('clearSupabaseAuthStorage removes Supabase auth keys from both browser storages', () => {
    window.localStorage.setItem('sb-project-auth-token', 'persisted-session');
    window.localStorage.setItem('supabase.auth.token', 'legacy-session');
    window.localStorage.setItem('app-theme', 'dark');

    window.sessionStorage.setItem('sb-project-auth-token-code-verifier', 'oauth-proof');
    window.sessionStorage.setItem('supabase.auth.refresh', 'legacy-refresh');
    window.sessionStorage.setItem('other-key', 'keep-me');

    clearSupabaseAuthStorage();

    expect(window.localStorage.getItem('sb-project-auth-token')).toBeNull();
    expect(window.localStorage.getItem('supabase.auth.token')).toBeNull();
    expect(window.sessionStorage.getItem('sb-project-auth-token-code-verifier')).toBeNull();
    expect(window.sessionStorage.getItem('supabase.auth.refresh')).toBeNull();

    expect(window.localStorage.getItem('app-theme')).toBe('dark');
    expect(window.sessionStorage.getItem('other-key')).toBe('keep-me');
  });
});
