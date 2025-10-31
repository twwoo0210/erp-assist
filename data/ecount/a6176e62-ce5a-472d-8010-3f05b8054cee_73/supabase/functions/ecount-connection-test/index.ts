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

    const loginData = await loginResponse.json()
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
        company_code,
        ecount_user_id,
        status,
        masked_api_key_suffix: maskedApiKeySuffix,
        updated_at: new Date().toISOString()
      })

    if (!loginResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Connection test failed', 
          details: loginData,
          trace_id: traceId,
          status
        }),
        { 
          status: loginResponse.status, 
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

  } catch (error) {
    console.error('Error in ecount-connection-test:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Internal server error',
        message: error.message,
        trace_id: crypto.randomUUID()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})