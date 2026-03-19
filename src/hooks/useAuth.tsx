import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MOCK_AUTH_STORAGE_KEY = 'apex_mock_auth_enabled';
// FIX: Sentinel flag written to sessionStorage before the logout-triggered page reload.
// On remount, AuthProvider reads this flag and skips getSession() re-hydration,
// preventing the Supabase GoTrue singleton from restoring the just-signed-out session.
const LOGOUT_IN_PROGRESS_KEY = 'apex_logout_in_progress';

const clearSupabaseAuthStorage = () => {
  if (typeof globalThis.window === 'undefined') return;

  const purgeStorage = (storage: Storage) => {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const storageKey = storage.key(index);
      if (!storageKey) continue;

      // FIX: Also purge MOCK_AUTH_STORAGE_KEY — previously missed by the sb- prefix filter,
      // which caused the mock user to persist forever even after signOut().
      if (
        storageKey.startsWith('sb-') ||
        storageKey.startsWith('supabase.auth.') ||
        storageKey === MOCK_AUTH_STORAGE_KEY
      ) {
        keysToRemove.push(storageKey);
      }
    }

    keysToRemove.forEach((storageKey) => {
      storage.removeItem(storageKey);
    });
  };

  purgeStorage(globalThis.window.localStorage);
  purgeStorage(globalThis.window.sessionStorage);
};

interface Profile {
  id: string;
  user_id: string;
  username?: string | null;
  display_name?: string | null;
  avatar_url?: string | null;
  total_robux: number;
  mining_power: number;
  referral_code?: string | null;
  referred_by?: string | null;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
  // Enterprise fields (optional for backward compatibility)
  phone?: string | null;
  email_verified?: boolean;
  phone_verified?: boolean;
  two_factor_enabled?: boolean;
  subscription_tier?: string | null;
  subscription_expires_at?: string | null;
  profile_completion_percentage?: number;
  last_activity?: string | null;
  timezone?: string | null;
  language?: string | null;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    in_app: boolean;
  } | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  bypassMockLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Mock data for development/demo mode
const MOCK_USER: User = {
  id: 'apex-mock-user-id',
  email: 'apex@example.com',
  app_metadata: { role: 'admin' },
  user_metadata: { display_name: 'APEX Explorer' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
};

const MOCK_PROFILE: Profile = {
  id: 'mock-profile-id',
  user_id: 'apex-mock-user-id',
  display_name: 'APEX Explorer',
  total_robux: 15420,
  mining_power: 2.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isSupabaseValid = useCallback(() => {
    return isSupabaseConfigured;
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseValid()) return MOCK_PROFILE;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (error) {
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }, [isSupabaseValid]);

  const updateLastActivity = useCallback(async (userId: string) => {
    if (!isSupabaseValid()) return;
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', userId);
    } catch {
      // Ignore update errors
    }
  }, [isSupabaseValid]);

  useEffect(() => {
    // FIX: Check for logout sentinel FIRST before doing anything with sessions.
    // signOut() sets this in sessionStorage before triggering window.location.href.
    // On the subsequent page reload, this block runs before getSession() can
    // re-hydrate the Supabase GoTrue singleton's in-memory session, ensuring
    // the user stays logged out after a hard navigation.
    const logoutInProgress = globalThis.window?.sessionStorage.getItem(LOGOUT_IN_PROGRESS_KEY);
    if (logoutInProgress === 'true') {
      globalThis.window?.sessionStorage.removeItem(LOGOUT_IN_PROGRESS_KEY);
      clearSupabaseAuthStorage();
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      return; // Do NOT proceed to getSession() or subscribe — session is intentionally dead.
    }

    if (!isSupabaseValid()) {
      const isMockSessionActive = globalThis.window?.localStorage.getItem(MOCK_AUTH_STORAGE_KEY) === 'true';
      if (isMockSessionActive) {
        setUser(MOCK_USER);
        setSession(null);
        setProfile(MOCK_PROFILE);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      setLoading(false);
      return;
    }

    // FIX: Call getSession() FIRST and set up onAuthStateChange INSIDE the callback.
    // This matches Supabase's recommended initialization pattern and eliminates the
    // race condition where onAuthStateChange fires SIGNED_OUT but the subsequent
    // getSession() promise resolution overwrites cleared state with a stale session.
    let subscription: ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription'] | null = null;

    const sessionTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      clearTimeout(sessionTimeout);

      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        updateLastActivity(initialSession.user.id);
        fetchProfile(initialSession.user.id).then(setProfile);
      } else {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      setLoading(false);

      // FIX: Subscribe AFTER initial session is known — avoids double-set race.
      const { data } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === 'SIGNED_OUT') {
          // Explicit SIGNED_OUT event — clear everything immediately, no async.
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          updateLastActivity(newSession.user.id);
          const profileData = await fetchProfile(newSession.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        setLoading(false);
      });
      subscription = data.subscription;
    });

    return () => {
      clearTimeout(sessionTimeout);
      if (subscription) subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    // FIX: Write the logout sentinel to sessionStorage BEFORE anything else.
    // sessionStorage persists across JS execution within the tab but is cleared
    // when the tab/browser closes — it is the correct scope for a "this reload
    // is a logout reload" flag. This is read by the useEffect above on remount
    // to block getSession() from re-hydrating the Supabase singleton's session.
    globalThis.window?.sessionStorage.setItem(LOGOUT_IN_PROGRESS_KEY, 'true');

    // Remove mock auth key explicitly (not caught by the sb- prefix filter)
    globalThis.window?.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);

    if (!isSupabaseValid()) {
      clearSupabaseAuthStorage();
      setSession(null);
      setUser(null);
      setProfile(null);
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
      // FIX: Hard navigation destroys the entire React tree + Supabase singleton in-memory state.
      // window.location.href is used (not assign) to ensure a full browser navigation
      // that cannot be intercepted by service workers or React Router.
      globalThis.window.location.href = '/auth';
      return;
    }

    try {
      // Tell Supabase server to invalidate the refresh token server-side.
      // This fires the SIGNED_OUT event to onAuthStateChange.
      await supabase.auth.signOut();
    } catch {
      // Intentionally continue — we force-clear client state regardless of
      // server response. Network failure must not leave the user stuck logged in.
    }

    // Purge all Supabase + mock storage keys AFTER signOut() has fired.
    clearSupabaseAuthStorage();

    toast({
      title: 'Signed out',
      description: 'You have been successfully signed out.',
    });

    // FIX: Hard navigation — destroys the Supabase GoTrue singleton entirely.
    // This is the only reliable way to guarantee zero in-memory session residue
    // in a SPA where the SDK holds session state outside React.
    globalThis.window.location.href = '/auth';
  }, [isSupabaseValid, toast]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      setProfile(data);

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const profileData = await fetchProfile(user.id);
    setProfile(profileData);
  }, [user, fetchProfile]);

  const bypassMockLogin = useCallback(() => {
    globalThis.window?.localStorage.setItem(MOCK_AUTH_STORAGE_KEY, 'true');
    setUser(MOCK_USER);
    setSession(null);
    setProfile(MOCK_PROFILE);
    setLoading(false);
    toast({
      title: 'APEX Bypass Active',
      description: 'Logged in as APEX Explorer (Mock Mode)',
    });
  }, [toast]);

  const isAdmin = useMemo(() => {
    return user?.app_metadata?.role === 'admin';
  }, [user]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    isAdmin,
    signOut,
    updateProfile,
    refreshProfile,
    bypassMockLogin,
  }), [user, session, profile, loading, isAdmin, signOut, updateProfile, refreshProfile, bypassMockLogin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
