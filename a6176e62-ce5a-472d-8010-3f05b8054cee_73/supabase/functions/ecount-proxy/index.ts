import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-account-slug',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1) 토큰 검증
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2) 계정 슬러그 확인
    const accountSlug = req.headers.get('x-account-slug')
    if (!accountSlug) {
      return new Response(
        JSON.stringify({ error: 'x-account-slug header required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3) 멤버십 검증
    const { data: membership, error: membershipError } = await supabase
      .from('account_members')
      .select('account_id, accounts!inner(slug)')
      .eq('user_id', user.id)
      .eq('accounts.slug', accountSlug)
      .single()

    if (membershipError || !membership) {
      return new Response(
        JSON.stringify({ error: 'Access denied to this account' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 4) ECOUNT 시크릿 조회
    const prefix = `ECOUNT__${accountSlug}__`
    const companyCode = Deno.env.get(`${prefix}COMPANY_CODE`)
    const userId = Deno.env.get(`${prefix}USER_ID`)
    const apiKey = Deno.env.get(`${prefix}API_KEY`)

    if (!companyCode || !userId || !apiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'ECOUNT credentials not configured for this account',
          account_slug: accountSlug 
        }),
        { status: 424, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 5) 요청 바디 파싱
    const requestBody = await req.json()
    const { action, data } = requestBody

    let ecountResponse
    const traceId = crypto.randomUUID()

    try {
      // ECOUNT API 호출 로직
      switch (action) {
        case 'login':
          ecountResponse = await fetch('http://sboapi.ecount.com/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              company_code: companyCode,
              user_id: userId,
              api_key: apiKey,
              trace_id: traceId
            })
          })
          break

        case 'upload':
          // 세션 확인 후 업로드 로직
          const { data: session } = await supabase
            .from('ecount_sessions')
            .select('session_id, expires_at')
            .eq('company_code', companyCode)
            .eq('user_id', userId)
            .single()

          let sessionId = session?.session_id
          
          // 세션이 없거나 만료된 경우 로그인
          if (!session || new Date(session.expires_at) < new Date()) {
            const loginResponse = await fetch('http://sboapi.ecount.com/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                company_code: companyCode,
                user_id: userId,
                api_key: apiKey,
                trace_id: traceId
              })
            })
            
            const loginResult = await loginResponse.json()
            sessionId = loginResult.session_id
            
            // 세션 저장
            await supabase
              .from('ecount_sessions')
              .upsert({
                company_code: companyCode,
                user_id: userId,
                session_id: sessionId,
                expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString()
              })
          }

          // 업로드 API 호출
          ecountResponse = await fetch('http://sboapi.ecount.com/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              session_id: sessionId,
              data: data,
              trace_id: traceId
            })
          })
          break

        default:
          return new Response(
            JSON.stringify({ error: 'Invalid action' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }

      const result = await ecountResponse.json()

      // 로그 저장 (민감 정보 마스킹)
      await supabase
        .from('ecount_logs')
        .insert({
          trace_id: traceId,
          company_code: companyCode,
          user_id: '****', // 마스킹
          api_key: '****', // 마스킹
          request_data: JSON.stringify({ action, data: '****' }),
          response_data: JSON.stringify(result),
          status_code: ecountResponse.status,
          created_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({
          success: true,
          trace_id: traceId,
          data: result
        }),
        { 
          status: ecountResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )

    } catch (error) {
      // 에러 로그 저장
      await supabase
        .from('ecount_logs')
        .insert({
          trace_id: traceId,
          company_code: companyCode,
          user_id: '****',
          api_key: '****',
          request_data: JSON.stringify({ action, error: error.message }),
          response_data: JSON.stringify({ error: error.message }),
          status_code: 502,
          created_at: new Date().toISOString()
        })

      return new Response(
        JSON.stringify({ 
          success: false,
          error: error.message,
          trace_id: traceId 
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})