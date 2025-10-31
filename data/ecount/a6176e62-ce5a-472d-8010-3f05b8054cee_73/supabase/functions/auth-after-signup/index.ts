import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const { record } = await req.json();
    
    if (!record?.id) {
      return new Response("No user record", { status: 400 });
    }
    
    const { email, id, user_metadata } = record;
    
    // 1) organizations 생성
    const orgName = user_metadata?.company_name || "My Organization";
    const { data: org, error: orgErr } = await supabase
      .from("organizations")
      .insert({ 
        name: orgName, 
        industry: user_metadata?.industry,
        business_number: user_metadata?.business_number,
        created_by: id 
      })
      .select()
      .single();
      
    if (orgErr) {
      console.error("Organization creation error:", orgErr);
      throw orgErr;
    }

    // 2) profiles 생성
    const { error: profErr } = await supabase.from("profiles").insert({
      id,
      email,
      full_name: user_metadata?.full_name || "",
      phone: user_metadata?.phone || null,
      org_id: org.id,
      role: "owner",
      terms_agreed_at: user_metadata?.terms_agreed ? new Date().toISOString() : null,
      marketing_opt_in: !!user_metadata?.marketing_opt_in
    });
    
    if (profErr) {
      console.error("Profile creation error:", profErr);
      throw profErr;
    }

    // 3) ecount_connections 초기 레코드
    const { error: ecountErr } = await supabase.from("ecount_connections").insert({
      org_id: org.id,
      connection_name: "primary",
      status: "inactive"
    });
    
    if (ecountErr) {
      console.error("Ecount connection creation error:", ecountErr);
    }

    // 4) 샘플 데이터 생성 (개발용)
    await createSampleData(org.id);

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    console.error("Auth after signup error:", e);
    return new Response(JSON.stringify({ error: e.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

async function createSampleData(orgId: string) {
  try {
    // 샘플 고객 데이터
    const customers = [
      {
        customer_code: "CUST001",
        customer_name: "A거래처",
        channel: "직판",
        email: "customer1@example.com",
        phone: "02-1234-5678",
        default_price_tier: "A"
      },
      {
        customer_code: "CUST002", 
        customer_name: "B거래처",
        channel: "도매",
        email: "customer2@example.com",
        phone: "02-2345-6789",
        default_price_tier: "B"
      }
    ];

    await supabase.from("customer_master").insert(customers);

    // 샘플 품목 데이터
    const items = [
      {
        sku_code: "ITEM001",
        sku_name: "깐새우",
        uom: "개",
        category: "수산물",
        erp_item_code: "E001",
        active: true,
        synonyms: ["깐세우", "새우", "쉬림프"],
        unit_price: 1500
      },
      {
        sku_code: "ITEM002",
        sku_name: "광어",
        uom: "마리",
        category: "수산물", 
        erp_item_code: "E002",
        active: true,
        synonyms: ["광어회", "넙치"],
        unit_price: 25000
      },
      {
        sku_code: "ITEM003",
        sku_name: "새우볼",
        uom: "개",
        category: "가공식품",
        erp_item_code: "E003", 
        active: true,
        synonyms: ["새우공", "새우완자"],
        unit_price: 800
      }
    ];

    await supabase.from("item_master").insert(items);

    // 동의어 사전 데이터
    const synonyms = [
      { term: "깐세우", sku_code: "ITEM001", confidence: 0.95 },
      { term: "새우", sku_code: "ITEM001", confidence: 0.85 },
      { term: "쉬림프", sku_code: "ITEM001", confidence: 0.80 },
      { term: "광어회", sku_code: "ITEM002", confidence: 0.90 },
      { term: "넙치", sku_code: "ITEM002", confidence: 0.85 },
      { term: "새우공", sku_code: "ITEM003", confidence: 0.90 },
      { term: "새우완자", sku_code: "ITEM003", confidence: 0.85 }
    ];

    await supabase.from("synonym_dict").insert(synonyms);

  } catch (error) {
    console.error("Sample data creation error:", error);
  }
}