import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { orderData } = await req.json()
    
    if (!orderData) {
      return new Response(
        JSON.stringify({ error: '주문 데이터가 필요합니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 총액 계산
    const totalAmount = orderData.items.reduce((total: number, item: any) => {
      return total + (item.matched_item?.price || 0) * item.qty
    }, 0)

    // 시뮬레이션된 이카운트 API 호출 (실제 구현 시 실제 API 사용)
    const mockDocumentId = `S-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
    
    // 성공 시뮬레이션 (90% 확률)
    const isSuccess = Math.random() > 0.1
    
    if (!isSuccess) {
      // 실패 시뮬레이션
      const errorMessages = [
        '재고가 부족합니다.',
        '거래처 정보를 찾을 수 없습니다.',
        '품목 코드가 유효하지 않습니다.',
        '네트워크 연결 오류가 발생했습니다.'
      ]
      const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)]
      
      throw new Error(randomError)
    }

    // 성공 응답 시뮬레이션
    const result = {
      success: true,
      document_id: mockDocumentId,
      message: `이카운트 판매전표 (${mockDocumentId})가 성공적으로 생성되었습니다.`,
      total_amount: totalAmount,
      items_count: orderData.items.length,
      customer_name: orderData.customer_name
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: `전송 실패: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})