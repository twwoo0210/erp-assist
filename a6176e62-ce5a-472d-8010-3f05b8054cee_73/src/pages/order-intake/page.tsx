
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';

interface Customer {
  customer_code: string;
  customer_name: string;
  channel: string;
  email?: string;
  phone?: string;
}

interface ItemSuggestion {
  sku_code: string;
  sku_name: string;
  confidence: number;
  unit_price: number;
  stock_qty: number;
  uom: string;
}

interface OrderLine {
  sku_code: string;
  sku_name: string;
  qty: number;
  unit_price: number;
  discount: number;
  line_total: number;
  uom: string;
}

export default function OrderIntakePage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [rawText, setRawText] = useState('');
  const [suggestions, setSuggestions] = useState<ItemSuggestion[]>([]);
  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customer_master')
        .select('*')
        .eq('active', true)
        .order('customer_name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('고객 목록 로드 실패:', error);
    }
  };

  const suggestItems = async () => {
    if (!rawText.trim() || !selectedCustomer) {
      alert('고객과 주문 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('suggest-items', {
        body: {
          raw_text: rawText,
          customer_code: selectedCustomer
        }
      });

      if (error) throw error;
      setSuggestions(data.suggestions || []);
    } catch (error: any) {
      console.error('품목 제안 실패:', error);
      alert('품목 제안 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addToOrder = (suggestion: ItemSuggestion) => {
    const existingIndex = orderLines.findIndex(line => line.sku_code === suggestion.sku_code);
    
    if (existingIndex >= 0) {
      // 기존 라인 수량 증가
      const newLines = [...orderLines];
      newLines[existingIndex].qty += 1;
      newLines[existingIndex].line_total = newLines[existingIndex].qty * newLines[existingIndex].unit_price * (1 - newLines[existingIndex].discount / 100);
      setOrderLines(newLines);
    } else {
      // 새 라인 추가
      const newLine: OrderLine = {
        sku_code: suggestion.sku_code,
        sku_name: suggestion.sku_name,
        qty: 1,
        unit_price: suggestion.unit_price,
        discount: 0,
        line_total: suggestion.unit_price,
        uom: suggestion.uom
      };
      setOrderLines([...orderLines, newLine]);
    }
  };

  const updateOrderLine = (index: number, field: keyof OrderLine, value: number) => {
    const newLines = [...orderLines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // 라인 합계 재계산
    if (field === 'qty' || field === 'unit_price' || field === 'discount') {
      newLines[index].line_total = newLines[index].qty * newLines[index].unit_price * (1 - newLines[index].discount / 100);
    }
    
    setOrderLines(newLines);
  };

  const removeOrderLine = (index: number) => {
    setOrderLines(orderLines.filter((_, i) => i !== index));
  };

  const getTotalAmount = () => {
    return orderLines.reduce((sum, line) => sum + line.line_total, 0);
  };

  const saveOrder = async () => {
    if (!selectedCustomer || orderLines.length === 0) {
      alert('고객과 주문 라인을 확인해주세요.');
      return;
    }

    setSaving(true);
    try {
      // 주문 헤더 저장
      const { data: orderData, error: orderError } = await supabase
        .from('order_intake')
        .insert({
          user_id: user?.id,
          customer_code: selectedCustomer,
          raw_text: rawText,
          status: 'draft',
          total_amount: getTotalAmount()
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 주문 라인 저장
      const orderLinesData = orderLines.map(line => ({
        order_id: orderData.id,
        sku_code: line.sku_code,
        qty: line.qty,
        unit_price: line.unit_price,
        discount: line.discount
      }));

      const { error: linesError } = await supabase
        .from('order_lines')
        .insert(orderLinesData);

      if (linesError) throw linesError;

      alert('주문이 저장되었습니다.');
      
      // 폼 초기화
      setRawText('');
      setSuggestions([]);
      setOrderLines([]);
      
    } catch (error: any) {
      console.error('주문 저장 실패:', error);
      alert('주문 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">주문 접수</h1>
          <p className="mt-2 text-gray-600">
            자연어로 주문을 입력하면 품목을 자동으로 제안해드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 입력 영역 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">주문 정보 입력</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    고객 선택 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">고객을 선택하세요</option>
                    {customers.map((customer) => (
                      <option key={customer.customer_code} value={customer.customer_code}>
                        {customer.customer_name} ({customer.channel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주문 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="예: A거래처, 깐새우 100개, 광어 50마리"
                  />
                </div>

                <button
                  onClick={suggestItems}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? '분석 중...' : '품목 제안'}
                </button>
              </div>
            </div>

            {/* 품목 제안 결과 */}
            {suggestions.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">품목 제안 결과</h3>
                <div className="space-y-3">
                  {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{suggestion.sku_name}</div>
                        <div className="text-sm text-gray-500">
                          {suggestion.sku_code} | 단가: {suggestion.unit_price.toLocaleString()}원/{suggestion.uom} | 
                          재고: {suggestion.stock_qty}{suggestion.uom} | 
                          유사도: {(suggestion.confidence * 100).toFixed(0)}%
                        </div>
                      </div>
                      <button
                        onClick={() => addToOrder(suggestion)}
                        className="ml-4 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 whitespace-nowrap"
                      >
                        추가
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 주문 확정 영역 */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">주문 확정</h2>
              
              {orderLines.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <i className="ri-shopping-cart-line text-4xl mb-2"></i>
                  <p>선택된 품목이 없습니다.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orderLines.map((line, index) => (
                    <div key={index} className="border border-gray-200 rounded-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-medium text-gray-900">{line.sku_name}</div>
                        <button
                          onClick={() => removeOrderLine(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">수량</label>
                          <input
                            type="number"
                            min="1"
                            value={line.qty}
                            onChange={(e) => updateOrderLine(index, 'qty', parseInt(e.target.value) || 1)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">단가</label>
                          <input
                            type="number"
                            min="0"
                            value={line.unit_price}
                            onChange={(e) => updateOrderLine(index, 'unit_price', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">할인(%)</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={line.discount}
                            onChange={(e) => updateOrderLine(index, 'discount', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-2 text-right text-sm font-medium text-gray-900">
                        소계: {line.line_total.toLocaleString()}원
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>총 금액:</span>
                      <span className="text-blue-600">{getTotalAmount().toLocaleString()}원</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={saveOrder}
                    disabled={saving}
                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 whitespace-nowrap"
                  >
                    {saving ? '저장 중...' : '주문 저장'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
