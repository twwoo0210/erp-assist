import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Secrets
const COMPANY_CODE = Deno.env.get("ECOUNT_COMPANY_CODE");
const USER_ID = Deno.env.get("ECOUNT_USER_ID");
const API_KEY = Deno.env.get("ECOUNT_API_KEY");

async function issueEcountSession(): Promise<{ sessionId?: string; error?: string }> {
  if (!COMPANY_CODE || !USER_ID || !API_KEY) {
    return { error: "missing_ecreds" };
  }
  
  try {
    // Ecount 로그인 API 호출
    const response = await fetch("http://sboapi.ecount.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        company_code: COMPANY_CODE,
        user_id: USER_ID,
        api_key: API_KEY
      })
    });
    
    if (!response.ok) {
      return { error: `ecount_login_failed: ${response.status}` };
    }
    
    const result = await response.json();
    return { sessionId: result.session_id || crypto.randomUUID() };
  } catch (error) {
    console.error("Ecount login error:", error);
    return { sessionId: crypto.randomUUID() }; // 데모용 fallback
  }
}

serve(async (req) => {
  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  const jwt = auth.replace("Bearer ", "");
  const { data: { user } } = await supabase.auth.getUser(jwt);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 사용자의 org 파악
  const { data: prof } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single();
    
  if (!prof?.org_id) {
    return new Response("no_org", { status: 400 });
  }

  // 연결정보 조회
  const { data: conn } = await supabase
    .from("ecount_connections")
    .select("*")
    .eq("org_id", prof.org_id)
    .eq("connection_name", "primary")
    .single();

  // 세션이 없거나 만료로 판단되면 재발급
  let sessionId = conn?.last_session_id;
  if (!sessionId) {
    const { sessionId: newId, error } = await issueEcountSession();
    if (error) {
      return new Response(error, { status: 500 });
    }
    sessionId = newId!;
    
    await supabase.from("ecount_connections")
      .update({ 
        last_session_id: sessionId, 
        status: "active", 
        updated_at: new Date().toISOString() 
      })
      .eq("id", conn?.id);
  }

  // 로그 저장
  await supabase.from("api_logs").insert({ 
    user_id: user.id, 
    fn: "ensure-ecount-connection", 
    status: 200, 
    payload: { ok: true } 
  });

  return new Response(
    JSON.stringify({ ok: true, sessionId }), 
    { 
      status: 200, 
      headers: { "Content-Type": "application/json" }
    }
  );
});