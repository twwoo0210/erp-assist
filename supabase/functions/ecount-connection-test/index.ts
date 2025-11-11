import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 최상위 에러 핸들러 - 모든 예외를 포착
  try {
    console.log('=== ecount-connection-test Edge Function Called ===')
    console.log('Method:', req.method)
    console.log('URL:', req.url)
    
    if (req.method === 'OPTIONS') {
      return new Response('ok', { headers: corsHeaders })
    }

    // 환경 변수 확인
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Server configuration error',
          message: '서버 설정이 완료되지 않았습니다.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Authorization header required',
          message: '인증 헤더가 필요합니다.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid token',
          message: '인증 토큰이 유효하지 않습니다.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 프로필 조회 (에러 무시)
    let profile: any = null
    try {
      const { data: profileData } = await supabaseClient
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single()
      profile = profileData
    } catch (e) {
      // 무시
    }

    // 요청 본문 파싱
    let body: any
    try {
      body = await req.json()
    } catch (e) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid request body',
          message: '요청 본문을 파싱할 수 없습니다.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { company_code, ecount_user_id } = body || {}
    
    if (!company_code || !ecount_user_id) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Company code and Ecount user ID are required',
          message: '회사코드와 사용자 ID를 모두 입력해주세요.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const traceId = crypto.randomUUID()
    const startTime = Date.now()
    const apiKey = Deno.env.get('ECOUNT_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Ecount API key not configured',
          message: 'Ecount API 키가 설정되지 않았습니다.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ecount 로그인 테스트
    let loginResponse: Response
    let responseText: string
    let loginData: any = {}
    
    try {
      loginResponse = await fetch('http://sboapi.ecount.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_code,
          user_id: ecount_user_id,
          api_key: apiKey
        })
      })

      responseText = await loginResponse.text()
      try {
        loginData = JSON.parse(responseText)
      } catch (e) {
        loginData = { error: 'JSON 파싱 실패', raw_response: responseText.substring(0, 500) }
      }
    } catch (fetchError: any) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ecount API 서버에 연결할 수 없습니다.',
          message: fetchError.message || '네트워크 오류가 발생했습니다.',
          error_code: 503,
          http_status: 503,
          trace_id: traceId
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const duration = Date.now() - startTime

    // API 로그 저장 (에러 무시)
    try {
      await supabaseClient.from('api_logs').insert({
        user_id: user.id,
        function_name: 'ecount-connection-test',
        request_id: traceId,
        status_code: loginResponse.status,
        duration_ms: duration,
        trace_id: traceId,
        error_message: loginResponse.ok ? null : JSON.stringify(loginData)
      })
    } catch (e) {
      // 무시
    }

    const status = loginResponse.ok && loginData.session_id ? 'connected' : 'error'
    const maskedApiKeySuffix = apiKey.slice(-4)

    // ecount_connections 업데이트 (에러 무시)
    try {
      const upsertData: any = {
        connection_name: 'primary',
        company_code,
        ecount_user_id,
        status,
        masked_api_key_suffix: maskedApiKeySuffix,
        updated_at: new Date().toISOString()
      }

      if (profile?.org_id) {
        upsertData.org_id = profile.org_id
        upsertData.user_id = user.id
        await supabaseClient.from('ecount_connections').upsert(upsertData, {
          onConflict: 'org_id,connection_name'
        })
      } else {
        const { data: existing } = await supabaseClient
          .from('ecount_connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('connection_name', 'primary')
          .single()

        if (existing) {
          await supabaseClient.from('ecount_connections').update(upsertData).eq('id', existing.id)
        } else {
          upsertData.user_id = user.id
          await supabaseClient.from('ecount_connections').insert(upsertData)
        }
      }
    } catch (e) {
      // 무시
    }

    if (!loginResponse.ok || !loginData.session_id) {
      const errorMessage = loginData.message || loginData.error || loginData.Message || loginData.Error || 'Ecount 로그인에 실패했습니다.'
      const errorCode = loginData.code || loginData.Code || loginData.ErrorCode || loginResponse.status
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          error_code: errorCode,
          details: {
            ...loginData,
            http_status: loginResponse.status,
            response_text: responseText.substring(0, 1000)
          },
          trace_id: traceId,
          status: 'error',
          http_status: loginResponse.status
        }),
        { 
          status: 200,
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
    console.error('=== CRITICAL ERROR ===')
    console.error('Error:', error)
    console.error('Message:', error?.message)
    console.error('Stack:', error?.stack)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error?.message || 'Internal server error',
        message: error?.message || '예상치 못한 서버 오류가 발생했습니다.',
        error_code: 500,
        http_status: 500,
        trace_id: crypto.randomUUID(),
        details: {
          type: error?.name || 'UnknownError',
          message: error?.message || '알 수 없는 오류',
          stack: error?.stack || '스택 정보 없음'
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
