
import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../utils/supabase'
import { api, APIError } from '../../utils/api'

interface OrderItem {
  code: string
  name: string
  quantity: number
  price: number
  unit: string
  note?: string
}

interface ParsedOrder {
  customer: string
  items: OrderItem[]
  note?: string
}

export default function AIOrderEntryPage() {
  const { user, profile, loading } = useAuth()
  const navigate = useNavigate()
  
  const [inputText, setInputText] = useState('')
  const [parsedOrder, setParsedOrder] = useState<ParsedOrder | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [processing, setProcessing] = useState(false)
  const [searching, setSearching] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [ecountConnection, setEcountConnection] = useState<any | null>(null)
  const [checkingConnection, setCheckingConnection] = useState(true)

  // Ecount 연결 상태 확인
  useEffect(() => {
    const checkEcountConnection = async () => {
      if (!user || !profile?.org_id || !supabase) {
        setCheckingConnection(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from('ecount_connections')
          .select('*')
          .eq('org_id', profile.org_id)
          .eq('connection_name', 'primary')
          .single()

        if (!error && data) {
          setEcountConnection(data)
        } else {
          setEcountConnection(null)
        }
      } catch (err) {
        console.error('Ecount 연결 확인 실패:', err)
        setEcountConnection(null)
      } finally {
        setCheckingConnection(false)
      }
    }

    if (!loading && user) {
      checkEcountConnection()
    }
  }, [user, profile?.org_id, loading])

  // 로그인하지 않은 경우 리다이렉트
  if (!loading && !user) {
    navigate('/auth/login')
    return null
  }

  // Ecount 연결이 안된 경우 안내
  if (!loading && !checkingConnection && ecountConnection?.status !== 'connected') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6 text-center">
          <i className="ri-link-unlink text-4xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Ecount 연결 필요</h2>
          <p className="text-gray-600 mb-4">
            AI 주문 입력을 사용하려면 먼저 Ecount 시스템과 연결해야 합니다.
            <br />
            <span className="text-sm text-gray-500 mt-2 block">
              설정 페이지에서 Ecount 연결을 완료해주세요.
            </span>
          </p>
          <button
            onClick={() => navigate('/settings/ecount')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-nowrap"
          >
            <i className="ri-settings-line mr-2"></i>
            Ecount 연결 설정으로 이동
          </button>
        </div>
      </div>
    )
  }

  const handleParseOrder = async () => {
    if (!inputText.trim()) return

    setProcessing(true)
    setError('')
    setParsedOrder(null)
    setOrderItems([])

    try {
      console.log('Calling API with input:', inputText.trim())
      const data = await api.parseOrder(inputText.trim())
      
      console.log('Parsed order data:', data)
      console.log('Data structure:', {
        customer: data?.customer,
        itemsCount: data?.items?.length,
        items: data?.items
      })
      
      if (!data) {
        throw new Error('AI 응답이 비어있습니다.')
      }

      if (!data.customer) {
        console.warn('Customer is missing, setting to "미지정"')
        data.customer = '미지정'
      }

      if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('AI가 주문 품목을 분석하지 못했습니다. 입력 내용을 확인해주세요.')
      }

      // 품목 데이터 검증 및 정리
      const validatedItems = data.items.map((item: any, index: number) => {
        console.log(`Item ${index}:`, item)
        return {
          code: item.code || '',
          name: item.name || `품목 ${index + 1}`,
          quantity: Number(item.quantity) || 0,
          price: Number(item.price) || 0,
          unit: item.unit || '개',
          note: item.note
        }
      })

      console.log('Validated items:', validatedItems)
      
      setParsedOrder({
        customer: data.customer,
        items: validatedItems
      })
      setOrderItems(validatedItems)
    } catch (err: any) {
      console.error('Parse order error:', err)
      console.error('Error details:', {
        message: err.message,
        stack: err.stack,
        details: err.details
      })
      setError(err.message || 'AI 주문 분석 중 오류가 발생했습니다.')
    } finally {
      setProcessing(false)
    }
  }

  const handleSearchItems = async () => {
    if (!parsedOrder?.items?.length) return

    setSearching(true)
    setError('')

    try {
      const updatedItems = []

      for (const item of parsedOrder.items) {
        try {
          const { data, error } = await supabase.functions.invoke('ecount-items-search', {
            body: { keyword: item.name }
          })

          if (error) throw error

          if (data.items && data.items.length > 0) {
            const foundItem = data.items[0]
            updatedItems.push({
              ...item,
              code: foundItem.code,
              price: foundItem.price || item.price,
              unit: foundItem.unit || item.unit
            })
          } else {
            updatedItems.push(item)
          }
        } catch (err) {
          console.error(`Error searching item ${item.name}:`, err)
          updatedItems.push(item)
        }
      }

      setOrderItems(updatedItems)
    } catch (err: any) {
      setError(err.message || '품목 검색 중 오류가 발생했습니다.')
    } finally {
      setSearching(false)
    }
  }

  const handleItemChange = (index: number, field: keyof OrderItem, value: string | number) => {
    const updated = [...orderItems]
    updated[index] = { ...updated[index], [field]: value }
    setOrderItems(updated)
  }

  const handleCreateSale = async () => {
    if (!parsedOrder?.customer || !orderItems.length) return

    setCreating(true)
    setError('')
    setSuccess('')

    try {
      const { data, error } = await supabase.functions.invoke('ecount-sales-create', {
        body: {
          customer: { name: parsedOrder.customer },
          items: orderItems,
          type: 'sale'
        }
      })

      if (error) throw error

      setSuccess(`전표가 성공적으로 생성되었습니다. 전표번호: ${data.slip_no} (추적ID: ${data.trace_id})`)
      
      // 폼 초기화
      setInputText('')
      setParsedOrder(null)
      setOrderItems([])
    } catch (err: any) {
      setError(err.message || '전표 생성 중 오류가 발생했습니다.')
    } finally {
      setCreating(false)
    }
  }

  if (loading || checkingConnection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI 주문 입력</h1>
                <p className="mt-1 text-sm text-gray-600">
                  자연어로 주문 내용을 입력하면 AI가 분석하여 Ecount 전표를 생성합니다
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

        {/* 입력 영역 */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">주문 내용 입력</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="orderInput" className="block text-sm font-medium text-gray-700">
                  주문 내용
                </label>
                <div className="mt-1">
                  <textarea
                    id="orderInput"
                    rows={4}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="예: A거래처, 깐소새우 96개, 새우볼 50개"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  거래처명과 품목, 수량을 자연어로 입력하세요
                </p>
              </div>
              <div>
                <button
                  onClick={handleParseOrder}
                  disabled={processing || !inputText.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      AI 분석 중...
                    </>
                  ) : (
                    <>
                      <i className="ri-ai-generate mr-2"></i>
                      AI로 주문 분석
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 분석 결과 */}
        {parsedOrder && (
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">분석 결과</h2>
                <button
                  onClick={handleSearchItems}
                  disabled={searching}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap"
                >
                  {searching ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-700 mr-1"></div>
                      품목 검색 중...
                    </>
                  ) : (
                    <>
                      <i className="ri-search-line mr-1"></i>
                      품목·단가 자동 채우기
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">거래처</label>
                <div className="mt-1 text-lg font-semibold text-gray-900">
                  {parsedOrder.customer || '미지정'}
                </div>
              </div>

              {/* 품목 목록 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">주문 품목</label>
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-3 p-4 border border-gray-200 rounded-md">
                      <div>
                        <label className="block text-xs font-medium text-gray-700">품목코드</label>
                        <input
                          type="text"
                          value={item.code || ''}
                          onChange={(e) => handleItemChange(index, 'code', e.target.value)}
                          className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="품목코드"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">품목명</label>
                        <input
                          type="text"
                          value={item.name || ''}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="품목명"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">수량</label>
                        <input
                          type="number"
                          value={item.quantity || 0}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                          className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="수량"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">단가</label>
                        <input
                          type="number"
                          value={item.price || 0}
                          onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)}
                          className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="단가"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">단위</label>
                        <input
                          type="text"
                          value={item.unit || ''}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="mt-1 block w-full text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="단위"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700">금액</label>
                        <div className="mt-1 text-sm font-medium text-gray-900 py-2">
                          {((item.quantity || 0) * (item.price || 0)).toLocaleString()}원
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 총액 */}
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-gray-900">총 주문 금액</span>
                    <span className="text-xl font-bold text-blue-600">
                      {orderItems.reduce((sum, item) => sum + ((item.quantity || 0) * (item.price || 0)), 0).toLocaleString()}원
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 오류/성공 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
            <div className="flex">
              <i className="ri-error-warning-line mr-2 mt-0.5"></i>
              <div>{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm mb-6">
            <div className="flex">
              <i className="ri-check-line mr-2 mt-0.5"></i>
              <div>{success}</div>
            </div>
          </div>
        )}

        {/* 전표 생성 */}
        {parsedOrder && orderItems.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">전표 생성</h2>
                  <p className="text-sm text-gray-600">
                    확인 후 Ecount 시스템에 판매 전표를 생성합니다
                  </p>
                </div>
                <button
                  onClick={handleCreateSale}
                  disabled={creating}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      전표 생성 중...
                    </>
                  ) : (
                    <>
                      <i className="ri-file-add-line mr-2"></i>
                      전표 생성
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 사용 예시 */}
        <div className="mt-6 bg-white shadow rounded-lg">
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">사용 예시</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <i className="ri-chat-quote-line mr-2 mt-0.5 text-blue-500"></i>
                <div>
                  <strong>"A거래처, 깐소새우 96개, 새우볼 50개"</strong>
                  <p>→ 거래처: A거래처, 품목: 깐소새우(96개), 새우볼(50개)</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-chat-quote-line mr-2 mt-0.5 text-blue-500"></i>
                <div>
                  <strong>"삼성전자에 모니터 10대, 키보드 20개 납품"</strong>
                  <p>→ 거래처: 삼성전자, 품목: 모니터(10대), 키보드(20개)</p>
                </div>
              </div>
              <div className="flex items-start">
                <i className="ri-lightbulb-line mr-2 mt-0.5 text-yellow-500"></i>
                <div>
                  <strong>팁:</strong> 거래처명과 품목명, 수량을 명확히 구분하여 입력하면 더 정확한 분석이 가능합니다.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
