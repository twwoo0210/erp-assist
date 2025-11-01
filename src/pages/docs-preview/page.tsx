
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

interface OrderData {
  id: string;
  customer_code: string;
  customer_name: string;
  customer_email?: string;
  raw_text: string;
  total_amount: number;
  created_at: string;
  order_lines: Array<{
    sku_code: string;
    sku_name: string;
    qty: number;
    unit_price: number;
    discount: number;
    line_total: number;
    uom: string;
  }>;
}

export default function DocsPreviewPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [emailAddress, setEmailAddress] = useState('');
  const [docType, setDocType] = useState<'quote' | 'invoice'>('quote');
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrderData();
    }
  }, [orderId]);

  const loadOrderData = async () => {
    if (!orderId) return;

    try {
      // 주문 헤더 조회
      const { data: orderData, error: orderError } = await supabase
        .from('order_intake')
        .select(`
          *,
          customer_master (
            customer_name,
            email
          )
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // 주문 라인 조회
      const { data: linesData, error: linesError } = await supabase
        .from('order_lines')
        .select(`
          *,
          item_master (
            sku_name,
            uom
          )
        `)
        .eq('order_id', orderId);

      if (linesError) throw linesError;

      const formattedData: OrderData = {
        id: orderData.id,
        customer_code: orderData.customer_code,
        customer_name: orderData.customer_master?.customer_name || '',
        customer_email: orderData.customer_master?.email,
        raw_text: orderData.raw_text,
        total_amount: orderData.total_amount,
        created_at: orderData.created_at,
        order_lines: linesData.map(line => ({
          sku_code: line.sku_code,
          sku_name: line.item_master?.sku_name || '',
          qty: line.qty,
          unit_price: line.unit_price,
          discount: line.discount,
          line_total: line.qty * line.unit_price * (1 - line.discount / 100),
          uom: line.item_master?.uom || 'EA'
        }))
      };

      setOrderData(formattedData);
      setEmailAddress(formattedData.customer_email || '');
    } catch (error) {
      console.error('주문 데이터 로드 실패:', error);
      alert('주문 데이터를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const generateDocument = async () => {
    if (!orderData) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-docs', {
        body: {
          order_id: orderData.id,
          doc_type: docType
        }
      });

      if (error) throw error;

      // PDF 다운로드
      if (data.pdf_url) {
        window.open(data.pdf_url, '_blank');
      }

      alert('문서가 생성되었습니다.');
    } catch (error: any) {
      console.error('문서 생성 실패:', error);
      alert('문서 생성 중 오류가 발생했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const exportToEcount = async () => {
    if (!orderData) return;

    setExporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('export-ecount', {
        body: {
          order_id: orderData.id
        }
      });

      if (error) throw error;

      // CSV 파일 다운로드
      if (data.download_url) {
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = `ecount_order_${orderData.id}.csv`;
        link.click();
      }

      alert('이카운트 업로드 파일이 생성되었습니다.');
    } catch (error: any) {
      console.error('파일 내보내기 실패:', error);
      alert('파일 내보내기 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const sendEmail = async () => {
    if (!orderData || !emailAddress) {
      alert('이메일 주소를 입력해주세요.');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          order_id: orderData.id,
          to: emailAddress,
          doc_type: docType
        }
      });

      if (error) throw error;

      alert('이메일이 발송되었습니다.');
    } catch (error: any) {
      console.error('이메일 발송 실패:', error);
      alert('이메일 발송 중 오류가 발생했습니다.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">주문 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-file-search-line text-6xl text-gray-400 mb-4"></i>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">주문을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-4">요청하신 주문 데이터가 존재하지 않습니다.</p>
          <Link
            to="/order-intake"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 whitespace-nowrap"
          >
            주문 접수로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">문서 미리보기</h1>
              <p className="mt-2 text-gray-600">
                주문 #{orderData.id.slice(0, 8)}... - {orderData.customer_name}
              </p>
            </div>
            <Link
              to="/order-intake"
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 whitespace-nowrap"
            >
              <i className="ri-arrow-left-line mr-2"></i>
              주문 접수로
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 주문 미리보기 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="border-b pb-4 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {docType === 'quote' ? '견적서' : '거래명세서'}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      발행일: {new Date(orderData.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      StocksDoctor
                    </div>
                    <div className="text-sm text-gray-500">
                      ERP 연동 솔루션
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">고객 정보</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">고객명:</span>
                      <div className="font-medium">{orderData.customer_name}</div>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">고객코드:</span>
                      <div className="font-medium">{orderData.customer_code}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">주문 내역</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-left">품목명</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">수량</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">단가</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">할인</th>
                        <th className="border border-gray-300 px-4 py-2 text-right">금액</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderData.order_lines.map((line, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 px-4 py-2">
                            <div className="font-medium">{line.sku_name}</div>
                            <div className="text-sm text-gray-500">{line.sku_code}</div>
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {line.qty} {line.uom}
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right">
                            {line.unit_price.toLocaleString()}원
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-center">
                            {line.discount}%
                          </td>
                          <td className="border border-gray-300 px-4 py-2 text-right font-medium">
                            {line.line_total.toLocaleString()}원
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={4} className="border border-gray-300 px-4 py-2 text-right font-bold">
                          총 금액:
                        </td>
                        <td className="border border-gray-300 px-4 py-2 text-right font-bold text-blue-600">
                          {orderData.total_amount.toLocaleString()}원
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {orderData.raw_text && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">원본 주문 내용</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700">
                      {orderData.raw_text}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 액션 패널 */}
          <div className="space-y-6">
            {/* 문서 타입 선택 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">문서 타입</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="docType"
                    value="quote"
                    checked={docType === 'quote'}
                    onChange={(e) => setDocType(e.target.value as 'quote' | 'invoice')}
                    className="mr-2"
                  />
                  견적서
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="docType"
                    value="invoice"
                    checked={docType === 'invoice'}
                    onChange={(e) => setDocType(e.target.value as 'quote' | 'invoice')}
                    className="mr-2"
                  />
                  거래명세서
                </label>
              </div>
            </div>

            {/* 문서 생성 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">문서 생성</h3>
              <button
                onClick={generateDocument}
                disabled={generating}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 whitespace-nowrap"
              >
                {generating ? '생성 중...' : 'PDF 생성 및 다운로드'}
              </button>
            </div>

            {/* ERP 내보내기 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ERP 연동</h3>
              <button
                onClick={exportToEcount}
                disabled={exporting}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 whitespace-nowrap"
              >
                {exporting ? '생성 중...' : '이카운트 업로드 파일 생성'}
              </button>
            </div>

            {/* 이메일 발송 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">이메일 발송</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    받는 사람
                  </label>
                  <input
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="이메일 주소"
                  />
                </div>
                <button
                  onClick={sendEmail}
                  disabled={sending || !emailAddress}
                  className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 whitespace-nowrap"
                >
                  {sending ? '발송 중...' : '이메일 발송'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
