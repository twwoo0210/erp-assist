
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
          setStep(4) // ?°ê²° ?„ë£Œ ?¨ê³„ë¡??´ë™
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
        setError('?Œì‚¬ì½”ë“œë¥??…ë ¥?´ì£¼?¸ìš”.')
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!formData.ecountUserId.trim()) {
        setError('Ecount ?¬ìš©?IDë¥??…ë ¥?´ì£¼?¸ìš”.')
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
        setError(error.message || 'Ecount ?°ê²° ?ŒìŠ¤?¸ì— ?¤íŒ¨?ˆìŠµ?ˆë‹¤.')
        return
      }

      if (data.success) {
        setSuccess('Ecount ?°ê²° ?ŒìŠ¤?¸ê? ?±ê³µ?ˆìŠµ?ˆë‹¤!')
        setConnectionData({
          companyCode: formData.companyCode,
          ecountUserId: formData.ecountUserId,
          status: 'connected',
          maskedApiKeySuffix: data.masked_api_key_suffix
        })
        setStep(4)
        
        // ?°ê²° ?•ë³´ ?ˆë¡œê³ ì¹¨
        await loadExistingConnection()
      } else {
        setError(data.message || '?°ê²° ?ŒìŠ¤?¸ì— ?¤íŒ¨?ˆìŠµ?ˆë‹¤.')
      }
    } catch (err: any) {
      setError(err.message || 'Ecount ?°ê²° ?ŒìŠ¤??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Ecount ?°ê²°???´ì œ?˜ì‹œê² ìŠµ?ˆê¹Œ?')) return

    setLoading(true)
    setError('')

    try {
      const { error } = await supabase
        .from('ecount_connections')
        .update({ status: 'disconnected' })
        .eq('user_id', user?.id)

      if (error) {
        setError('?°ê²° ?´ì œ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.')
        return
      }

      setConnectionData(null)
      setFormData({ companyCode: '', ecountUserId: '' })
      setStep(1)
      setSuccess('Ecount ?°ê²°???´ì œ?˜ì—ˆ?µë‹ˆ??')
    } catch (err) {
      setError('?°ê²° ?´ì œ ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ecount ?°ê²° ?¤ì •</h1>
          <p className="mt-2 text-gray-600">
            Ecount ERP ?œìŠ¤?œê³¼ ?°ê²°?˜ì—¬ ì£¼ë¬¸ ?°ì´?°ë? ?™ê¸°?”í•˜?¸ìš”
          </p>
        </div>

        {/* ì§„í–‰ ?¨ê³„ ?œì‹œ */}
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
            {step === 1 && '?Œì‚¬ì½”ë“œ ?…ë ¥'}
            {step === 2 && 'Ecount ?¬ìš©?ID ?…ë ¥'}
            {step === 3 && 'API Key ?•ì¸ ë°??°ê²° ?ŒìŠ¤??}
            {step === 4 && '?°ê²° ?„ë£Œ'}
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

            {/* 1?¨ê³„: ?Œì‚¬ì½”ë“œ ?…ë ¥ */}
            {step === 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  1?¨ê³„: ?Œì‚¬ì½”ë“œ ?…ë ¥
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="companyCode" className="block text-sm font-medium text-gray-700">
                      Ecount ?Œì‚¬ì½”ë“œ
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
                        Ecount ê´€ë¦¬ì?ê²Œ ë¬¸ì˜?˜ì—¬ ?Œì‚¬ì½”ë“œë¥??•ì¸?˜ì„¸??                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2?¨ê³„: Ecount ?¬ìš©?ID ?…ë ¥ */}
            {step === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  2?¨ê³„: Ecount ?¬ìš©?ID ?…ë ¥
                </h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="ecountUserId" className="block text-sm font-medium text-gray-700">
                      Ecount ?¬ìš©?ID
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
                        Ecount ë¡œê·¸?¸ì— ?¬ìš©?˜ëŠ” ?¬ìš©?IDë¥??…ë ¥?˜ì„¸??                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3?¨ê³„: API Key ?•ì¸ ë°??°ê²° ?ŒìŠ¤??*/}
            {step === 3 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  3?¨ê³„: API Key ?•ì¸ ë°??°ê²° ?ŒìŠ¤??                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="ri-information-line text-blue-400"></i>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-blue-800">
                          API Key ë³´ì•ˆ ?ˆë‚´
                        </h4>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            ë³´ì•ˆ???„í•´ API Key???”ë©´???…ë ¥?˜ì? ?ŠìŠµ?ˆë‹¤.<br />
                            ?´ì˜?€???ˆì „???œë²„ ?˜ê²½??ë¯¸ë¦¬ ë³´ê??ˆìŠµ?ˆë‹¤.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">?…ë ¥???•ë³´</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">?Œì‚¬ì½”ë“œ:</span>
                        <span className="font-mono">{formData.companyCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">?¬ìš©?ID:</span>
                        <span className="font-mono">{formData.ecountUserId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">API Key:</span>
                        <span className="text-gray-500">****6306 (?œë²„??ë³´ê???</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4?¨ê³„: ?°ê²° ?„ë£Œ */}
            {step === 4 && connectionData?.status === 'connected' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  4?¨ê³„: ?°ê²° ?„ë£Œ
                </h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <i className="ri-check-circle-line text-green-400"></i>
                      </div>
                      <div className="ml-3">
                        <h4 className="text-sm font-medium text-green-800">
                          Ecount ?°ê²° ?±ê³µ!
                        </h4>
                        <div className="mt-2 text-sm text-green-700">
                          <p>
                            Ecount ERP ?œìŠ¤?œê³¼ ?±ê³µ?ìœ¼ë¡??°ê²°?˜ì—ˆ?µë‹ˆ??<br />
                            ?´ì œ ì£¼ë¬¸ ?°ì´?°ë? ?ë™?¼ë¡œ ?™ê¸°?”í•  ???ˆìŠµ?ˆë‹¤.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">?°ê²° ?•ë³´</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">?íƒœ:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ?°ê²°??                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">?Œì‚¬ì½”ë“œ:</span>
                        <span className="font-mono">{connectionData.companyCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">?¬ìš©?ID:</span>
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
                      AI ì£¼ë¬¸ ?…ë ¥ ?œì‘?˜ê¸°
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      disabled={loading}
                      className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 whitespace-nowrap"
                    >
                      ?°ê²° ?´ì œ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ë²„íŠ¼ ?ì—­ */}
            {step < 4 && (
              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
                  >
                    ?´ì „
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap ${step === 1 ? 'w-full' : 'ml-auto'}`}
                  >
                    ?¤ìŒ
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
                        ?°ê²° ?ŒìŠ¤??ì¤?..
                      </div>
                    ) : (
                      '?°ê²° ?ŒìŠ¤??
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ?„ì?ë§?*/}
        <div className="mt-8 bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              ?„ì?ë§?            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <i className="ri-question-line text-blue-500 mr-2 mt-0.5"></i>
                <div>
                  <strong>?Œì‚¬ì½”ë“œë¥?ëª¨ë¥´ê² ì–´??/strong><br />
                  Ecount ê´€ë¦¬ì ?ëŠ” IT ?´ë‹¹?ì—ê²?ë¬¸ì˜?˜ì—¬ ?Œì‚¬ì½”ë“œë¥??•ì¸?˜ì„¸??
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-question-line text-blue-500 mr-2 mt-0.5"></i>
                <div>
                  <strong>?°ê²° ?ŒìŠ¤?¸ê? ?¤íŒ¨?´ìš”</strong><br />
                  ?Œì‚¬ì½”ë“œ?€ ?¬ìš©?IDê°€ ?•í™•?œì? ?•ì¸?˜ê³ , Ecount ê³„ì •???œì„±?”ë˜???ˆëŠ”ì§€ ?•ì¸?˜ì„¸??
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-shield-check-line text-green-500 mr-2 mt-0.5"></i>
                <div>
                  <strong>ë³´ì•ˆ??ê±±ì •?¼ìš”</strong><br />
                  ëª¨ë“  API Key???”í˜¸?”ë˜???ˆì „???œë²„???€?¥ë˜ë©? ?”ë©´???¸ì¶œ?˜ì? ?ŠìŠµ?ˆë‹¤.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
