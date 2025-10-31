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
    const { order_id, doc_type = 'quote' } = await req.json();
    
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
          customer_name,
          email,
          phone
        ),
        order_lines (
          *,
          item_master (
            sku_name,
            uom
          )
        )
      `)
      .eq('id', order_id)
      .single();

    if (orderError) {
      throw orderError;
    }

    // HTML 문서 생성
    const html = generateDocumentHTML(orderData, doc_type);
    
    // 임시로 HTML을 반환 (실제로는 PDF 변환 서비스 사용)
    const documentUrl = `data:text/html;base64,${btoa(html)}`;

    // API 로그 저장
    await supabase.from('api_logs').insert({
      fn: 'generate-docs',
      payload_hash: btoa(order_id).slice(0, 32),
      status: 200,
      response_time_ms: Date.now() % 1000
    });

    return new Response(
      JSON.stringify({ 
        pdf_url: documentUrl,
        html_content: html
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Generate docs error:', error);
    
    await supabase.from('api_logs').insert({
      fn: 'generate-docs',
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

function generateDocumentHTML(orderData: any, docType: string) {
  const title = docType === 'quote' ? '견적서' : '거래명세서';
  const date = new Date(orderData.created_at).toLocaleDateString('ko-KR');
  
  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${title}</title>
    <style>
        body { font-family: 'Malgun Gothic', sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .info { margin-bottom: 20px; }
        .customer { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; font-size: 18px; }
        .footer { margin-top: 30px; text-align: center; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">${title}</div>
        <div>발행일: ${date}</div>
    </div>
    
    <div class="info">
        <strong>발행처:</strong> StocksDoctor<br>
        <strong>문서번호:</strong> ${orderData.id.slice(0, 8)}
    </div>
    
    <div class="customer">
        <strong>고객정보</strong><br>
        고객명: ${orderData.customer_master?.customer_name || ''}<br>
        고객코드: ${orderData.customer_code}<br>
        ${orderData.customer_master?.email ? `이메일: ${orderData.customer_master.email}<br>` : ''}
        ${orderData.customer_master?.phone ? `전화: ${orderData.customer_master.phone}` : ''}
    </div>
    
    <table>
        <thead>
            <tr>
                <th>품목명</th>
                <th>품목코드</th>
                <th>수량</th>
                <th>단가</th>
                <th>할인</th>
                <th>금액</th>
            </tr>
        </thead>
        <tbody>
            ${orderData.order_lines.map((line: any) => `
                <tr>
                    <td>${line.item_master?.sku_name || ''}</td>
                    <td>${line.sku_code}</td>
                    <td>${line.qty} ${line.item_master?.uom || 'EA'}</td>
                    <td>${line.unit_price.toLocaleString()}원</td>
                    <td>${line.discount}%</td>
                    <td>${(line.qty * line.unit_price * (1 - line.discount / 100)).toLocaleString()}원</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="total">
        총 금액: ${orderData.total_amount.toLocaleString()}원
    </div>
    
    ${orderData.raw_text ? `
    <div style="margin-top: 20px;">
        <strong>원본 주문 내용:</strong><br>
        <div style="background: #f9f9f9; padding: 10px; margin-top: 5px;">
            ${orderData.raw_text.replace(/\n/g, '<br>')}
        </div>
    </div>
    ` : ''}
    
    <div class="footer">
        StocksDoctor ERP 연동 솔루션<br>
        이 문서는 자동으로 생성되었습니다.
    </div>
</body>
</html>
  `;
}