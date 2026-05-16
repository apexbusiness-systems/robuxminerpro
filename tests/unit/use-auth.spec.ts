import { beforeEach, describe, expect, test } from 'vitest';
import { clearSupabaseAuthStorage } from '@/hooks/useAuth';

describe('useAuth storage cleanup', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  test('clearSupabaseAuthStorage preserves unrelated keys when project ref is unavailable', () => {
    window.localStorage.setItem('sb-project-auth-token', 'persisted-session');
    window.localStorage.setItem('supabase.auth.token', 'legacy-session');
    window.localStorage.setItem('app-theme', 'dark');

    window.sessionStorage.setItem('sb-project-auth-token-code-verifier', 'oauth-proof');
    window.sessionStorage.setItem('supabase.auth.refresh', 'legacy-refresh');
    window.sessionStorage.setItem('other-key', 'keep-me');

    clearSupabaseAuthStorage();

    // In test env VITE_SUPABASE_URL is absent, so fallback prefix should match nothing.
    expect(window.localStorage.getItem('sb-project-auth-token')).toBe('persisted-session');
    expect(window.localStorage.getItem('supabase.auth.token')).toBe('legacy-session');
    expect(window.sessionStorage.getItem('sb-project-auth-token-code-verifier')).toBe('oauth-proof');
    expect(window.sessionStorage.getItem('supabase.auth.refresh')).toBe('legacy-refresh');

    expect(window.localStorage.getItem('app-theme')).toBe('dark');
    expect(window.sessionStorage.getItem('other-key')).toBe('keep-me');
  });
});
