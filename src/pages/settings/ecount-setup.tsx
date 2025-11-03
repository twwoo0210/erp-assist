
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
          setStep(4) // ?곌껐 ?꾨즺 ?④퀎濡??대룞
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
        setError('?뚯궗肄붾뱶瑜??낅젰?댁＜?몄슂.')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.ecountUserId.trim()) {
        setError('Ecount ?ъ슜?륤D瑜??낅젰?댁＜?몄슂.')
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
        setError(error.message || 'Ecount ?곌껐 ?뚯뒪?몄뿉 ?ㅽ뙣?덉뒿?덈떎.')
        return
      }

      if (data.success) {
        setSuccess('Ecount ?곌껐 ?뚯뒪?멸? ?깃났?덉뒿?덈떎!')
        setConnectionData({
          companyCode: formData.companyCode,
          ecountUserId: formData.ecountUserId,
          status: 'connected',
          maskedApiKeySuffix: data.masked_api_key_suffix
        })
        setStep(4)
        
        // ?곌껐 ?뺣낫 ?덈줈怨좎묠
        await loadExistingConnection()
      } else {
        setError(data.message || '?곌껐 ?뚯뒪?몄뿉 ?ㅽ뙣?덉뒿?덈떎.')
      }
    } catch (err: any) {
      setError(err.message || 'Ecount ?곌껐 ?뚯뒪??以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Ecount ?곌껐???댁젣?섏떆寃좎뒿?덇퉴?')) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('ecount_connections')
        .update({ status: 'disconnected' })
        .eq('user_id', user?.id)

      if (error) {
        setError('?곌껐 ?댁젣 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.')
        return
      }

      setConnectionData(null)
      setFormData({ companyCode: '', ecountUserId: '' })
      setStep(1)
      setSuccess('Ecount ?곌껐???댁젣?섏뿀?듬땲??')
    } catch (err) {
      setError('?곌껐 ?댁젣 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ecount ?곌껐 ?ㅼ젙</h1>
          <p className="mt-2 text-gray-600">
            Ecount ERP ?쒖뒪?쒓낵 ?곌껐?섏뿬 二쇰Ц ?곗씠?곕? ?숆린?뷀븯?몄슂
          </p>
        </div>

        {/* 吏꾪뻾 ?④퀎 ?쒖떆 */}
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
            {step === 1 && 'Enter company code'}
            {step === 2 && 'Enter Ecount User ID'}
            {step === 3 && 'Check API Key & Test Connection'}
            {step === 4 && 'Connected'}
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

            {/* 1?④퀎: ?뚯궗肄붾뱶 ?낅젰 */}
            {step === 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  1?④퀎: ?뚯궗肄붾뱶 ?낅젰
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700">
                      Ecount ?뚯궗肄붾뱶
                    </label>
                    <div className="mt-1">
                      <input
                        id="companyCode"
                        name="companyCode"
                        type="text"
                        value={formData.companyCode}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="?? 669606"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Ecount 愿由ъ옄?먭쾶 臾몄쓽?섏뿬 ?뚯궗肄붾뱶瑜??뺤씤?섏꽭??                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2?④퀎: Ecount ?ъ슜?륤D ?낅젰 */}
            {step === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  2?④퀎: Ecount ?ъ슜?륤D ?낅젰
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ecountUserId" className="block text-sm font-medium text-gray-700">
                      Ecount ?ъ슜?륤D
                    </label>
                    <div className="mt-1">
                      <input
                        id="ecountUserId"
                        name="ecountUserId"
                        type="text"
                        value={formData.ecountUserId}
                        onChange={handleChange}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="?? EUNYUL0331"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Ecount 濡쒓렇?몄뿉 ?ъ슜?섎뒗 ?ъ슜?륤D瑜??낅젰?섏꽭??                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3?④퀎: API Key ?뺤씤 諛??곌껐 ?뚯뒪??*/}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  3?④퀎: API Key ?뺤씤 諛??곌껐 ?뚯뒪??                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="ri-information-line text-blue-400"></i>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">
                          API Key 蹂댁븞 ?덈궡
                        </h4>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            蹂댁븞???꾪빐 API Key???붾㈃???낅젰?섏? ?딆뒿?덈떎.<br />
                            ?댁쁺????덉쟾???쒕쾭 ?섍꼍??誘몃━ 蹂닿??덉뒿?덈떎.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">?낅젰???뺣낫</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">?뚯궗肄붾뱶:</span>
                        <span className="font-mono">{formData.companyCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">?ъ슜?륤D:</span>
                        <span className="font-mono">{formData.ecountUserId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Key:</span>
                        <span className="text-gray-500">****6306 (?쒕쾭??蹂닿???</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4?④퀎: ?곌껐 ?꾨즺 */}
            {step === 4 && connectionData?.status === 'connected' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  4?④퀎: ?곌껐 ?꾨즺
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="ri-check-circle-line text-green-400"></i>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800">
                          Ecount ?곌껐 ?깃났!
                        </h4>
                        <div className="mt-2 text-sm text-green-700">
                          <p>
                            Ecount ERP ?쒖뒪?쒓낵 ?깃났?곸쑝濡??곌껐?섏뿀?듬땲??<br />
                            ?댁젣 二쇰Ц ?곗씠?곕? ?먮룞?쇰줈 ?숆린?뷀븷 ???덉뒿?덈떎.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">?곌껐 ?뺣낫</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">?곹깭:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ?곌껐??                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">?뚯궗肄붾뱶:</span>
                        <span className="font-mono">{connectionData.companyCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">?ъ슜?륤D:</span>
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
                      onClick={() => (() => { try { const base = (typeof __BASE_PATH__ !== 'undefined' ? __BASE_PATH__ : '/'); const nb = base.endsWith('/') ? base : base + '/'; window.location.replace(window.location.origin + nb + 'orders/ai-entry'); } catch { window.location.href = ''; } })()}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                    >
                      AI 二쇰Ц ?낅젰 ?쒖옉?섍린
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={loading}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 whitespace-nowrap"
                    >
                      ?곌껐 ?댁젣
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 踰꾪듉 ?곸뿭 */}
            {step < 4 && (
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                  >
                    ?댁쟾
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${step === 1 ? 'w-full' : 'ml-auto'}`}
                  >
                    Next
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
                        Testing connection...
                      </div>
                    ) : (
                        <span>Test Connection</span>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ?꾩?留?*/}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ?꾩?留?            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <i className="ri-question-line text-blue-500 mr-2 mt-0.5"></i>
                <div>
                  <strong>Don't know your company code?</strong><br />
                  Ecount 愿由ъ옄 ?먮뒗 IT ?대떦?먯뿉寃?臾몄쓽?섏뿬 ?뚯궗肄붾뱶瑜??뺤씤?섏꽭??
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-question-line text-blue-500 mr-2 mt-0.5"></i>
                <div>
                  <strong>?곌껐 ?뚯뒪?멸? ?ㅽ뙣?댁슂</strong><br />
                  ?뚯궗肄붾뱶? ?ъ슜?륤D媛 ?뺥솗?쒖? ?뺤씤?섍퀬, Ecount 怨꾩젙???쒖꽦?붾릺???덈뒗吏 ?뺤씤?섏꽭??
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-shield-check-line text-green-500 mr-2 mt-0.5"></i>
                <div>
                  <strong>蹂댁븞??嫄깆젙?쇱슂</strong><br />
                  紐⑤뱺 API Key???뷀샇?붾릺???덉쟾???쒕쾭????λ릺硫? ?붾㈃???몄텧?섏? ?딆뒿?덈떎.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
