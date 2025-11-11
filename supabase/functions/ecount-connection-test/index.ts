import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 사용자의 org_id 가져오기
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('org_id')
      .eq('id', user.id)
      .single()

    const { company_code, ecount_user_id } = await req.json()
    
    if (!company_code || !ecount_user_id) {
      return new Response(
        JSON.stringify({ error: 'Company code and Ecount user ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const traceId = crypto.randomUUID()
    const startTime = Date.now()

    // Ecount API Key는 Secrets에서 가져오기
    const apiKey = Deno.env.get('ECOUNT_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Ecount API key not configured in secrets' }),
        { status: 424, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ecount 로그인 테스트
    const loginResponse = await fetch('http://sboapi.ecount.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code,
        user_id: ecount_user_id,
        api_key: apiKey
      })
    })

    // 응답 본문을 텍스트로 먼저 읽기
    const responseText = await loginResponse.text()
    let loginData: any = {}
    
    try {
      loginData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse login response:', responseText)
      throw new Error(`Ecount API 응답 파싱 실패: ${responseText.substring(0, 200)}`)
    }
    
    const duration = Date.now() - startTime

    // API 로그 저장
    await supabaseClient
      .from('api_logs')
      .insert({
        user_id: user.id,
        function_name: 'ecount-connection-test',
        request_id: traceId,
        status_code: loginResponse.status,
        duration_ms: duration,
        trace_id: traceId,
        error_message: loginResponse.ok ? null : JSON.stringify(loginData)
      })

    const status = loginResponse.ok && loginData.session_id ? 'connected' : 'error'
    const maskedApiKeySuffix = apiKey.slice(-4)

    // ecount_connections 테이블 업데이트
    await supabaseClient
      .from('ecount_connections')
      .upsert({
        user_id: user.id,
        org_id: profile?.org_id || null,
        connection_name: 'primary',
        company_code,
        ecount_user_id,
        status,
        masked_api_key_suffix: maskedApiKeySuffix,
        updated_at: new Date().toISOString()
      }, {
        onConflict: profile?.org_id ? 'org_id,connection_name' : 'user_id'
      })

    if (!loginResponse.ok || !loginData.session_id) {
      const errorMessage = loginData.message || loginData.error || loginData.Message || 'Ecount 로그인에 실패했습니다.'
      const errorCode = loginData.code || loginData.Code || loginResponse.status
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          error_code: errorCode,
          details: loginData,
          trace_id: traceId,
          status: 'error',
          http_status: loginResponse.status
        }),
        { 
          status: 200, // 프론트엔드에서 에러를 처리할 수 있도록 200 반환
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Ecount 연결 테스트가 성공했습니다.',
        trace_id: traceId,
        status,
        masked_api_key_suffix: maskedApiKeySuffix
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in ecount-connection-test:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    
    // 에러 타입별 상태 코드 결정
    let statusCode = 500
    let errorMessage = 'Internal server error'
    
    if (error.message?.includes('파싱 실패') || error.message?.includes('JSON')) {
      statusCode = 502 // Bad Gateway
      errorMessage = 'Ecount API 응답을 처리할 수 없습니다.'
    } else if (error.message?.includes('fetch') || error.message?.includes('network')) {
      statusCode = 503 // Service Unavailable
      errorMessage = 'Ecount API 서버에 연결할 수 없습니다.'
    } else if (error.message) {
      errorMessage = error.message
    }
    
    // 프론트엔드에서 에러를 처리할 수 있도록 200 상태 코드로 반환
    // Supabase 클라이언트가 non-2xx 상태 코드를 받으면 error 객체로 처리하므로
    // 실제 에러 정보를 포함한 JSON을 200으로 반환
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        message: errorMessage,
        error_code: statusCode,
        http_status: statusCode,
        trace_id: crypto.randomUUID(),
        details: {
          type: error.name || 'UnknownError',
          message: error.message || '알 수 없는 오류',
          stack: error.stack || '스택 정보 없음'
        }
      }),
      { 
        status: 200, // 프론트엔드에서 에러를 처리할 수 있도록 200 반환
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})