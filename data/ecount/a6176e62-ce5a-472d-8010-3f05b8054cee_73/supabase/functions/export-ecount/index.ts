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
    const { order_id } = await req.json();
    
    if (!order_id) {
      return new Response(
        JSON.stringify({ error: "order_id is required" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 주문 데이터 조회
    const { data: orderData, error: orderError } = await supabase
      .from('order_intake')
      .select(`
        *,
        customer_master (
          customer_name
        ),
        order_lines (
          *,
          item_master (
            sku_name,
            erp_item_code,
            uom
          )
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError) {
      throw orderError;
    }

    // 이카운트 CSV 형식으로 변환
    const csvData = generateEcountCSV(orderData);
    
    // CSV를 Base64로 인코딩하여 다운로드 URL 생성
    const csvBase64 = btoa(unescape(encodeURIComponent(csvData)));
    const downloadUrl = `data:text/csv;charset=utf-8;base64,${csvBase64}`;

    // API 로그 저장
    await supabase.from('api_logs').insert({
      fn: 'export-ecount',
      payload_hash: btoa(order_id).slice(0, 32),
      status: 200,
      response_time_ms: Date.now() % 1000
    });

    return new Response(
      JSON.stringify({ 
        download_url: downloadUrl,
        filename: `ecount_order_${orderData.id.slice(0, 8)}.csv`,
        csv_data: csvData
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Export ecount error:', error);
    
    await supabase.from('api_logs').insert({
      fn: 'export-ecount',
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

function generateEcountCSV(orderData: any) {
  // 이카운트 판매 전표 업로드 형식
  const headers = [
    '거래처코드',
    '거래처명',
    '품목코드',
    '품목명',
    '수량',
    '단가',
    '공급가액',
    '부가세',
    '합계금액',
    '비고'
  ];

  const rows = orderData.order_lines.map((line: any) => {
    const supplyAmount = line.qty * line.unit_price * (1 - line.discount / 100);
    const vatAmount = Math.round(supplyAmount * 0.1);
    const totalAmount = supplyAmount + vatAmount;

    return [
      orderData.customer_code,
      orderData.customer_master?.customer_name || '',
      line.item_master?.erp_item_code || line.sku_code,
      line.item_master?.sku_name || '',
      line.qty,
      line.unit_price,
      supplyAmount,
      vatAmount,
      totalAmount,
      line.discount > 0 ? `할인 ${line.discount}%` : ''
    ];
  });

  // CSV 생성
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}