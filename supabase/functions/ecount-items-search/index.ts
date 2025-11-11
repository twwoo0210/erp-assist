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

    const { keyword } = await req.json()
    
    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Keyword is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const traceId = crypto.randomUUID()
    const startTime = Date.now()

    // Ecount 자격증명 가져오기
    const companyCode = Deno.env.get('ECOUNT_COMPANY_CODE')
    const userId = Deno.env.get('ECOUNT_USER_ID')
    const apiKey = Deno.env.get('ECOUNT_API_KEY')

    if (!companyCode || !userId || !apiKey) {
      return new Response(
        JSON.stringify({ error: 'Ecount credentials not configured' }),
        { status: 424, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 세션 ID 가져오기 (로그인)
    const loginResponse = await fetch('http://sboapi.ecount.com/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        company_code: companyCode,
        user_id: userId,
        api_key: apiKey
      })
    })

    const loginData = await loginResponse.json()
    
    if (!loginResponse.ok || !loginData.session_id) {
      throw new Error(`Login failed: ${JSON.stringify(loginData)}`)
    }

    // 품목 검색 API 호출 (매뉴얼에 따른 올바른 구조)
    const searchResponse = await fetch('http://sboapi.ecount.com/item/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        SESSION_ID: loginData.session_id,
        PROD_CD: keyword
      })
    })

    const searchData = await searchResponse.json()
    const duration = Date.now() - startTime

    // API 로그 저장
    await supabaseClient
      .from('api_logs')
      .insert({
        user_id: user.id,
        function_name: 'ecount-items-search',
        request_id: traceId,
        status_code: searchResponse.status,
        duration_ms: duration,
        trace_id: traceId,
        error_message: searchResponse.ok ? null : JSON.stringify(searchData)
      })

    if (!searchResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Search failed', 
          details: searchData,
          trace_id: traceId 
        }),
        { 
          status: searchResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 품목 데이터 정규화 (매뉴얼에 따른 응답 구조)
    // Result는 JSON 문자열로 반환될 수 있음
    let resultData = searchData.Data?.Result || searchData.Result || []
    if (typeof resultData === 'string') {
      try {
        resultData = JSON.parse(resultData)
      } catch (e) {
        resultData = []
      }
    }
    
    const items = (Array.isArray(resultData) ? resultData : [resultData]).map((item: any) => ({
      code: item.PROD_CD || item.code || '',
      name: item.PROD_DES || item.PROD_NM || item.name || '',
      price: parseFloat(item.OUT_PRICE || item.PRICE || item.price || 0),
      unit: item.UNIT || item.unit || 'EA'
    })).filter((item: any) => item.code) // 빈 항목 제거

    return new Response(
      JSON.stringify({
        success: true,
        items,
        trace_id: traceId,
        total: items.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ecount-items-search:', error)
    
    return new Response(
      JSON.stringify({ 
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