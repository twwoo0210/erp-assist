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

    const { email, password, fullName, department, phone, organizationName, businessNumber, industry, erpSystem, consents } = await req.json()

    // 이메일 중복 확인
    const { data: existingUser } = await supabaseClient.auth.admin.getUserByEmail(email)
    if (existingUser.user) {
      return new Response(
        JSON.stringify({ error: '이미 등록된 이메일입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 사업자등록번호 검증 (제공된 경우)
    if (businessNumber && !validateBusinessNumber(businessNumber)) {
      return new Response(
        JSON.stringify({ error: '유효하지 않은 사업자등록번호입니다.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 사용자 생성
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: false
    })

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = authData.user.id

    // 프로필 생성
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        department,
        phone,
        phone_verified: false,
        two_factor_enabled: false
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // 조직 생성 (제공된 경우)
    let organizationId = null
    if (organizationName) {
      const { data: orgData, error: orgError } = await supabaseClient
        .from('organizations')
        .insert({
          name: organizationName,
          business_number: businessNumber,
          industry,
          erp_system: erpSystem
        })
        .select()
        .single()

      if (orgError) {
        console.error('Organization creation error:', orgError)
      } else {
        organizationId = orgData.id

        // 조직 멤버로 추가 (소유자 권한)
        await supabaseClient
          .from('organization_members')
          .insert({
            organization_id: organizationId,
            user_id: userId,
            role: 'owner',
            department
          })
      }
    }

    // 동의 기록 저장
    if (consents && consents.length > 0) {
      const consentRecords = consents.map(consent => ({
        user_id: userId,
        consent_type: consent.type,
        policy_version: consent.version || '1.0',
        consented: consent.agreed,
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      }))

      await supabaseClient
        .from('user_consents')
        .insert(consentRecords)
    }

    // 이메일 인증 코드 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    const codeHash = await hashCode(verificationCode)

    await supabaseClient
      .from('email_verifications')
      .insert({
        user_id: userId,
        email,
        code_hash: codeHash,
        expires_at: new Date(Date.now() + 3 * 60 * 1000).toISOString() // 3분 후 만료
      })

    // 감사 로그 기록
    await supabaseClient
      .from('audit_logs')
      .insert({
        organization_id: organizationId,
        user_id: userId,
        action: 'user_signup',
        target_type: 'user',
        target_id: userId,
        metadata: { email, organization_name: organizationName },
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        user_agent: req.headers.get('user-agent')
      })

    // TODO: 실제 환경에서는 이메일 발송 서비스 연동
    console.log(`이메일 인증 코드: ${verificationCode}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '회원가입이 완료되었습니다. 이메일 인증을 진행해주세요.',
        verification_code: verificationCode // 개발용, 실제로는 이메일로 발송
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Signup error:', error)
    return new Response(
      JSON.stringify({ error: '회원가입 중 오류가 발생했습니다.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// 사업자등록번호 검증 함수
function validateBusinessNumber(businessNumber: string): boolean {
  const cleanNumber = businessNumber.replace(/[^0-9]/g, '')
  if (cleanNumber.length !== 10) return false

  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5]
  let sum = 0

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanNumber[i]) * weights[i]
  }

  sum += Math.floor((parseInt(cleanNumber[8]) * 5) / 10)
  const checkDigit = (10 - (sum % 10)) % 10

  return checkDigit === parseInt(cleanNumber[9])
}

// 코드 해시 함수
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(code)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}