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

// JSON 유효성 검증 함수
function validateJsonResponse(data: any): boolean {
  try {
    // 비표준 JSON 체크 (홑따옴표, undefined 등)
    const jsonString = JSON.stringify(data)
    if (jsonString.includes("'") || jsonString.includes('undefined')) {
      return false
    }
    return true
  } catch {
    return false
  }
}

// Ecount API 로그인 함수
async function loginToEcount(companyCode: string, userId: string, apiKey: string, traceId: string) {
  const loginData = {
    company_code: companyCode,
    user_id: userId,
    api_key: apiKey
  }

  const response = await fetch('http://sboapi.ecount.com/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(loginData)
  })

  const responseText = await response.text()
  let responseData

  try {
    responseData = JSON.parse(responseText)
  } catch {
    throw new Error(`Invalid JSON response: ${responseText}`)
  }

  // JSON 유효성 검증
  if (!validateJsonResponse(responseData)) {
    throw new Error('Response contains non-standard JSON format')
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

    // Secrets에서 Ecount 설정 읽기
    const companyCode = Deno.env.get('ECOUNT_COMPANY_CODE')
    const userId = Deno.env.get('ECOUNT_USER_ID')
    const apiKey = Deno.env.get('ECOUNT_API_KEY')

    if (!companyCode || !userId || !apiKey) {
      throw new Error('Ecount API 설정이 누락되었습니다.')
    }

    // Ecount 로그인 API 호출
    const loginResult = await loginToEcount(companyCode, userId, apiKey, traceId)
    
    if (loginResult.status !== 200) {
      // 실패 로그 저장
      await supabaseClient
        .from('ecount_logs')
        .insert({
          trace_id: traceId,
          endpoint: '/login',
          payload: {
            company_code: companyCode,
            user_id: userId,
            user_pwd: '[HIDDEN]'
          },
          result: {
            status: loginResult.status,
            response: loginResult.data,
            raw_response: loginResult.rawResponse
          }
        })

      return new Response(
        JSON.stringify({
          error: loginResult.data?.message || 'Ecount 로그인에 실패했습니다.',
          trace_id: traceId
        }),
        { 
          status: loginResult.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const sessionId = loginResult.data?.session_id
    if (!sessionId) {
      throw new Error('세션 ID를 받지 못했습니다.')
    }

    // 세션 만료 시간 계산 (기본 30분)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString()

    // ecount_sessions에 upsert
    const { error: sessionError } = await supabaseClient
      .from('ecount_sessions')
      .upsert({
        company_code: companyCode,
        user_id: userId,
        session_id: sessionId,
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_code,user_id'
      })

    if (sessionError) {
      throw new Error(`세션 저장 실패: ${sessionError.message}`)
    }

    // 성공 로그 저장
    await supabaseClient
      .from('ecount_logs')
      .insert({
        trace_id: traceId,
        endpoint: '/login',
        payload: {
          company_code: companyCode,
          user_id: userId,
          user_pwd: '[HIDDEN]'
        },
        result: {
          status: 200,
          session_id: sessionId,
          expires_at: expiresAt,
          success: true
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        session_id: sessionId,
        expires_at: expiresAt,
        trace_id: traceId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Ecount Login Error:', error)
    
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
          endpoint: '/login',
          payload: {
            company_code: Deno.env.get('ECOUNT_COMPANY_CODE') || '[MISSING]',
            user_id: Deno.env.get('ECOUNT_USER_ID') || '[MISSING]',
            user_pwd: '[HIDDEN]'
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
        error: error.message || 'Ecount 로그인 중 오류가 발생했습니다.',
        trace_id: traceId
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})