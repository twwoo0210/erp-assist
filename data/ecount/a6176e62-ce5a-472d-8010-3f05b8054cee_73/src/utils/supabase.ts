
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 싱글톤
export const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

// Edge Functions 호출 래퍼
export const invokeEdgeFunction = async <T = any>(
  functionName: string,
  body?: any,
  options?: {
    retries?: number;
    timeout?: number;
  }
): Promise<T> => {
  const { retries = 3, timeout = 30000 } = options || {};
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (error) {
        throw new Error(error.message || `Edge Function ${functionName} 호출 실패`);
      }
      
      return data;
    } catch (error: any) {
      console.error(`Edge Function ${functionName} 호출 실패 (시도 ${attempt}/${retries}):`, error);
      
      if (attempt === retries) {
        throw error;
      }
      
      // 백오프 전략: 2^attempt * 1000ms
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error(`Edge Function ${functionName} 호출 최대 재시도 횟수 초과`);
};

// 타입 안전한 Edge Functions 호출
export const edgeFunctions = {
  aiParseOrder: (inputText: string) => 
    invokeEdgeFunction<any>('ai-parse-order', { inputText }),
    
  ecountCreateOrder: (orderData: any) => 
    invokeEdgeFunction<any>('ecount-create-order', { orderData }),
    
  ecountSync: () => 
    invokeEdgeFunction<any>('ecount-sync')
};

// 에러 타입 정의
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

// 공통 에러 핸들러
export const handleSupabaseError = (error: any): never => {
  if (error.name === 'AbortError') {
    throw new SupabaseError('요청 시간이 초과되었습니다.', 'TIMEOUT');
  }
  
  if (error.message?.includes('fetch')) {
    throw new SupabaseError('네트워크 연결을 확인해주세요.', 'NETWORK_ERROR');
  }
  
  throw new SupabaseError(
    error.message || '알 수 없는 오류가 발생했습니다.',
    error.code,
    error
  );
};
