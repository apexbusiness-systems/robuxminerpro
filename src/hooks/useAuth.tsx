import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  username?: string;
  display_name?: string;
  avatar_url?: string;
  total_robux: number;
  mining_power: number;
  referral_code?: string;
  referred_by?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  // Enterprise fields (optional for backward compatibility)
  phone?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
  two_factor_enabled?: boolean;
  subscription_tier?: string;
  subscription_expires_at?: string;
  profile_completion_percentage?: number;
  last_activity?: string;
  timezone?: string;
  language?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    in_app: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
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
  app_metadata: {},
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
    return !import.meta.env.VITE_SUPABASE_URL?.includes('your-project-ref');
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
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          updateLastActivity(session.user.id);
          const profileData = await fetchProfile(session.user.id);
          setProfile(profileData);
        } else if (!isSupabaseValid()) {
          // Fallback for demo mode
          setUser(MOCK_USER);
          setProfile(MOCK_PROFILE);
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
      } else if (!isSupabaseValid()) {
        // Force mock state if Supabase isn't configured
        setUser(MOCK_USER);
        setProfile(MOCK_PROFILE);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

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
    setUser(MOCK_USER);
    setProfile(MOCK_PROFILE);
    setLoading(false);
    toast({
      title: "APEX Bypass Active",
      description: "Logged in as APEX Explorer (Mock Mode)",
    });
  }, [toast]);

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signOut,
    updateProfile,
    refreshProfile,
    bypassMockLogin,
  }), [user, session, profile, loading, signOut, updateProfile, refreshProfile, bypassMockLogin]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};