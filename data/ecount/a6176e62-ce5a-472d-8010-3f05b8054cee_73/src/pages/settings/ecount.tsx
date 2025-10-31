
import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function EcountSettingsPage() {
  const { user, ecountConnection, testEcountConnection, loading } = useAuth()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    companyCode: ecountConnection?.company_code || '',
    ecountUserId: ecountConnection?.ecount_user_id || ''
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [error, setError] = useState('')

  // 로그인하지 않은 경우 리다이렉트
  if (!loading && !user) {
    navigate('/auth/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setTestResult(null)
  }

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault()
    setTesting(true)
    setError('')
    setTestResult(null)

    try {
      const result = await testEcountConnection(formData.companyCode, formData.ecountUserId)
      setTestResult(result)
    } catch (err: any) {
      setError(err.message || 'Ecount 연결 테스트 중 오류가 발생했습니다.')
    } finally {
      setTesting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <i className="ri-check-line mr-1"></i>
            연결됨
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <i className="ri-close-line mr-1"></i>
            연결 실패
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <i className="ri-link-unlink mr-1"></i>
            연결 안됨
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ecount 연결 설정</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Ecount ERP 시스템과 연결하여 주문 및 판매 데이터를 동기화하세요
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                대시보드로 돌아가기
              </button>
            </div>
          </div>
        </div>

        {/* 현재 연결 상태 */}
        {ecountConnection && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">현재 연결 상태</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <div className="mt-1">
                    {getStatusBadge(ecountConnection.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">회사코드</label>
                  <div className="mt-1 text-sm text-gray-900">{ecountConnection.company_code}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">사용자 ID</label>
                  <div className="mt-1 text-sm text-gray-900">{ecountConnection.ecount_user_id}</div>
                </div>
              </div>
              {ecountConnection.masked_api_key_suffix && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">API 키</label>
                  <div className="mt-1 text-sm text-gray-600">
                    <i className="ri-shield-check-line mr-1"></i>
                    운영팀이 Secrets에 보관했습니다 (끝자리: ****{ecountConnection.masked_api_key_suffix})
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 연결 설정 폼 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Ecount 연결 마법사</h2>
            <p className="mt-1 text-sm text-gray-600">
              Ecount ERP 시스템 연결을 위한 정보를 입력하고 테스트하세요
            </p>
          </div>

          <form onSubmit={handleTestConnection} className="px-6 py-4 space-y-6">
            {/* 단계 1: 회사코드 */}
            <div>
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-medium mr-3">
                  1
                </div>
                <h3 className="text-lg font-medium text-gray-900">회사코드 입력</h3>
              </div>
              <div className="ml-9">
                <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700">
                  회사코드
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="companyCode"
                    name="companyCode"
                    value={formData.companyCode}
                    onChange={handleChange}
                    placeholder="예: 669606"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ecount에서 제공받은 회사코드를 입력하세요
                </p>
              </div>
            </div>

            {/* 단계 2: 사용자 ID */}
            <div>
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-medium mr-3">
                  2
                </div>
                <h3 className="text-lg font-medium text-gray-900">Ecount 사용자 ID 입력</h3>
              </div>
              <div className="ml-9">
                <label htmlFor="ecountUserId" className="block text-sm font-medium text-gray-700">
                  Ecount 사용자 ID
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="ecountUserId"
                    name="ecountUserId"
                    value={formData.ecountUserId}
                    onChange={handleChange}
                    placeholder="예: EUNYUL0331"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ecount 시스템에 로그인할 때 사용하는 사용자 ID를 입력하세요
                </p>
              </div>
            </div>

            {/* 단계 3: API 키 안내 */}
            <div>
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-medium mr-3">
                  3
                </div>
                <h3 className="text-lg font-medium text-gray-900">API Key 보관 안내</h3>
              </div>
              <div className="ml-9">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="ri-information-line text-blue-400 text-lg"></i>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">보안 정책</h4>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>API 키는 보안상 화면에 입력하지 않습니다.</p>
                        <p className="mt-1">운영팀이 안전하게 Secrets에 보관하고 있습니다.</p>
                        {ecountConnection?.masked_api_key_suffix && (
                          <p className="mt-1 font-medium">
                            현재 등록된 키: ****{ecountConnection.masked_api_key_suffix}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                <div className="flex">
                  <i className="ri-error-warning-line mr-2 mt-0.5"></i>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {/* 성공 메시지 */}
            {testResult?.success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                <div className="flex">
                  <i className="ri-check-line mr-2 mt-0.5"></i>
                  <div>
                    <p className="font-medium">{testResult.message}</p>
                    <p className="mt-1 text-xs">추적 ID: {testResult.trace_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 단계 4: 연결 테스트 */}
            <div>
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-medium mr-3">
                  4
                </div>
                <h3 className="text-lg font-medium text-gray-900">연결 테스트</h3>
              </div>
              <div className="ml-9">
                <button
                  type="submit"
                  disabled={testing || !formData.companyCode || !formData.ecountUserId}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {testing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      연결 테스트 중...
                    </>
                  ) : (
                    <>
                      <i className="ri-plug-line mr-2"></i>
                      연결 테스트
                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  입력한 정보로 Ecount 시스템에 연결을 시도합니다
                </p>
              </div>
            </div>
          </form>
        </div>

        {/* 도움말 */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">도움말</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <i className="ri-question-line mr-2 mt-0.5 text-blue-500"></i>
                <div>
                  <strong>회사코드를 모르겠어요</strong>
                  <p>Ecount 관리자에게 문의하거나 Ecount 로그인 화면에서 확인할 수 있습니다.</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-question-line mr-2 mt-0.5 text-blue-500"></i>
                <div>
                  <strong>연결 테스트가 실패해요</strong>
                  <p>회사코드와 사용자 ID가 정확한지 확인하고, Ecount 계정이 활성화되어 있는지 확인하세요.</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-question-line mr-2 mt-0.5 text-blue-500"></i>
                <div>
                  <strong>API 키는 어떻게 관리되나요?</strong>
                  <p>보안을 위해 API 키는 서버의 안전한 저장소에 보관되며, 화면에 노출되지 않습니다.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
