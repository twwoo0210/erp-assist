
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../utils/supabase'

interface EcountSetupData {
  companyCode: string
  ecountUserId: string
  status: 'disconnected' | 'connected' | 'error'
  maskedApiKeySuffix?: string
}

export default function EcountSetupPage() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    companyCode: '',
    ecountUserId: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [connectionData, setConnectionData] = useState<EcountSetupData | null>(null)
  
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadExistingConnection()
    }
  }, [user])

  const loadExistingConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('ecount_connections')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading connection:', error)
        return
      }

      if (data) {
        setConnectionData(data)
        setFormData({
          companyCode: data.company_code,
          ecountUserId: data.ecount_user_id
        })
        if (data.status === 'connected') {
          setStep(4) // 연결 완료 단계로 이동
        }
      }
    } catch (err) {
      console.error('Error in loadExistingConnection:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleNext = () => {
    setError('')
    
    if (step === 1) {
      if (!formData.companyCode.trim()) {
        setError('회사코드를 입력해주세요.')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.ecountUserId.trim()) {
        setError('Ecount 사용자ID를 입력해주세요.')
        return
      }
      setStep(3)
    }
  }

  const handleTestConnection = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase.functions.invoke('ecount-connection-test', {
        body: {
          company_code: formData.companyCode,
          ecount_user_id: formData.ecountUserId
        }
      })

      if (error) {
        setError(error.message || 'Ecount 연결 테스트에 실패했습니다.')
        return
      }

      if (data.success) {
        setSuccess('Ecount 연결 테스트가 성공했습니다!')
        setConnectionData({
          companyCode: formData.companyCode,
          ecountUserId: formData.ecountUserId,
          status: 'connected',
          maskedApiKeySuffix: data.masked_api_key_suffix
        })
        setStep(4)
        
        // 연결 정보 새로고침
        await loadExistingConnection()
      } else {
        setError(data.message || '연결 테스트에 실패했습니다.')
      }
    } catch (err: any) {
      setError(err.message || 'Ecount 연결 테스트 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Ecount 연결을 해제하시겠습니까?')) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('ecount_connections')
        .update({ status: 'disconnected' })
        .eq('user_id', user?.id)

      if (error) {
        setError('연결 해제 중 오류가 발생했습니다.')
        return
      }

      setConnectionData(null)
      setFormData({ companyCode: '', ecountUserId: '' })
      setStep(1)
      setSuccess('Ecount 연결이 해제되었습니다.')
    } catch (err) {
      setError('연결 해제 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ecount 연결 설정</h1>
          <p className="mt-2 text-gray-600">
            Ecount ERP 시스템과 연결하여 주문 데이터를 동기화하세요
          </p>
        </div>

        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {stepNumber === 4 && connectionData?.status === 'connected' ? (
                      <i className="ri-check-line"></i>
                    ) : (
                      stepNumber
                    )}
                  </div>
                  {stepNumber < 4 && (
                    <div className={`w-8 h-0.5 ${
                      step > stepNumber ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-2 text-center text-xs text-gray-500">
            {step === 1 && '회사코드 입력'}
            {step === 2 && 'Ecount 사용자ID 입력'}
            {step === 3 && 'API Key 확인 및 연결 테스트'}
            {step === 4 && '연결 완료'}
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            {/* 1단계: 회사코드 입력 */}
            {step === 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  1단계: 회사코드 입력
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700">
                      Ecount 회사코드
                    </label>
                    <div className="mt-1">
                      <input
                        id="companyCode"
                        name="companyCode"
                        type="text"
                        value={formData.companyCode}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="예: 669606"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Ecount 관리자에게 문의하여 회사코드를 확인하세요
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2단계: Ecount 사용자ID 입력 */}
            {step === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  2단계: Ecount 사용자ID 입력
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ecountUserId" className="block text-sm font-medium text-gray-700">
                      Ecount 사용자ID
                    </label>
                    <div className="mt-1">
                      <input
                        id="ecountUserId"
                        name="ecountUserId"
                        type="text"
                        value={formData.ecountUserId}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="예: EUNYUL0331"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Ecount 로그인에 사용하는 사용자ID를 입력하세요
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3단계: API Key 확인 및 연결 테스트 */}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  3단계: API Key 확인 및 연결 테스트
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="ri-information-line text-blue-400"></i>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">
                          API Key 보안 안내
                        </h4>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            보안을 위해 API Key는 화면에 입력하지 않습니다.<br />
                            운영팀이 안전한 서버 환경에 미리 보관했습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">입력된 정보</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">회사코드:</span>
                        <span className="font-mono">{formData.companyCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">사용자ID:</span>
                        <span className="font-mono">{formData.ecountUserId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Key:</span>
                        <span className="text-gray-500">****6306 (서버에 보관됨)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4단계: 연결 완료 */}
            {step === 4 && connectionData?.status === 'connected' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  4단계: 연결 완료
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="ri-check-circle-line text-green-400"></i>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800">
                          Ecount 연결 성공!
                        </h4>
                        <div className="mt-2 text-sm text-green-700">
                          <p>
                            Ecount ERP 시스템과 성공적으로 연결되었습니다.<br />
                            이제 주문 데이터를 자동으로 동기화할 수 있습니다.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">연결 정보</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">상태:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          연결됨
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">회사코드:</span>
                        <span className="font-mono">{connectionData.companyCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">사용자ID:</span>
                        <span className="font-mono">{connectionData.ecountUserId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Key:</span>
                        <span className="text-gray-500">****{connectionData.maskedApiKeySuffix}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => window.location.href = '/orders/ai-entry'}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                    >
                      AI 주문 입력 시작하기
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={loading}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 whitespace-nowrap"
                    >
                      연결 해제
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 버튼 영역 */}
            {step < 4 && (
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                  >
                    이전
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${step === 1 ? 'w-full' : 'ml-auto'}`}
                  >
                    다음
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={loading}
                    className="ml-auto px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 whitespace-nowrap"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        연결 테스트 중...
                      </div>
                    ) : (
                      '연결 테스트'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 도움말 */}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              도움말
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <i className="ri-question-line text-blue-500 mr-2 mt-0.5"></i>
                <div>
                  <strong>회사코드를 모르겠어요</strong><br />
                  Ecount 관리자 또는 IT 담당자에게 문의하여 회사코드를 확인하세요.
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-question-line text-blue-500 mr-2 mt-0.5"></i>
                <div>
                  <strong>연결 테스트가 실패해요</strong><br />
                  회사코드와 사용자ID가 정확한지 확인하고, Ecount 계정이 활성화되어 있는지 확인하세요.
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-shield-check-line text-green-500 mr-2 mt-0.5"></i>
                <div>
                  <strong>보안이 걱정돼요</strong><br />
                  모든 API Key는 암호화되어 안전한 서버에 저장되며, 화면에 노출되지 않습니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
