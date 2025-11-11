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

    console.log(`[API] Calling Edge Function: ${endpoint}`, options?.body ? JSON.parse(options.body as string) : {})

    const { data, error } = await supabase.functions.invoke(endpoint, {
      body: options?.body ? JSON.parse(options.body as string) : undefined,
      headers: options?.headers as Record<string, string> | undefined,
    })

    console.log(`[API] Edge Function response:`, { endpoint, data, error })

    if (error) {
      // Supabase Edge Function 에러는 context에 더 자세한 정보가 있을 수 있음
      const errorMessage = error.message || `API 요청 실패: ${error.status || 500}`
      const errorDetails = error.context || error
      
      console.error(`[API] Edge Function error:`, {
        endpoint,
        message: errorMessage,
        status: error.status,
        context: errorDetails
      })

      throw new APIError(
        errorMessage,
        error.status || 500,
        errorDetails
      )
    }

    // data가 null이거나 undefined인 경우도 확인
    if (data === null || data === undefined) {
      console.warn(`[API] Edge Function returned null/undefined for: ${endpoint}`)
      throw new APIError(`서버 응답이 비어있습니다: ${endpoint}`, 502)
    }

    return data as T
  } catch (error: any) {
    if (error instanceof APIError) {
      throw error
    }

    // Supabase 함수 호출 에러 처리
    if (error?.message?.includes('non-2xx') || error?.message?.includes('status code')) {
      const statusMatch = error.message?.match(/(\d{3})/)
      const statusCode = statusMatch ? parseInt(statusMatch[1]) : 500
      
      console.error(`[API] Non-2xx status code error:`, {
        endpoint,
        statusCode,
        error: error.message,
        details: error
      })

      throw new APIError(
        `서버 오류가 발생했습니다 (${statusCode}). ${error.message || 'Edge Function이 실패했습니다.'}`,
        statusCode,
        error
      )
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
    console.log('API: parseOrder called with:', inputText)
    
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
        } | null
        confidence?: number
      }>
    }>('ai-parse-order', {
      method: 'POST',
      body: JSON.stringify({ inputText }),
    })

    console.log('API: Raw result from Supabase:', result)

    // 응답 데이터 검증
    if (!result) {
      throw new APIError('AI 응답이 비어있습니다.', 502)
    }

    if (!result.customer_name) {
      result.customer_name = '미지정'
    }

    if (!result.items || !Array.isArray(result.items) || result.items.length === 0) {
      throw new APIError('주문 품목이 없습니다.', 400)
    }

    // 프론트엔드 형식에 맞게 변환
    const transformed = {
      customer: result.customer_name,
      items: result.items.map((item, index) => {
        const transformedItem = {
          code: item.matched_item?.code || '',
          name: item.item_name || `품목 ${index + 1}`,
          quantity: item.qty || 0,
          price: item.matched_item?.price || 0,
          unit: item.matched_item?.unit || '개',
          note: item.confidence ? `매칭 신뢰도: ${(item.confidence * 100).toFixed(0)}%` : undefined,
        }
        console.log(`API: Transformed item ${index}:`, transformedItem)
        return transformedItem
      }),
    }

    console.log('API: Final transformed result:', transformed)
    return transformed
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
