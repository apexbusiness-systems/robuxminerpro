import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const MOCK_AUTH_STORAGE_KEY = 'apex_mock_auth_enabled';

const clearSupabaseAuthStorage = () => {
  if (typeof globalThis.window === 'undefined') return;

  const purgeStorage = (storage: Storage) => {
    const keysToRemove: string[] = [];

    for (let index = 0; index < storage.length; index += 1) {
      const storageKey = storage.key(index);
      if (!storageKey) continue;

      if (storageKey.startsWith('sb-') || storageKey.startsWith('supabase.auth.')) {
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

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          updateLastActivity(session.user.id);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Initial check
    const sessionTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(sessionTimeout);
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        updateLastActivity(session.user.id);
        fetchProfile(session.user.id).then(setProfile);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (subscription) subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    globalThis.window?.localStorage.removeItem(MOCK_AUTH_STORAGE_KEY);

    if (!isSupabaseValid()) {
      clearSupabaseAuthStorage();
      setSession(null);
      setUser(null);
      setProfile(null);
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Explicitly forcefully clear React state immediately
      clearSupabaseAuthStorage();
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
    } catch {
      // Hard fallback if network completely fails
      clearSupabaseAuthStorage();
      setSession(null);
      setUser(null);
      setProfile(null);
    }
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
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
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
      title: "APEX Bypass Active",
      description: "Logged in as APEX Explorer (Mock Mode)",
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
