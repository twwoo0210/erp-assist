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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // 사용자 인증 확인
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: '인증이 필요합니다.' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 사용자의 조직 ID 가져오기
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.organization_id) {
      return new Response(
        JSON.stringify({ error: '조직 정보를 찾을 수 없습니다.' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // URL 파라미터 파싱
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const status = url.searchParams.get('status')
    const offset = (page - 1) * limit

    // 주문 로그 조회
    let query = supabaseClient
      .from('order_logs')
      .select(`
        id,
        raw_input_text,
        parsed_data,
        ecount_response,
        status,
        error_message,
        created_at,
        profiles!inner(full_name, email)
      `)
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('status', status)
    }

    const { data: orderLogs, error: logsError } = await query

    if (logsError) {
      throw new Error(`주문 로그 조회 실패: ${logsError.message}`)
    }

    // 전체 개수 조회
    let countQuery = supabaseClient
      .from('order_logs')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', profile.organization_id)

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      throw new Error(`개수 조회 실패: ${countError.message}`)
    }

    // 통계 정보 조회
    const { data: stats, error: statsError } = await supabaseClient
      .from('order_logs')
      .select('status')
      .eq('organization_id', profile.organization_id)

    if (statsError) {
      throw new Error(`통계 조회 실패: ${statsError.message}`)
    }

    const totalCount = stats?.length || 0
    const successCount = stats?.filter(s => s.status === 'success').length || 0
    const failedCount = stats?.filter(s => s.status === 'failed').length || 0
    const pendingCount = stats?.filter(s => s.status === 'pending').length || 0

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          logs: orderLogs || [],
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          },
          statistics: {
            total: totalCount,
            success: successCount,
            failed: failedCount,
            pending: pendingCount,
            successRate: totalCount > 0 ? Math.round((successCount / totalCount) * 100 * 10) / 10 : 0
          }
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Order logs error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || '주문 로그 조회 중 오류가 발생했습니다.',
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})