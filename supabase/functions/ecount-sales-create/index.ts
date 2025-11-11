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

    // 판매 전표 데이터 구성 (매뉴얼에 따른 올바른 구조)
    // 같은 전표로 묶기 위해 동일한 UPLOAD_SER_NO 사용
    const uploadSerNo = '1'
    const ioDate = new Date().toISOString().split('T')[0].replace(/-/g, '')
    
    const saleData = {
      SESSION_ID: loginData.session_id,
      SaleList: items.map((item: any, index: number) => ({
        BulkDatas: {
          UPLOAD_SER_NO: uploadSerNo,
          IO_DATE: ioDate,
          CUST: typeof customer === 'string' ? '' : (customer.code || ''),
          CUST_DES: typeof customer === 'string' ? customer : (customer.name || ''),
          WH_CD: '', // 출하창고코드 (필수이지만 기본값으로 처리)
          PROD_CD: item.code || '',
          PROD_DES: item.name || '',
          QTY: String(item.quantity || item.qty || 1),
          PRICE: String(item.price || 0),
          REMARKS: item.note || `AI 주문 처리 - ${traceId}`
        }
      }))
    }

    // 판매 전표 생성 API 호출 (매뉴얼에 따른 올바른 엔드포인트)
    const createResponse = await fetch('http://sboapi.ecount.com/sale/upload', {
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
        slip_no: createData.Data?.SlipNos?.[0] || createData.slip_no || createData.SLIP_NO,
        trace_id: traceId,
        message: '판매 전표가 성공적으로 생성되었습니다.',
        details: createData.Data
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