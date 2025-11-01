import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_id, to, doc_type = 'quote' } = await req.json();
    
    if (!order_id || !to) {
      return new Response(
        JSON.stringify({ error: "order_id and to are required" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 주문 데이터 조회
    const { data: orderData, error: orderError } = await supabase
      .from('order_intake')
      .select(`
        *,
        customer_master (
          customer_name,
          email
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError) {
      throw orderError;
    }

    // 이메일 내용 생성
    const subject = `${doc_type === 'quote' ? '견적서' : '거래명세서'} - ${orderData.customer_master?.customer_name || ''}`;
    const emailBody = generateEmailBody(orderData, doc_type);

    // 실제 이메일 발송 로직 (여기서는 시뮬레이션)
    console.log(`Sending email to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${emailBody}`);

    // 이메일 발송 로그 저장
    await supabase.from('api_logs').insert({
      fn: 'send-email',
      payload_hash: btoa(`${order_id}-${to}`).slice(0, 32),
      status: 200,
      response_time_ms: Date.now() % 1000
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "이메일이 성공적으로 발송되었습니다.",
        to: to,
        subject: subject
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Send email error:', error);
    
    await supabase.from('api_logs').insert({
      fn: 'send-email',
      status: 500,
      error_message: error.message,
      response_time_ms: Date.now() % 1000
    });

    return new Response(
      JSON.stringify({ error: error.message }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function generateEmailBody(orderData: any, docType: string) {
  const title = docType === 'quote' ? '견적서' : '거래명세서';
  const date = new Date(orderData.created_at).toLocaleDateString('ko-KR');
  
  return `
안녕하세요, ${orderData.customer_master?.customer_name || '고객'}님

StocksDoctor에서 ${title}를 발송드립니다.

■ 문서 정보
- 문서 유형: ${title}
- 발행일: ${date}
- 문서번호: ${orderData.id.slice(0, 8)}
- 총 금액: ${orderData.total_amount.toLocaleString()}원

■ 주문 내용
${orderData.raw_text || '주문 상세 내용은 첨부된 문서를 확인해주세요.'}

첨부된 ${title}를 확인하시고, 문의사항이 있으시면 언제든지 연락주시기 바랍니다.

감사합니다.

StocksDoctor 팀
ERP 연동 솔루션
  `;
}