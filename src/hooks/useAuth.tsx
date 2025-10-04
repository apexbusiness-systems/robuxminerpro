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

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  }, []);

  const updateLastActivity = useCallback(async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error updating last activity:', error);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth state changed:', event, session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Update last activity (fire and forget)
          updateLastActivity(session.user.id).catch(() => {});
          
          // Fetch profile asynchronously
          fetchProfile(session.user.id).then((profileData) => {
            if (mounted) setProfile(profileData);
          });
        } else {
          setProfile(null);
        }

        if (mounted) setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        updateLastActivity(session.user.id).catch(() => {});
        
        fetchProfile(session.user.id).then((profileData) => {
          if (mounted) {
            setProfile(profileData);
            setLoading(false);
          }
        });
      } else {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile, updateLastActivity]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
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
        .maybeSingle();

      if (error) throw error;

      setProfile(data);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
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

  const value = useMemo(() => ({
    user,
    session,
    profile,
    loading,
    signOut,
    updateProfile,
    refreshProfile,
  }), [user, session, profile, loading, signOut, updateProfile, refreshProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};