import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// TRACE_ID 생성 함수
function generateTraceId(): string {
  return `TRACE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// 입력 데이터 인터페이스
interface OrderItem {
  sku: string;
  qty: number;
  price: number;
}

interface Order {
  customer_name: string;
  items: OrderItem[];
  note?: string;
}

interface UploadPayload {
  orders: Order[];
  type: 'order' | 'sale';
}

// 입력 검증 함수
function validateUploadPayload(data: any): UploadPayload {
  if (!data || typeof data !== 'object') {
    throw new Error('요청 데이터가 올바르지 않습니다.')
  }
  
  if (!Array.isArray(data.orders) || data.orders.length === 0) {
    throw new Error('주문 데이터가 필요합니다.')
  }
  
  if (!data.type || !['order', 'sale'].includes(data.type)) {
    throw new Error('타입은 order 또는 sale이어야 합니다.')
  }
  
  // 각 주문 검증
  data.orders.forEach((order: any, index: number) => {
    if (!order.customer_name || typeof order.customer_name !== 'string') {
      throw new Error(`주문 ${index + 1}의 거래처명이 올바르지 않습니다.`)
    }
    
    if (!Array.isArray(order.items) || order.items.length === 0) {
      throw new Error(`주문 ${index + 1}의 품목이 필요합니다.`)
    }
    
    order.items.forEach((item: any, itemIndex: number) => {
      if (!item.sku || typeof item.sku !== 'string') {
        throw new Error(`주문 ${index + 1}, 품목 ${itemIndex + 1}의 SKU가 올바르지 않습니다.`)
      }
      
      if (typeof item.qty !== 'number' || item.qty <= 0) {
        throw new Error(`주문 ${index + 1}, 품목 ${itemIndex + 1}의 수량이 올바르지 않습니다.`)
      }
      
      if (typeof item.price !== 'number' || item.price < 0) {
        throw new Error(`주문 ${index + 1}, 품목 ${itemIndex + 1}의 가격이 올바르지 않습니다.`)
      }
    })
  })
  
  return data as UploadPayload
}

// 세션 조회 및 갱신 함수
async function getValidSession(supabaseClient: any, traceId: string): Promise<string> {
  // 현재 유효한 세션 조회
  const { data: sessions, error } = await supabaseClient
    .from('ecount_sessions')
    .select('*')
    .gt('expires_at', new Date().toISOString())
    .order('updated_at', { ascending: false })
    .limit(1)
  
  if (error) {
    throw new Error(`세션 조회 실패: ${error.message}`)
  }
  
  if (sessions && sessions.length > 0) {
    return sessions[0].session_id
  }
  
  // 유효한 세션이 없으면 로그인 호출
  console.log('유효한 세션이 없어 로그인을 시도합니다.')
  
  const loginResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ecount-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
    }
  })
  
  if (!loginResponse.ok) {
    const errorText = await loginResponse.text()
    throw new Error(`로그인 실패: ${errorText}`)
  }
  
  const loginData = await loginResponse.json()
  
  if (!loginData.session_id) {
    throw new Error('로그인 후 세션 ID를 받지 못했습니다.')
  }
  
  return loginData.session_id
}

// Ecount 데이터 매핑 함수
function mapToEcountFormat(payload: UploadPayload): any {
  const ecountData = {
    COMPANY_CODE: Deno.env.get('ECOUNT_COMPANY_CODE'),
    USER_ID: Deno.env.get('ECOUNT_USER_ID'),
    DATA: payload.orders.map((order, orderIndex) => {
      const baseData = {
        SLIP_NO: `AUTO_${Date.now()}_${orderIndex}`,
        SLIP_DATE: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
        CUSTOMER_NAME: order.customer_name,
        NOTE: order.note || '',
        TOTAL_AMOUNT: order.items.reduce((sum, item) => sum + (item.qty * item.price), 0)
      }
      
      // 품목별 상세 데이터
      const itemsData = order.items.map((item, itemIndex) => ({
        ...baseData,
        LINE_NO: itemIndex + 1,
        ITEM_CODE: item.sku,
        ITEM_NAME: item.sku, // SKU를 품목명으로 사용
        QTY: item.qty,
        UNIT_PRICE: item.price,
        AMOUNT: item.qty * item.price
      }))
      
      return itemsData
    }).flat()
  }
  
  return ecountData
}

// Rate Limit 체크 함수
function checkRateLimit(quantityInfo: any): { allowed: boolean; backoffMs: number } {
  if (!quantityInfo) {
    return { allowed: true, backoffMs: 0 }
  }
  
  const { HOUR_LIMIT, HOUR_USED, DAY_LIMIT, DAY_USED } = quantityInfo
  
  // 시간당 제한 체크
  if (HOUR_USED >= HOUR_LIMIT) {
    return { allowed: false, backoffMs: 60 * 60 * 1000 } // 1시간 대기
  }
  
  // 일일 제한 체크
  if (DAY_USED >= DAY_LIMIT) {
    return { allowed: false, backoffMs: 24 * 60 * 60 * 1000 } // 24시간 대기
  }
  
  return { allowed: true, backoffMs: 0 }
}

// Ecount 업로드 API 호출 함수
async function uploadToEcount(sessionId: string, ecountData: any, type: string, traceId: string): Promise<any> {
  const endpoint = type === 'order' ? '/order/upload' : '/sale/upload'
  const apiUrl = `http://sboapi.ecount.com${endpoint}`
  
  const requestData = {
    ...ecountData,
    SESSION_ID: sessionId,
    TRACE_ID: traceId
  }
  
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestData)
  })
  
  const responseText = await response.text()
  let responseData
  
  try {
    responseData = JSON.parse(responseText)
  } catch {
    throw new Error(`Invalid JSON response: ${responseText}`)
  }
  
  return {
    status: response.status,
    data: responseData,
    rawResponse: responseText
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const traceId = generateTraceId()
  
  try {
    // Supabase 클라이언트 초기화
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 입력 데이터 검증
    const requestData = await req.json()
    const payload = validateUploadPayload(requestData)
    
    // 유효한 세션 확보
    const sessionId = await getValidSession(supabaseClient, traceId)
    
    // Ecount 형식으로 데이터 매핑
    const ecountData = mapToEcountFormat(payload)
    
    // Ecount API 호출
    const uploadResult = await uploadToEcount(sessionId, ecountData, payload.type, traceId)
    
    if (uploadResult.status !== 200) {
      // 실패 로그 저장
      await supabaseClient
        .from('ecount_logs')
        .insert({
          trace_id: traceId,
          endpoint: `/upload/${payload.type}`,
          payload: {
            orders_count: payload.orders.length,
            type: payload.type,
            session_id: sessionId
          },
          result: {
            status: uploadResult.status,
            response: uploadResult.data,
            raw_response: uploadResult.rawResponse
          }
        })

      return new Response(
        JSON.stringify({
          success: false,
          error: uploadResult.data?.message || 'Ecount 업로드에 실패했습니다.',
          trace_id: traceId
        }),
        { 
          status: uploadResult.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Rate Limit 체크
    const rateLimitCheck = checkRateLimit(uploadResult.data?.QUANTITY_INFO)
    if (!rateLimitCheck.allowed) {
      console.warn(`Rate limit reached. Backoff: ${rateLimitCheck.backoffMs}ms`)
    }
    
    // 성공 응답 처리
    const slipNos = uploadResult.data?.SLIP_NOS || []
    const resultData = uploadResult.data?.RESULT || {}
    
    // 성공 로그 저장
    await supabaseClient
      .from('ecount_logs')
      .insert({
        trace_id: traceId,
        endpoint: `/upload/${payload.type}`,
        payload: {
          orders_count: payload.orders.length,
          type: payload.type,
          session_id: sessionId
        },
        result: {
          status: 200,
          slip_nos: slipNos,
          result: resultData,
          quantity_info: uploadResult.data?.QUANTITY_INFO,
          success: true
        }
      })

    // 클라이언트 응답
    const response = {
      success: true,
      trace_id: traceId,
      slip_nos: slipNos,
      uploaded_count: payload.orders.length,
      type: payload.type,
      rate_limit: {
        allowed: rateLimitCheck.allowed,
        backoff_ms: rateLimitCheck.backoffMs
      }
    }
    
    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Ecount Upload Error:', error)
    
    // 에러 로그 저장
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )
      
      await supabaseClient
        .from('ecount_logs')
        .insert({
          trace_id: traceId,
          endpoint: '/upload',
          payload: {
            error_context: 'Function execution error'
          },
          result: {
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString()
          }
        })
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Ecount 업로드 중 오류가 발생했습니다.',
        trace_id: traceId
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})