import { createClient } from '@supabase/supabase-js';

export class SupabaseError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'SupabaseError';
  }
}

const SUPABASE_URL = import.meta.env.VITE_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
export const missingSupabaseMessage =
  'Supabase 환경 변수가 설정되지 않아 백엔드 기능을 사용할 수 없습니다. 관리자에게 문의해 주세요.';

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // storage: window.localStorage // default on web
      },
    })
  : null;

if (!isSupabaseConfigured && typeof console !== 'undefined') {
  console.warn(
    '[supabase] VITE_PUBLIC_SUPABASE_URL 또는 VITE_PUBLIC_SUPABASE_ANON_KEY가 없어 데모 모드로 실행됩니다'
  );
}

export const ensureSupabaseClient = () => {
  if (!supabase) {
    throw new SupabaseError(missingSupabaseMessage, 'CONFIG_MISSING');
  }
  return supabase;
};

// Edge Function 공통 호출 래퍼
export const invokeEdgeFunction = async <T = any>(
  functionName: string,
  body?: any,
  options?: {
    retries?: number;
    timeout?: number;
  }
): Promise<T> => {
  const client = ensureSupabaseClient();
  const { retries = 3, timeout = 30000 } = options || {};

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const { data, error } = await client.functions.invoke(functionName, {
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (error) {
        throw new Error(error.message || `Edge Function ${functionName} 호출 실패`);
      }

      return data as T;
    } catch (error: any) {
      console.error(`Edge Function ${functionName} 호출 실패 (시도 ${attempt}/${retries}):`, error);

      if (attempt === retries) {
        throw error;
      }

      // 백오프 전략: 2^attempt * 1000ms
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error(`Edge Function ${functionName} 호출 최종 재시도 초과`);
};

// 편의 래퍼 모음
export const edgeFunctions = {
  aiParseOrder: (inputText: string) => invokeEdgeFunction<any>('ai-parse-order', { inputText }),
  ecountCreateOrder: (orderData: any) => invokeEdgeFunction<any>('ecount-create-order', { orderData }),
  ecountSync: () => invokeEdgeFunction<any>('ecount-sync'),
};

// 공통 에러 핸들러
export const handleSupabaseError = (error: any): never => {
  if (error instanceof SupabaseError) {
    throw error;
  }

  if (error?.name === 'AbortError') {
    throw new SupabaseError('요청 시간이 초과되었습니다', 'TIMEOUT');
  }

  if (error?.message?.includes('fetch')) {
    throw new SupabaseError('네트워크 연결을 확인해 주세요', 'NETWORK_ERROR');
  }

  throw new SupabaseError(error?.message || '예상치 못한 오류가 발생했습니다.', error?.code, error);
};
