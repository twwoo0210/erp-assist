import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 입력 검증 인터페이스
interface OrderItem {
  item_name: string;
  qty: number;
  matched_item?: {
    code: string;
    name: string;
    price: number;
    unit?: string;
  };
  confidence?: number;
}

interface OrderData {
  customer_name: string;
  items: OrderItem[];
}

interface CreateOrderInput {
  orderData: OrderData;
}

// 입력 검증 함수
function validateInput(data: any): CreateOrderInput {
  if (!data || typeof data !== 'object') {
    throw new Error('요청 데이터가 올바르지 않습니다.');
  }
  
  if (!data.orderData || typeof data.orderData !== 'object') {
    throw new Error('주문 데이터가 필요합니다.');
  }
  
  const { orderData } = data;
  
  if (!orderData.customer_name || typeof orderData.customer_name !== 'string') {
    throw new Error('거래처명이 필요합니다.');
  }
  
  if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
    throw new Error('주문 품목이 필요합니다.');
  }
  
  // 각 아이템 검증
  orderData.items.forEach((item: any, index: number) => {
    if (!item.item_name || typeof item.item_name !== 'string') {
      throw new Error(`품목 ${index + 1}의 이름이 올바르지 않습니다.`);
    }
    
    if (typeof item.qty !== 'number' || item.qty <= 0) {
      throw new Error(`품목 ${index + 1}의 수량이 올바르지 않습니다.`);
    }
  });
  
  return { orderData };
}

// 총액 계산 함수
function calculateTotalAmount(items: OrderItem[]): number {
  return items.reduce((total, item) => {
    return total + (item.matched_item?.price || 0) * item.qty;
  }, 0);
}

// 문서 ID 생성 함수
function generateDocumentId(): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  return `S-${today}-${randomNum}`;
}

// ECOUNT API 시뮬레이션 함수
async function simulateEcountAPI(orderData: OrderData): Promise<any> {
  // 시뮬레이션 지연
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  // 90% 성공률
  const isSuccess = Math.random() > 0.1;
  
  if (!isSuccess) {
    const errorMessages = [
      '재고가 부족합니다.',
      '거래처 정보를 찾을 수 없습니다.',
      '품목 코드가 유효하지 않습니다.',
      '네트워크 연결 오류가 발생했습니다.',
      'ECOUNT 서버가 일시적으로 사용할 수 없습니다.'
    ];
    const randomError = errorMessages[Math.floor(Math.random() * errorMessages.length)];
    throw new Error(randomError);
  }
  
  const documentId = generateDocumentId();
  const totalAmount = calculateTotalAmount(orderData.items);
  
  return {
    success: true,
    document_id: documentId,
    message: `이카운트 판매전표 (${documentId})가 성공적으로 생성되었습니다.`,
    total_amount: totalAmount,
    items_count: orderData.items.length,
    customer_name: orderData.customer_name,
    created_at: new Date().toISOString()
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 입력 검증
    const requestData = await req.json();
    const { orderData } = validateInput(requestData);
    
    // 추가 비즈니스 로직 검증
    const totalAmount = calculateTotalAmount(orderData.items);
    if (totalAmount <= 0) {
      throw new Error('주문 총액이 0원 이하입니다. 품목 매칭을 확인해주세요.');
    }
    
    // 매칭되지 않은 품목 확인
    const unmatchedItems = orderData.items.filter(item => !item.matched_item);
    if (unmatchedItems.length > 0) {
      console.warn('매칭되지 않은 품목:', unmatchedItems.map(item => item.item_name));
    }
    
    // ECOUNT API 호출 시뮬레이션
    const result = await simulateEcountAPI(orderData);
    
    // 성공 로그
    console.log('전표 생성 성공:', {
      document_id: result.document_id,
      customer: orderData.customer_name,
      items_count: orderData.items.length,
      total_amount: result.total_amount
    });
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('ECOUNT Create Order Error:', error);
    
    // 에러 타입별 상태 코드 설정
    let statusCode = 500;
    if (error.message.includes('올바르지 않습니다') || error.message.includes('필요합니다')) {
      statusCode = 400; // Bad Request
    } else if (error.message.includes('재고') || error.message.includes('거래처')) {
      statusCode = 422; // Unprocessable Entity
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || '전표 생성 중 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})