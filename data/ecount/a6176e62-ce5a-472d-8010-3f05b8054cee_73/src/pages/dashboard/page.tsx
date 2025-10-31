import { useAuth } from '../../hooks/useAuth';

export default function DashboardPage() {
  const { user, profile, organization } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-1 text-sm text-gray-600">
            안녕하세요, {profile?.full_name}님! 오늘도 좋은 하루 되세요.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 통계 카드 */}
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
                        총 주문
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        24
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
                        처리 완료
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        18
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
                        대기 중
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        6
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
                        이번 달 매출
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        ₩12,450,000
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                빠른 액션
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <a
                  href="/orders/ai-entry"
                  className="relative group bg-blue-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-600 text-white">
                      <i className="ri-robot-line text-xl"></i>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      AI 주문 입력
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      자연어로 주문을 입력하고 자동으로 처리하세요
                    </p>
                  </div>
                </a>

                <a
                  href="/chat"
                  className="relative group bg-green-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-green-500 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-600 text-white">
                      <i className="ri-chat-3-line text-xl"></i>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      채팅 상담
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      AI 어시스턴트와 대화하며 업무를 처리하세요
                    </p>
                  </div>
                </a>

                <a
                  href="/settings/ecount"
                  className="relative group bg-purple-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-purple-500 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-600 text-white">
                      <i className="ri-link text-xl"></i>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Ecount 연결
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Ecount 시스템과 연동하여 데이터를 동기화하세요
                    </p>
                  </div>
                </a>

                <a
                  href="/settings/account"
                  className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-gray-500 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-gray-600 text-white">
                      <i className="ri-settings-line text-xl"></i>
                    </span>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      계정 설정
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      프로필과 조직 정보를 관리하세요
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* 조직 정보 */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                조직 정보
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">회사명</label>
                  <p className="mt-1 text-sm text-gray-900">{organization?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">업종</label>
                  <p className="mt-1 text-sm text-gray-900">{organization?.industry || '미설정'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">내 권한</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {profile?.role === 'owner' ? '소유자' : 
                     profile?.role === 'admin' ? '관리자' : '멤버'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">가입일</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {organization?.created_at ? new Date(organization.created_at).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}