// API utility functions for Hono backend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new APIError(
        data.error || `API 요청 실패: ${response.status}`,
        response.status,
        data
      )
    }

    return data
  } catch (error: any) {
    if (error instanceof APIError) {
      throw error
    }

    if (error.name === 'AbortError') {
      throw new APIError('요청 시간이 초과되었습니다.', 408)
    }

    if (error.message?.includes('fetch')) {
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
    return fetchAPI('/health')
  },

  // AI Parse Order
  parseOrder: async (inputText: string) => {
    return fetchAPI('/ai-parse-order', {
      method: 'POST',
      body: JSON.stringify({ inputText }),
    })
  },

  // Create Order
  createOrder: async (orderData: any) => {
    return fetchAPI('/ecount-create-order', {
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
