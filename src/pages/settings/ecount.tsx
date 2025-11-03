
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

  // ë¡œê·¸?¸í•˜ì§€ ?Šì? ê²½ìš° ë¦¬ë‹¤?´ë ‰??  if (!loading && !user) {
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
      setError(err.message || 'Ecount ?°ê²° ?ŒìŠ¤??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.')
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
            ?°ê²°??          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <i className="ri-close-line mr-1"></i>
            ?°ê²° ?¤íŒ¨
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <i className="ri-link-unlink mr-1"></i>
            ?°ê²° ?ˆë¨
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
        {/* ?¤ë” */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ecount ?°ê²° ?¤ì •</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Ecount ERP ?œìŠ¤?œê³¼ ?°ê²°?˜ì—¬ ì£¼ë¬¸ ë°??ë§¤ ?°ì´?°ë? ?™ê¸°?”í•˜?¸ìš”
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                ?€?œë³´?œë¡œ ?Œì•„ê°€ê¸?              </button>
            </div>
          </div>
        </div>

        {/* ?„ì¬ ?°ê²° ?íƒœ */}
        {ecountConnection && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">?„ì¬ ?°ê²° ?íƒœ</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">?íƒœ</label>
                  <div className="mt-1">
                    {getStatusBadge(ecountConnection.status)}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">?Œì‚¬ì½”ë“œ</label>
                  <div className="mt-1 text-sm text-gray-900">{ecountConnection.company_code}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">?¬ìš©??ID</label>
                  <div className="mt-1 text-sm text-gray-900">{ecountConnection.ecount_user_id}</div>
                </div>
              </div>
              {ecountConnection.masked_api_key_suffix && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">API ??/label>
                  <div className="mt-1 text-sm text-gray-600">
                    <i className="ri-shield-check-line mr-1"></i>
                    ?´ì˜?€??Secrets??ë³´ê??ˆìŠµ?ˆë‹¤ (?ìë¦? ****{ecountConnection.masked_api_key_suffix})
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ?°ê²° ?¤ì • ??*/}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Ecount ?°ê²° ë§ˆë²•??/h2>
            <p className="mt-1 text-sm text-gray-600">
              Ecount ERP ?œìŠ¤???°ê²°???„í•œ ?•ë³´ë¥??…ë ¥?˜ê³  ?ŒìŠ¤?¸í•˜?¸ìš”
            </p>
          </div>

          <form onSubmit={handleTestConnection} className="px-6 py-4 space-y-6">
            {/* ?¨ê³„ 1: ?Œì‚¬ì½”ë“œ */}
            <div>
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-medium mr-3">
                  1
                </div>
                <h3 className="text-lg font-medium text-gray-900">?Œì‚¬ì½”ë“œ ?…ë ¥</h3>
              </div>
              <div className="ml-9">
                <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700">
                  ?Œì‚¬ì½”ë“œ
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="companyCode"
                    name="companyCode"
                    value={formData.companyCode}
                    onChange={handleChange}
                    placeholder="?? 669606"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ecount?ì„œ ?œê³µë°›ì? ?Œì‚¬ì½”ë“œë¥??…ë ¥?˜ì„¸??                </p>
              </div>
            </div>

            {/* ?¨ê³„ 2: ?¬ìš©??ID */}
            <div>
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-medium mr-3">
                  2
                </div>
                <h3 className="text-lg font-medium text-gray-900">Ecount ?¬ìš©??ID ?…ë ¥</h3>
              </div>
              <div className="ml-9">
                <label htmlFor="ecountUserId" className="block text-sm font-medium text-gray-700">
                  Ecount ?¬ìš©??ID
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="ecountUserId"
                    name="ecountUserId"
                    value={formData.ecountUserId}
                    onChange={handleChange}
                    placeholder="?? EUNYUL0331"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Ecount ?œìŠ¤?œì— ë¡œê·¸?¸í•  ???¬ìš©?˜ëŠ” ?¬ìš©??IDë¥??…ë ¥?˜ì„¸??                </p>
              </div>
            </div>

            {/* ?¨ê³„ 3: API ???ˆë‚´ */}
            <div>
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-medium mr-3">
                  3
                </div>
                <h3 className="text-lg font-medium text-gray-900">API Key ë³´ê? ?ˆë‚´</h3>
              </div>
              <div className="ml-9">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <i className="ri-information-line text-blue-400 text-lg"></i>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">ë³´ì•ˆ ?•ì±…</h4>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>API ?¤ëŠ” ë³´ì•ˆ???”ë©´???…ë ¥?˜ì? ?ŠìŠµ?ˆë‹¤.</p>
                        <p className="mt-1">?´ì˜?€???ˆì „?˜ê²Œ Secrets??ë³´ê??˜ê³  ?ˆìŠµ?ˆë‹¤.</p>
                        {ecountConnection?.masked_api_key_suffix && (
                          <p className="mt-1 font-medium">
                            ?„ì¬ ?±ë¡???? ****{ecountConnection.masked_api_key_suffix}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ?¤ë¥˜ ë©”ì‹œì§€ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                <div className="flex">
                  <i className="ri-error-warning-line mr-2 mt-0.5"></i>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {/* ?±ê³µ ë©”ì‹œì§€ */}
            {testResult?.success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                <div className="flex">
                  <i className="ri-check-line mr-2 mt-0.5"></i>
                  <div>
                    <p className="font-medium">{testResult.message}</p>
                    <p className="mt-1 text-xs">ì¶”ì  ID: {testResult.trace_id}</p>
                  </div>
                </div>
              </div>
            )}

            {/* ?¨ê³„ 4: ?°ê²° ?ŒìŠ¤??*/}
            <div>
              <div className="flex items-center mb-2">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full text-xs font-medium mr-3">
                  4
                </div>
                <h3 className="text-lg font-medium text-gray-900">?°ê²° ?ŒìŠ¤??/h3>
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
                      ?°ê²° ?ŒìŠ¤??ì¤?..
                    </>
                  ) : (
                    <>
                      <i className="ri-plug-line mr-2"></i>
                      ?°ê²° ?ŒìŠ¤??                    </>
                  )}
                </button>
                <p className="mt-2 text-xs text-gray-500">
                  ?…ë ¥???•ë³´ë¡?Ecount ?œìŠ¤?œì— ?°ê²°???œë„?©ë‹ˆ??                </p>
              </div>
            </div>
          </form>
        </div>

        {/* ?„ì?ë§?*/}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">?„ì?ë§?/h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <i className="ri-question-line mr-2 mt-0.5 text-blue-500"></i>
                <div>
                  <strong>?Œì‚¬ì½”ë“œë¥?ëª¨ë¥´ê² ì–´??/strong>
                  <p>Ecount ê´€ë¦¬ì?ê²Œ ë¬¸ì˜?˜ê±°??Ecount ë¡œê·¸???”ë©´?ì„œ ?•ì¸?????ˆìŠµ?ˆë‹¤.</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-question-line mr-2 mt-0.5 text-blue-500"></i>
                <div>
                  <strong>?°ê²° ?ŒìŠ¤?¸ê? ?¤íŒ¨?´ìš”</strong>
                  <p>?Œì‚¬ì½”ë“œ?€ ?¬ìš©??IDê°€ ?•í™•?œì? ?•ì¸?˜ê³ , Ecount ê³„ì •???œì„±?”ë˜???ˆëŠ”ì§€ ?•ì¸?˜ì„¸??</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-question-line mr-2 mt-0.5 text-blue-500"></i>
                <div>
                  <strong>API ?¤ëŠ” ?´ë–»ê²?ê´€ë¦¬ë˜?˜ìš”?</strong>
                  <p>ë³´ì•ˆ???„í•´ API ?¤ëŠ” ?œë²„???ˆì „???€?¥ì†Œ??ë³´ê??˜ë©°, ?”ë©´???¸ì¶œ?˜ì? ?ŠìŠµ?ˆë‹¤.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
