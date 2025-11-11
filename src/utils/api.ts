// API utility functions for Supabase Edge Functions

import { supabase } from './supabase'

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

async function fetchAPI<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  try {
    // Supabase Edge Functions 사용
    if (!supabase) {
      throw new APIError('Supabase가 초기화되지 않았습니다.', 500)
    }

    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: options?.body ? JSON.parse(options.body as string) : undefined,
      headers: options?.headers as Record<string, string> | undefined,
    })

    if (error) {
      throw new APIError(
        error.message || `API 요청 실패: ${error.status || 500}`,
        error.status || 500,
        error
      )
    }

    return data as T
  } catch (error: any) {
    if (error instanceof APIError) {
      throw error
    }

    // JSON 파싱 오류 처리
    if (error.message?.includes('JSON') || error.message?.includes('Unexpected token')) {
      throw new APIError('서버 응답을 처리할 수 없습니다. API 엔드포인트를 확인해주세요.', 502, error)
    }

    if (error.name === 'AbortError') {
      throw new APIError('요청 시간이 초과되었습니다.', 408)
    }

    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      throw new APIError('네트워크 연결을 확인해주세요.', 0)
    }

    throw new APIError(
      error.message || '예상치 못한 오류가 발생했습니다.',
      500,
      error
    )
  }
}

// API 함수들
export const api = {
  // Health check
  health: async () => {
    return fetchAPI('health')
  },

  // AI Parse Order - Supabase Edge Function 사용
  parseOrder: async (inputText: string) => {
    const result = await fetchAPI<{
      customer_name: string
      items: Array<{
        item_name: string
        qty: number
        matched_item?: {
          code: string
          name: string
          price: number
          unit?: string
        }
        confidence?: number
      }>
    }>('ai-parse-order', {
      method: 'POST',
      body: JSON.stringify({ inputText }),
    })

    // 프론트엔드 형식에 맞게 변환
    return {
      customer: result.customer_name,
      items: result.items.map(item => ({
        code: item.matched_item?.code || '',
        name: item.item_name,
        quantity: item.qty,
        price: item.matched_item?.price || 0,
        unit: item.matched_item?.unit || '개',
        note: item.confidence ? `매칭 신뢰도: ${(item.confidence * 100).toFixed(0)}%` : undefined,
      })),
    }
  },

  // Create Order
  createOrder: async (orderData: any) => {
    return fetchAPI('ecount-create-order', {
      method: 'POST',
      body: JSON.stringify({ orderData }),
    })
  },
}

// 에러 핸들러
export const handleAPIError = (error: any): never => {
  if (error instanceof APIError) {
    throw error
  }

  throw new APIError(
    error.message || '예상치 못한 오류가 발생했습니다.',
    error.status,
    error
  )
}
