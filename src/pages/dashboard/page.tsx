import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

export default function DashboardPage() {
  const { user, profile, organization } = useAuth();
  const [kpi, setKpi] = useState({ todayTotal: 0, success: 0, pending: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!supabase) { setLoading(false); return; }
      try {
        setLoading(true);
        setError(null);
        const start = new Date(); start.setHours(0,0,0,0);
        const orgId = (organization as any)?.id || (profile as any)?.organization_id || (profile as any)?.org_id;
        let base = supabase.from('order_logs').select('*', { count: 'exact', head: true }).gte('created_at', start.toISOString());
        if (orgId) base = base.eq('organization_id', orgId);
        const [totRes, sucRes, penRes, failRes] = await Promise.all([
          base,
          base.eq('status','success'),
          base.eq('status','pending'),
          base.eq('status','failed'),
        ]);
        setKpi({ todayTotal: totRes.count||0, success: sucRes.count||0, pending: penRes.count||0, failed: failRes.count||0 });
      } catch (e:any) { setError(e?.message || '지표 로드 중 오류가 발생했습니다.'); } finally { setLoading(false); }
    };
    load();
  }, [user, organization, profile]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ?ㅻ뜑 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-sm text-gray-600">
            ?덈뀞?섏꽭?? {profile?.full_name}?? ?ㅻ뒛??醫뗭? ?섎（ ?섏꽭??
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* ?듦퀎 移대뱶 */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="ri-file-list-3-line text-2xl text-blue-600"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        珥?二쇰Ц
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '-' : kpi.todayTotal}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="ri-check-line text-2xl text-green-600"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        泥섎━ ?꾨즺
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '-' : kpi.success}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="ri-time-line text-2xl text-yellow-600"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        ?湲?以?                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '-' : kpi.pending}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <i className="ri-money-dollar-circle-line text-2xl text-purple-600"></i>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        ?대쾲 ??留ㅼ텧
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {loading ? '-' : kpi.failed}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 鍮좊Ⅸ ?≪뀡 */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                鍮좊Ⅸ ?≪뀡
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Link
                  to="/orders/ai-entry"
                  className="relative group bg-blue-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-600 text-white">
                      <i className="ri-robot-line text-xl"></i>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      AI 二쇰Ц ?낅젰
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      ?먯뿰?대줈 二쇰Ц???낅젰?섍퀬 ?먮룞?쇰줈 泥섎━?섏꽭??                    </p>
                  </div>
                </Link>

                <Link
                  to="/chat"
                  className="relative group bg-green-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-600 text-white">
                      <i className="ri-chat-3-line text-xl"></i>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      梨꾪똿 ?곷떞
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      AI ?댁떆?ㅽ꽩?몄? ??뷀븯硫??낅Т瑜?泥섎━?섏꽭??                    </p>
                  </div>
                </Link>

                <Link
                  to="/settings/ecount"
                  className="relative group bg-purple-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-600 text-white">
                      <i className="ri-link text-xl"></i>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Ecount ?곌껐
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Ecount ?쒖뒪?쒓낵 ?곕룞?섏뿬 ?곗씠?곕? ?숆린?뷀븯?몄슂
                    </p>
                  </div>
                </Link>

                <Link
                  to="/settings/account"
                  className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-gray-600 text-white">
                      <i className="ri-settings-line text-xl"></i>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      怨꾩젙 ?ㅼ젙
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      ?꾨줈?꾧낵 議곗쭅 ?뺣낫瑜?愿由ы븯?몄슂
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* 議곗쭅 ?뺣낫 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                議곗쭅 ?뺣낫
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">회사명</label>
                  <p className="mt-1 text-sm text-gray-900">{organization?.name || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">업종</label>
                  <p className="mt-1 text-sm text-gray-900">{organization?.industry || "미설정"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">권한</label>
                  <p className="mt-1 text-sm text-gray-900">{profile?.role === "owner" ? "소유자" : profile?.role === "admin" ? "관리자" : "멤버"}</p>
                </div>
              </div>
                  <label className="block text-sm font-medium text-gray-700">媛?낆씪</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




