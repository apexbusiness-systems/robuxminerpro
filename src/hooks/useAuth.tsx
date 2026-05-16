import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  streak_count?: number;
  created_at: string;
  updated_at: string;
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
const IS_DEV = import.meta.env.DEV;

const MOCK_USER: User = {
  id: 'apex-mock-user-id',
  email: 'apex@example.com',
  app_metadata: IS_DEV ? { role: 'admin' } : {},
  user_metadata: { display_name: 'APEX Explorer' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
} as User;

const MOCK_PROFILE: Profile = {
  id: 'mock-profile-id',
  user_id: 'apex-mock-user-id',
  display_name: 'APEX Explorer',
  total_robux: 15420,
  mining_power: 2.5,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const clearSupabaseAuthStorage = () => {
  const rawUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
  const projectRef = rawUrl.replace('https://', '').split('.')[0];
  const scopedPrefixes = projectRef ? [`sb-${projectRef}-auth-token`] : ['sb-invalid-auth-token'];

  (['localStorage', 'sessionStorage'] as const).forEach((storageType) => {
    try {
      const storage = window[storageType];
      Object.keys(storage).forEach((key) => {
        if (scopedPrefixes.some((prefix) => key.startsWith(prefix))) storage.removeItem(key);
      });
    } catch {
      // Non-browser environment — ignore silently
    }
  });
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const isSupabaseValid = useCallback(() => !import.meta.env.VITE_SUPABASE_URL?.includes('your-project-ref'), []);

  const fetchProfile = useCallback(async (userId: string) => {
    if (!isSupabaseValid()) return MOCK_PROFILE;
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      if (error) return null;
      return data as Profile;
    } catch {
      return null;
    }
  }, [isSupabaseValid]);

  const updateLastActivity = useCallback(async (userId: string) => {
    if (!isSupabaseValid()) return;
    try {
      await supabase.from('profiles').update({ last_login: new Date().toISOString() }).eq('user_id', userId);
    } catch {
      // Ignore update errors
    }
  }, [isSupabaseValid]);

  useEffect(() => {
    if (!isSupabaseValid()) {
      if (sessionStorage.getItem('rmp_signed_out') === '1') {
        setLoading(false);
        return;
      }
      setUser(MOCK_USER);
      setProfile(MOCK_PROFILE);
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        updateLastActivity(nextSession.user.id);
        const profileData = await fetchProfile(nextSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    const sessionTimeout = setTimeout(() => setLoading(false), 3000);
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      clearTimeout(sessionTimeout);
      if (existingSession?.user) {
        setSession(existingSession);
        setUser(existingSession.user);
        updateLastActivity(existingSession.user.id);
        fetchProfile(existingSession.user.id).then(setProfile);
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [fetchProfile, isSupabaseValid, updateLastActivity]);

  const signOut = useCallback(async () => {
    clearSupabaseAuthStorage();
    setSession(null);
    setUser(null);
    setProfile(null);
    supabase.auth.signOut({ scope: 'global' }).catch(() => {});
    toast({ title: 'Signed out', description: 'You have been successfully signed out.' });
    window.location.replace('/auth');
  }, [toast]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('user_id', user.id).select().single();
      if (error) throw error;
      setProfile(data as Profile);
      toast({ title: 'Profile updated', description: 'Your profile has been successfully updated.' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update profile. Please try again.', variant: 'destructive' });
    }
  }, [user, toast]);

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    setProfile(await fetchProfile(user.id));
  }, [fetchProfile, user]);

  const bypassMockLogin = useCallback(() => {
    if (!IS_DEV) return;
    sessionStorage.removeItem('rmp_signed_out');
    setUser(MOCK_USER);
    setProfile(MOCK_PROFILE);
    setLoading(false);
    toast({ title: 'APEX Bypass Active [DEV ONLY]', description: 'Logged in as APEX Explorer (Mock Mode)' });
  }, [toast]);

  const isAdmin = useMemo(() => {
    if (!IS_DEV && !isSupabaseValid()) return false;
    return user?.app_metadata?.role === 'admin';
  }, [user, isSupabaseValid]);

  const value = useMemo(() => ({ user, session, profile, loading, isAdmin, signOut, updateProfile, refreshProfile, bypassMockLogin }), [user, session, profile, loading, isAdmin, signOut, updateProfile, refreshProfile, bypassMockLogin]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
