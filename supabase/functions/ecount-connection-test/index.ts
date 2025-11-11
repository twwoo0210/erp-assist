import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 핸들러 함수를 별도로 분리하여 에러 처리 강화
async function handleRequest(req: Request): Promise<Response> {
  try {
    console.log('=== ecount-connection-test Edge Function Called ===')
    console.log('Method:', req.method)
    console.log('URL:', req.url)
    console.log('Headers:', Object.fromEntries(req.headers.entries()))
    
    if (req.method === 'OPTIONS') {
      console.log('OPTIONS request - returning CORS headers')
      return new Response('ok', { headers: corsHeaders })
    }

    console.log('Processing request...')
    
    // 환경 변수 확인
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      urlLength: supabaseUrl?.length || 0,
      keyLength: supabaseServiceKey?.length || 0
    })
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables:', {
        SUPABASE_URL: !!supabaseUrl,
        SUPABASE_SERVICE_ROLE_KEY: !!supabaseServiceKey
      })
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
      console.log('No Authorization header')
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Authorization header required',
          message: '인증 헤더가 필요합니다.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Creating Supabase client...')
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey)
    console.log('Supabase client created successfully')

    const token = authHeader.replace('Bearer ', '')
    console.log('Validating token...')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Token validation failed:', authError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid token',
          message: '인증 토큰이 유효하지 않습니다.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    console.log('Token validated, user:', user.email)

    // 사용자의 org_id 가져오기 (에러가 발생해도 계속 진행)
    let profile: any = null
    try {
      const { data: profileData, error: profileError } = await supabaseClient
        .from('profiles')
        .select('org_id')
        .eq('id', user.id)
        .single()
      
      if (!profileError && profileData) {
        profile = profileData
      }
    } catch (profileErr) {
      console.error('Failed to fetch profile:', profileErr)
      // 프로필 조회 실패는 무시하고 계속 진행
    }

    // 요청 본문 파싱
    let company_code: string
    let ecount_user_id: string
    try {
      const body = await req.json()
      company_code = body.company_code
      ecount_user_id = body.ecount_user_id
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid request body',
          message: '요청 본문을 파싱할 수 없습니다.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
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

    // Ecount API Key는 Secrets에서 가져오기
    const apiKey = Deno.env.get('ECOUNT_API_KEY')

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Ecount API key not configured in secrets' }),
        { status: 424, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Ecount 로그인 테스트
    let loginResponse: Response
    let responseText: string
    let loginData: any = {}
    
    try {
      const loginRequest = {
        company_code,
        user_id: ecount_user_id,
        api_key: apiKey
      }
      
      console.log('Ecount login request:', {
        company_code,
        user_id: ecount_user_id,
        api_key: apiKey ? `${apiKey.substring(0, 4)}...${apiKey.slice(-4)}` : 'MISSING'
      })
      
      loginResponse = await fetch('http://sboapi.ecount.com/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest)
      })

      console.log('Ecount login response status:', loginResponse.status)
      console.log('Ecount login response headers:', Object.fromEntries(loginResponse.headers.entries()))

      // 응답 본문을 텍스트로 먼저 읽기
      responseText = await loginResponse.text()
      console.log('Ecount login response text (first 500 chars):', responseText.substring(0, 500))
      
      try {
        loginData = JSON.parse(responseText)
        console.log('Ecount login parsed data:', JSON.stringify(loginData).substring(0, 500))
      } catch (parseError) {
        console.error('Failed to parse login response:', responseText)
        console.error('Parse error:', parseError)
        // JSON 파싱 실패는 에러로 처리하되, 함수는 계속 진행
        loginData = {
          error: 'JSON 파싱 실패',
          raw_response: responseText.substring(0, 500)
        }
      }
    } catch (fetchError: any) {
      console.error('Ecount API fetch error:', fetchError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Ecount API 서버에 연결할 수 없습니다.',
          message: fetchError.message || '네트워크 오류가 발생했습니다.',
          error_code: 503,
          http_status: 503,
          trace_id: traceId,
          details: {
            type: fetchError.name || 'NetworkError',
            message: fetchError.message || '알 수 없는 네트워크 오류'
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const duration = Date.now() - startTime

    // API 로그 저장 (에러가 발생해도 계속 진행)
    try {
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
    } catch (logError) {
      console.error('Failed to save API log:', logError)
      // 로그 저장 실패는 무시하고 계속 진행
    }

    const status = loginResponse.ok && loginData.session_id ? 'connected' : 'error'
    const maskedApiKeySuffix = apiKey.slice(-4)

    // ecount_connections 테이블 업데이트
    // unique 제약조건: (org_id, connection_name)
    try {
      const upsertData: any = {
        connection_name: 'primary',
        company_code,
        ecount_user_id,
        status,
        masked_api_key_suffix: maskedApiKeySuffix,
        updated_at: new Date().toISOString()
      }

      // org_id가 있으면 org_id 기반으로, 없으면 user_id 기반으로
      if (profile?.org_id) {
        upsertData.org_id = profile.org_id
        upsertData.user_id = user.id
        await supabaseClient
          .from('ecount_connections')
          .upsert(upsertData, {
            onConflict: 'org_id,connection_name'
          })
      } else {
        // org_id가 없는 경우, 기존 레코드를 찾아서 업데이트하거나 새로 생성
        const { data: existing } = await supabaseClient
          .from('ecount_connections')
          .select('id')
          .eq('user_id', user.id)
          .eq('connection_name', 'primary')
          .single()

        if (existing) {
          await supabaseClient
            .from('ecount_connections')
            .update(upsertData)
            .eq('id', existing.id)
        } else {
          upsertData.user_id = user.id
          await supabaseClient
            .from('ecount_connections')
            .insert(upsertData)
        }
      }
    } catch (connError) {
      console.error('Failed to save ecount connection:', connError)
      // 연결 정보 저장 실패는 무시하고 계속 진행
    }

    if (!loginResponse.ok || !loginData.session_id) {
      const errorMessage = loginData.message || loginData.error || loginData.Message || loginData.Error || 'Ecount 로그인에 실패했습니다.'
      const errorCode = loginData.code || loginData.Code || loginData.ErrorCode || loginResponse.status
      
      console.error('Ecount login failed:', {
        status: loginResponse.status,
        ok: loginResponse.ok,
        hasSessionId: !!loginData.session_id,
        errorMessage,
        errorCode,
        fullResponse: loginData
      })
      
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
          status: 200, // 프론트엔드에서 에러를 처리할 수 있도록 200 반환
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }
    
    console.log('Ecount login successful, session_id:', loginData.session_id)

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
    console.error('=== CRITICAL ERROR in ecount-connection-test ===')
    console.error('Error type:', typeof error)
    console.error('Error name:', error?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    
    // 에러 타입별 상태 코드 결정
    let statusCode = 500
    let errorMessage = 'Internal server error'
    
    if (error?.message?.includes('파싱 실패') || error?.message?.includes('JSON')) {
      statusCode = 502 // Bad Gateway
      errorMessage = 'Ecount API 응답을 처리할 수 없습니다.'
    } else if (error?.message?.includes('fetch') || error?.message?.includes('network')) {
      statusCode = 503 // Service Unavailable
      errorMessage = 'Ecount API 서버에 연결할 수 없습니다.'
    } else if (error?.message) {
      errorMessage = error.message
    } else if (error?.toString) {
      errorMessage = error.toString()
    }
    
    // 프론트엔드에서 에러를 처리할 수 있도록 200 상태 코드로 반환
    // Supabase 클라이언트가 non-2xx 상태 코드를 받으면 error 객체로 처리하므로
    // 실제 에러 정보를 포함한 JSON을 200으로 반환
    try {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          message: errorMessage,
          error_code: statusCode,
          http_status: statusCode,
          trace_id: crypto.randomUUID(),
          details: {
            type: error?.name || 'UnknownError',
            message: error?.message || '알 수 없는 오류',
            stack: error?.stack || '스택 정보 없음',
            rawError: error?.toString?.() || String(error)
          }
        }),
        { 
          status: 200, // 프론트엔드에서 에러를 처리할 수 있도록 200 반환
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } catch (responseError) {
      // JSON.stringify도 실패하는 경우
      console.error('Failed to create error response:', responseError)
      return new Response(
        'Internal server error',
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
        }
      )
    }
  }
}

// serve 함수에 핸들러를 전달하고, 추가 에러 처리
serve(async (req) => {
  try {
    return await handleRequest(req)
  } catch (outerError: any) {
    // handleRequest 내부에서 처리되지 않은 예외 처리
    console.error('=== OUTER ERROR HANDLER ===')
    console.error('Outer error:', outerError)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Unexpected server error',
        message: outerError?.message || '예상치 못한 서버 오류가 발생했습니다.',
        error_code: 500,
        http_status: 500,
        trace_id: crypto.randomUUID(),
        details: {
          type: outerError?.name || 'UnknownError',
          message: outerError?.message || '알 수 없는 오류',
          stack: outerError?.stack || '스택 정보 없음'
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})