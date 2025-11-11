import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'

export default function EcountSettingsPage() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()

  const [ecountConnection, setEcountConnection] = useState<any | null>(null)
  const [formData, setFormData] = useState({ companyCode: '', ecountUserId: '' })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!loading && !user) {
    navigate('/auth/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setTestResult(null)
    setSuccess('')
  }

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.companyCode.trim() || !formData.ecountUserId.trim()) {
      setError('회사코드와 사용자 ID를 모두 입력해주세요.')
      return
    }

    setTesting(true)
    setError('')
    setSuccess('')
    setTestResult(null)
    
    try {
      const token = (await supabase!.auth.getSession()).data.session?.access_token
      
      // ecount-connection-test 함수 사용 (입력값을 받아서 테스트)
      const { data, error: fnError } = await supabase!.functions.invoke('ecount-connection-test', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: { 
          company_code: formData.companyCode.trim(), 
          ecount_user_id: formData.ecountUserId.trim() 
        }
      })
      
      if (fnError) {
        throw fnError
      }

      if (data?.success) {
        setSuccess('Ecount 연결 테스트가 성공했습니다!')
        setTestResult(data)
        
        // 연결 정보 저장 또는 업데이트
        if (profile?.org_id) {
          try {
            const { error: upsertError } = await supabase
              .from('ecount_connections')
              .upsert({
                org_id: profile.org_id,
                connection_name: 'primary',
                company_code: formData.companyCode.trim(),
                ecount_user_id: formData.ecountUserId.trim(),
                status: 'connected',
                updated_at: new Date().toISOString()
              }, {
                onConflict: 'org_id,connection_name'
              })

            if (!upsertError) {
              // 연결 정보 다시 불러오기
              const { data: connData } = await supabase
                .from('ecount_connections')
                .select('*')
                .eq('org_id', profile.org_id)
                .eq('connection_name', 'primary')
                .single()
              
              if (connData) {
                setEcountConnection(connData)
              }
            }
          } catch (saveError) {
            console.error('연결 정보 저장 실패:', saveError)
          }
        }
      } else {
        setError(data?.message || 'Ecount 연결 테스트에 실패했습니다.')
      }
    } catch (err: any) {
      console.error('Ecount 연결 테스트 오류:', err)
      setError(err.message || 'Ecount 연결 테스트 중 오류가 발생했습니다.')
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        if (!profile?.org_id || !supabase) return
        const { data, error } = await supabase
          .from('ecount_connections')
          .select('*')
          .eq('org_id', profile.org_id)
          .eq('connection_name', 'primary')
          .single()
        
        if (!error && data) {
          setEcountConnection(data)
          setFormData({ 
            companyCode: data.company_code || '', 
            ecountUserId: data.ecount_user_id || '' 
          })
        }
      } catch (err) {
        console.error('Ecount 연결 정보 로드 실패:', err)
      }
    })()
  }, [profile?.org_id])

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
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ecount 연결 설정</h1>
                <p className="mt-1 text-sm text-gray-600">Ecount ERP 시스템과 연동하여 주문을 자동으로 처리합니다.</p>
              </div>
              <button onClick={() => navigate('/dashboard')} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <i className="ri-arrow-left-line mr-2"></i>
                대시보드로 돌아가기
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            {ecountConnection && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center mb-2">
                  <i className="ri-check-circle-line text-green-600 mr-2"></i>
                  <span className="text-sm font-medium text-green-800">Ecount 연결됨</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700">회사코드</label>
                    <div className="mt-1 text-sm text-gray-900">{ecountConnection.company_code || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">사용자 ID</label>
                    <div className="mt-1 text-sm text-gray-900">{ecountConnection.ecount_user_id || '-'}</div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700">상태</label>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ecountConnection.status === 'connected' 
                          ? 'bg-green-100 text-green-800' 
                          : ecountConnection.status === 'active'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ecountConnection.status === 'connected' ? '연결됨' : 
                         ecountConnection.status === 'active' ? '활성' : 
                         ecountConnection.status || '알 수 없음'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Ecount 연결 테스트</h2>
            <p className="mt-1 text-sm text-gray-600">회사코드/사용자 ID 입력 후 연결을 테스트합니다.</p>
          </div>
          <form onSubmit={handleTestConnection} className="px-6 py-4 space-y-6">
            <div>
              <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700">회사코드</label>
              <input 
                id="companyCode" 
                name="companyCode" 
                type="text"
                value={formData.companyCode} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="예: 678106"
              />
            </div>
            <div>
              <label htmlFor="ecountUserId" className="block text-sm font-medium text-gray-700">사용자 ID</label>
              <input 
                id="ecountUserId" 
                name="ecountUserId" 
                type="text"
                value={formData.ecountUserId} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                placeholder="예: EYTY_"
              />
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                <div className="flex">
                  <i className="ri-error-warning-line mr-2 mt-0.5"></i>
                  <div>{error}</div>
                </div>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                <div className="flex">
                  <i className="ri-check-circle-line mr-2 mt-0.5"></i>
                  <div>{success}</div>
                </div>
              </div>
            )}
            
            {testResult && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
                <div className="font-medium mb-1">테스트 결과:</div>
                <pre className="text-xs overflow-auto">{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={testing || !formData.companyCode.trim() || !formData.ecountUserId.trim()} 
              className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  테스트 중...
                </>
              ) : (
                <>
                  <i className="ri-link mr-2"></i>
                  연결 테스트
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
