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
    const { raw_text, customer_code } = await req.json();
    
    if (!raw_text) {
      return new Response(
        JSON.stringify({ error: "raw_text is required" }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. 동의어 사전에서 매칭 검색
    const { data: synonyms, error: synonymError } = await supabase
      .from('synonym_dict')
      .select(`
        term,
        sku_code,
        confidence,
        item_master (
          sku_name,
          unit_price,
          uom,
          active
        )
      `)
      .eq('item_master.active', true);

    if (synonymError) {
      throw synonymError;
    }

    // 2. 텍스트에서 품목 추출 및 매칭
    const suggestions = [];
    const text = raw_text.toLowerCase();
    
    for (const synonym of synonyms || []) {
      if (text.includes(synonym.term.toLowerCase())) {
        const existing = suggestions.find(s => s.sku_code === synonym.sku_code);
        
        if (!existing) {
          suggestions.push({
            sku_code: synonym.sku_code,
            sku_name: synonym.item_master?.sku_name || '',
            confidence: synonym.confidence,
            unit_price: synonym.item_master?.unit_price || 0,
            stock_qty: Math.floor(Math.random() * 1000) + 100, // 임시 재고
            uom: synonym.item_master?.uom || 'EA'
          });
        } else if (synonym.confidence > existing.confidence) {
          existing.confidence = synonym.confidence;
        }
      }
    }

    // 3. 신뢰도 순으로 정렬
    suggestions.sort((a, b) => b.confidence - a.confidence);

    // 4. API 로그 저장
    await supabase.from('api_logs').insert({
      fn: 'suggest-items',
      payload_hash: btoa(raw_text).slice(0, 32),
      status: 200,
      response_time_ms: Date.now() % 1000
    });

    return new Response(
      JSON.stringify({ 
        suggestions: suggestions.slice(0, 10) // 상위 10개만 반환
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Suggest items error:', error);
    
    // 에러 로그 저장
    await supabase.from('api_logs').insert({
      fn: 'suggest-items',
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