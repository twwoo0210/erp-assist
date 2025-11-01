import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    // Supabase 클라이언트 초기화
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // 사용자 정보 가져오기
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 사용자 프로필 및 조직 정보 가져오기
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('*, organizations(*)')
      .eq('id', user.id)
      .single()

    if (!profile?.organizations || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: '관리자 권한이 필요합니다.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const org = profile.organizations

    if (!org.ecount_zone_id || !org.ecount_com_code || !org.ecount_api_key) {
      return new Response(
        JSON.stringify({ error: '이카운트 API 설정이 필요합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 시뮬레이션된 이카운트 API 호출 (실제 구현 시 실제 API 사용)
    const mockItems = [
      { code: 'A-001', name: '[냉동] 깐쇼새우 1kg', price: 5000, unit: 'kg', category: '냉동식품' },
      { code: 'A-002', name: '[냉동] 새우볼 500g', price: 3500, unit: 'g', category: '냉동식품' },
      { code: 'A-003', name: '[냉동] 치킨너겟 1kg', price: 4500, unit: 'kg', category: '냉동식품' },
      { code: 'B-001', name: '[신선] 양파 10kg', price: 8000, unit: 'kg', category: '신선식품' },
      { code: 'B-002', name: '[신선] 당근 5kg', price: 6000, unit: 'kg', category: '신선식품' },
      { code: 'C-001', name: '[조미료] 소금 1kg', price: 2000, unit: 'kg', category: '조미료' },
      { code: 'C-002', name: '[조미료] 설탕 1kg', price: 2500, unit: 'kg', category: '조미료' },
      { code: 'D-001', name: '[포장재] 일회용 용기 100개', price: 15000, unit: '개', category: '포장재' }
    ]

    const mockCustomers = [
      { code: 'CUST-001', name: 'A거래처', category: '도매' },
      { code: 'CUST-002', name: 'B마트', category: '소매' },
      { code: 'CUST-003', name: 'C식당', category: '외식업' },
      { code: 'CUST-004', name: 'D카페', category: '카페' },
      { code: 'CUST-005', name: 'E호텔', category: '호텔' }
    ]

    // 기존 캐시 데이터 삭제
    await supabaseClient
      .from('cached_masters')
      .delete()
      .eq('organization_id', org.id)

    // 품목 데이터 삽입
    const itemsToInsert = mockItems.map(item => ({
      organization_id: org.id,
      type: 'item',
      ecount_code: item.code,
      name: item.name,
      price: item.price,
      unit: item.unit,
      category: item.category
    }))

    const { error: itemsError } = await supabaseClient
      .from('cached_masters')
      .insert(itemsToInsert)

    if (itemsError) {
      throw new Error(`품목 데이터 저장 실패: ${itemsError.message}`)
    }

    // 거래처 데이터 삽입
    const customersToInsert = mockCustomers.map(customer => ({
      organization_id: org.id,
      type: 'customer',
      ecount_code: customer.code,
      name: customer.name,
      category: customer.category
    }))

    const { error: customersError } = await supabaseClient
      .from('cached_masters')
      .insert(customersToInsert)

    if (customersError) {
      throw new Error(`거래처 데이터 저장 실패: ${customersError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '마스터 데이터 동기화가 완료되었습니다.',
        itemCount: mockItems.length,
        customerCount: mockCustomers.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})