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

  if (!loading && !user) {
    navigate('/auth/login')
    return null
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setTestResult(null)
  }

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault()
    setTesting(true)
    setError('')
    setTestResult(null)
    try {
      const token = (await supabase!.auth.getSession()).data.session?.access_token
      const { data, error: fnError } = await supabase!.functions.invoke('ensure-ecount-connection', {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: { companyCode: formData.companyCode, ecountUserId: formData.ecountUserId }
      })
      if (fnError) throw fnError
      setTestResult(data)
    } catch (err: any) {
      setError(err.message || 'Ecount 연결 테스트 중 오류가 발생했습니다.')
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    (async () => {
      try {
        if (!profile?.org_id || !supabase) return
        const { data } = await supabase
          .from('ecount_connections')
          .select('*')
          .eq('org_id', profile.org_id)
          .eq('connection_name', 'primary')
          .single()
        setEcountConnection(data)
        if (data) setFormData({ companyCode: data.company_code || '', ecountUserId: data.ecount_user_id || '' })
      } catch {}
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
                <p className="mt-1 text-sm text-gray-600">Ecount ERP 서비스와 연결을 설정합니다.</p>
              </div>
              <button onClick={() => navigate('/dashboard')} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <i className="ri-arrow-left-line mr-2"></i>
                대시보드로 돌아가기
              </button>
            </div>
          </div>
          <div className="px-6 py-4">
            {ecountConnection && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">회사코드</label>
                  <div className="mt-1 text-sm text-gray-900">{ecountConnection.company_code || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">사용자 ID</label>
                  <div className="mt-1 text-sm text-gray-900">{ecountConnection.ecount_user_id || '-'}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">상태</label>
                  <div className="mt-1 text-sm text-gray-900">{ecountConnection.status || 'unknown'}</div>
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
              <input id="companyCode" name="companyCode" value={formData.companyCode} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="ecountUserId" className="block text-sm font-medium text-gray-700">사용자 ID</label>
              <input id="ecountUserId" name="ecountUserId" value={formData.ecountUserId} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {testResult && <div className="text-sm text-green-700">테스트 완료: {JSON.stringify(testResult)}</div>}
            <button type="submit" disabled={testing} className="inline-flex items-center px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400">
              {testing ? '테스트 중…' : '연결 테스트'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
