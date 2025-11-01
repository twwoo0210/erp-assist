import { useState, useEffect, createContext, useContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  ensureSupabaseClient,
  missingSupabaseMessage,
} from '../utils/supabase';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  org_id?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

interface Organization {
  id: string;
  name: string;
  industry?: string;
  business_number?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  organization: Organization | null;
  loading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const throwSupabaseUnavailable = async () => {
  throw new Error(missingSupabaseMessage);
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  // 프로필 / 조직 정보 로드
  const loadUserData = async (userId: string) => {
    if (!supabase) {
      return;
    }

    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('프로필 로드 오류:', profileError);
        return;
      }

      setProfile(profileData);

      if (profileData?.org_id) {
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', profileData.org_id)
          .single();

        if (!orgError && orgData) {
          setOrganization(orgData);
        }
      }
    } catch (error) {
      console.error('사용자 데이터 로드 실패:', error);
    }
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          loadUserData(session.user.id);
        }
      })
      .catch((error) => {
        console.error('세션 정보를 불러오지 못했습니다:', error);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          await loadUserData(newSession.user.id);
        } else {
          setProfile(null);
          setOrganization(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, metadata?: any) => {
    const client = ensureSupabaseClient();
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  };

  const signIn = async (email: string, password: string) => {
    const client = ensureSupabaseClient();
    const { error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    const client = ensureSupabaseClient();

    try {
      await client.auth.signOut({ scope: 'local' });
    } catch (error: any) {
      console.error('Supabase signOut error:', error);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setOrganization(null);
    }
  };

  const resetPassword = async (email: string) => {
    const client = ensureSupabaseClient();
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  };

  const refreshProfile = async () => {
    if (user && supabase) {
      await loadUserData(user.id);
    }
  };

  if (!supabase) {
    return {
      user: null,
      session: null,
      profile: null,
      organization: null,
      loading,
      signUp: throwSupabaseUnavailable,
      signIn: throwSupabaseUnavailable,
      signOut: throwSupabaseUnavailable,
      resetPassword: throwSupabaseUnavailable,
      refreshProfile: async () => void 0,
    };
  }

  return {
    user,
    session,
    profile,
    organization,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    refreshProfile,
  };
};

export { AuthContext };
