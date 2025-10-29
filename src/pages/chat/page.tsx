
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface Message {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  data?: any;
}

interface ParsedOrder {
  customer_name: string;
  items: Array<{
    item_name: string;
    qty: number;
    matched_item?: {
      code: string;
      name: string;
      price: number;
      unit?: string;
    };
    confidence?: number;
  }>;
}

export default function ChatPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: '안녕하세요! ERP Assist AI입니다. 자연어로 발주 내용을 입력해주세요. 예: "A거래처, 깐쇼새우 100개, 새우볼 50개"',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<ParsedOrder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (type: 'user' | 'ai' | 'system', content: string, data?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString(),
      data
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const callAIParseOrder = async (userInput: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/ai-parse-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ inputText: userInput }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'AI 파싱에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('AI Parse Error:', error);
      throw error;
    }
  };

  const simulateAIProcessing = async (userInput: string) => {
    setIsProcessing(true);
    
    try {
      const parsedOrder = await callAIParseOrder(userInput);
      setCurrentOrder(parsedOrder);
      addMessage('ai', 'AI가 다음과 같이 분석했습니다. 내용을 확인해주세요:', parsedOrder);
    } catch (error: any) {
      addMessage('ai', `오류가 발생했습니다: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userMessage = inputText.trim();
    setInputText('');
    
    addMessage('user', userMessage);
    addMessage('system', 'AI가 주문 내용을 분석하고 있습니다...');
    
    await simulateAIProcessing(userMessage);
  };

  const handleConfirmOrder = async () => {
    if (!currentOrder) return;
    
    setIsProcessing(true);
    addMessage('system', '이카운트 ERP에 전표를 생성하고 있습니다...');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/ecount-create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ orderData: currentOrder }),
      });

      const result = await response.json();

      if (result.success) {
        addMessage('ai', `✅ ${result.message}`);
        setCurrentOrder(null);
      } else {
        addMessage('ai', `❌ ${result.error}`);
      }
    } catch (error: any) {
      addMessage('ai', `❌ 전송 실패: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditItem = (itemIndex: number, field: string, value: any) => {
    if (!currentOrder) return;
    
    const updatedOrder = { ...currentOrder };
    if (field === 'qty') {
      updatedOrder.items[itemIndex].qty = parseInt(value) || 0;
    }
    setCurrentOrder(updatedOrder);
  };

  const renderMessage = (message: Message) => {
    if (message.type === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
            <p>{message.content}</p>
            <p className="text-xs text-blue-100 mt-1">{message.timestamp}</p>
          </div>
        </div>
      );
    }

    if (message.type === 'system') {
      return (
        <div className="flex justify-center mb-4">
          <div className="bg-gray-100 text-gray-600 rounded-lg px-4 py-2 text-sm">
            {message.content}
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-start mb-4">
        <div className="bg-white border rounded-lg px-4 py-2 max-w-xs lg:max-w-2xl shadow-sm">
          <p className="mb-2">{message.content}</p>
          
          {message.data && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-3">주문 내역 확인</h4>
              <div className="mb-3">
                <span className="text-sm text-gray-600">거래처: </span>
                <span className="font-medium">{message.data.customer_name}</span>
              </div>
              
              <div className="space-y-3">
                {message.data.items.map((item: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {item.matched_item?.name || item.item_name}
                      </span>
                      {item.confidence && (
                        <span className="text-xs text-gray-500">
                          매칭도: {Math.round(item.confidence * 100)}%
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">품목코드: </span>
                        <span className="font-mono">{item.matched_item?.code || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">수량: </span>
                        <input
                          type="number"
                          value={item.qty}
                          onChange={(e) => handleEditItem(index, 'qty', e.target.value)}
                          className="w-16 px-1 py-0.5 border border-gray-300 rounded text-center"
                        />
                        <span className="ml-1 text-xs text-gray-500">{item.matched_item?.unit || '개'}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">단가: </span>
                        <span className="font-medium">₩{(item.matched_item?.price || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-2 text-right text-sm font-medium text-blue-600">
                      소계: ₩{((item.matched_item?.price || 0) * item.qty).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="text-right text-lg font-bold text-gray-900">
                  총액: ₩{message.data.items.reduce((total: number, item: any) => 
                    total + (item.matched_item?.price || 0) * item.qty, 0
                  ).toLocaleString()}
                </div>
              </div>
              
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleConfirmOrder}
                  disabled={isProcessing}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {isProcessing ? '처리중...' : '전표 생성'}
                </button>
                <button
                  onClick={() => setCurrentOrder(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                >
                  취소
                </button>
              </div>
            </div>
          )}
          
          <p className="text-xs text-gray-500 mt-2">{message.timestamp}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">AI 전표 입력</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">이카운트 연동됨</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {messages.map((message) => renderMessage(message))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white border-t">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="예: A거래처, 깐쇼새우 100개, 새우볼 50개"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isProcessing}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              {isProcessing ? (
                <i className="ri-loader-4-line animate-spin"></i>
              ) : (
                <i className="ri-send-plane-line"></i>
              )}
            </button>
          </form>
          
          <div className="mt-2 text-xs text-gray-500">
            💡 팁: "거래처명, 품목명 수량" 형식으로 입력하면 더 정확합니다
          </div>
        </div>
      </div>
    </div>
  );
}
