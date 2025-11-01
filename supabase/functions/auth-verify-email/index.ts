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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { email, code } = await req.json()

    // 인증 코드 해시
    const codeHash = await hashCode(code)

    // 인증 코드 확인
    const { data: verification, error: verificationError } = await supabaseClient
      .from('email_verifications')
      .select('*')
      .eq('email', email)
      .eq('code_hash', codeHash)
      .is('consumed_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (verificationError || !verification) {
      return new Response(
        JSON.stringify({ error: '유효하지 않거나 만료된 인증 코드입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 인증 코드 소비 처리
    await supabaseClient
      .from('email_verifications')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', verification.id)

    // 사용자 이메일 확인 처리
    await supabaseClient.auth.admin.updateUserById(verification.user_id, {
      email_confirm: true
    })

    // 감사 로그 기록
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: verification.user_id,
        action: 'email_verified',
        target_type: 'user',
        target_id: verification.user_id,
        metadata: { email },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '이메일 인증이 완료되었습니다.' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Email verification error:', error)
    return new Response(
      JSON.stringify({ error: '이메일 인증 중 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// 코드 해시 함수
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}