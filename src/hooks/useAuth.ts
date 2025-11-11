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

    let mounted = true;

    // 초기 세션 로드 및 주기적 갱신
    const loadSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (error) {
          console.error('세션 정보를 불러오지 못했습니다:', error);
          // 에러 발생 시 세션 초기화
          setSession(null);
          setUser(null);
          setProfile(null);
          setOrganization(null);
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserData(session.user.id);
        } else {
          setProfile(null);
          setOrganization(null);
        }
      } catch (error) {
        console.error('세션 로드 중 예외 발생:', error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
          setOrganization(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // 초기 세션 로드
    loadSession();

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, newSession?.user?.email);
        
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

    // 세션 갱신을 위한 주기적 체크 (5분마다)
    const refreshInterval = setInterval(async () => {
      if (!mounted || !supabase) return;
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setSession(session);
            setUser(session.user);
          } else {
            // 세션이 만료된 경우
            setSession(null);
            setUser(null);
            setProfile(null);
            setOrganization(null);
          }
        }
      } catch (error) {
        console.error('세션 갱신 중 오류:', error);
      }
    }, 5 * 60 * 1000); // 5분

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
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
    try {
      if (supabase) {
        try {
          // Prefer a full/global sign-out to avoid stale sessions across tabs
          await supabase.auth.signOut({ scope: 'global' as any });
        } catch (error: any) {
          console.error('Supabase signOut error:', error);
          // Fallback: try local scope
          try {
            await supabase.auth.signOut({ scope: 'local' as any });
          } catch (inner) {
            console.warn('Supabase local signOut fallback failed:', inner);
          }
        }
      }
    } catch (e) {
      console.warn('signOut encountered an error before clearing state:', e);
    } finally {
      // Hard clear any Supabase tokens from localStorage just in case
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const keysToRemove: string[] = [];
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i) ?? '';
            if (key.startsWith('sb-')) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((k) => window.localStorage.removeItem(k));
          // Optional remembered email is user convenience only
          window.localStorage.removeItem('rememberedEmail');
        }
      } catch (storageErr) {
        console.warn('LocalStorage cleanup on signOut failed:', storageErr);
      }

      setSession(null);
      setUser(null);
      setProfile(null);
      setOrganization(null);
    }
  };

  const resetPassword = async (email: string) => {
    const client = ensureSupabaseClient();
    // Ensure GitHub Pages subpath (/erp-assist) is respected on redirect
    const base = (typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '/');
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    const redirectTo = `${window.location.origin}${normalizedBase}auth/reset-password`;
    const { error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo,
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
