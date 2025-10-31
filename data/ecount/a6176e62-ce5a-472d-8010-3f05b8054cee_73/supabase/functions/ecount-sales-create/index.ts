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

    const { customer, items, type = 'sale' } = await req.json()
    
    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Customer and items are required' }),
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

    // 판매 전표 데이터 구성
    const saleData = {
      session_id: loginData.session_id,
      CUST: customer.name || customer,
      SALE_DT: new Date().toISOString().split('T')[0],
      REMARK: `AI 주문 처리 - ${traceId}`,
      SaleList: items.map((item: any, index: number) => ({
        SEQ: index + 1,
        PROD_CD: item.code || item.sku,
        QTY: item.quantity || item.qty || 1,
        PRICE: item.price || 0,
        REMARK: item.note || ''
      }))
    }

    // 판매 전표 생성 API 호출
    const createResponse = await fetch('http://sboapi.ecount.com/sales/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData)
    })

    const createData = await createResponse.json()
    const duration = Date.now() - startTime

    // API 로그 저장
    await supabaseClient
      .from('api_logs')
      .insert({
        user_id: user.id,
        function_name: 'ecount-sales-create',
        request_id: traceId,
        status_code: createResponse.status,
        duration_ms: duration,
        trace_id: traceId,
        error_message: createResponse.ok ? null : JSON.stringify(createData)
      })

    if (!createResponse.ok) {
      return new Response(
        JSON.stringify({ 
          error: 'Sales creation failed', 
          details: createData,
          trace_id: traceId 
        }),
        { 
          status: createResponse.status, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        slip_no: createData.slip_no || createData.SLIP_NO,
        trace_id: traceId,
        message: '판매 전표가 성공적으로 생성되었습니다.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in ecount-sales-create:', error)
    
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