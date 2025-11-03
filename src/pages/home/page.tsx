
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

export default function HomePage() {
  const navigate = useNavigate();
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadFormData, setLeadFormData] = useState({
    company: '',
    name: '',
    phone: '',
    email: '',
    note: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // 라이브 미니데모 상태
  const [demoInput, setDemoInput] = useState('');
  const [demoResults, setDemoResults] = useState<any[]>([]);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);

  useEffect(() => {
    // SEO 메타데이터 설정
    document.title = "자연어로 주문하고, Ecount로 바로 전표 생성 - ERP Assist";
    
    const updateMetaTags = () => {
      // 기존 메타 태그 제거
      const existingMeta = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"]');
      existingMeta.forEach(tag => tag.remove());

      // 새로운 메타 태그 추가
      const metaTags = [
        { name: 'description', content: '품목·단가 자동 조회, 사람 검증 한 번, 전표까지 원클릭. 중소 제조·도소매를 위한 실무형 ERP 어시스턴트. 정식 Ecount Open API 연동으로 안전하고 빠른 업무 자동화를 경험하세요.' },
        { name: 'keywords', content: 'Ecount 연동, 자연어 주문, ERP 자동화, 전표 생성, 품목 매칭, 중소기업 솔루션' },
        { property: 'og:title', content: '자연어로 주문하고, Ecount로 바로 전표 생성 - ERP Assist' },
        { property: 'og:description', content: '품목·단가 자동 조회, 사람 검증 한 번, 전표까지 원클릭. 중소 제조·도소매를 위한 실무형 ERP 어시스턴트' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: '자연어로 주문하고, Ecount로 바로 전표 생성 - ERP Assist' },
        { name: 'twitter:description', content: '품목·단가 자동 조회, 사람 검증 한 번, 전표까지 원클릭. 중소 제조·도소매를 위한 실무형 ERP 어시스턴트' }
      ];

      metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        if (tag.name) meta.setAttribute('name', tag.name);
        if (tag.property) meta.setAttribute('property', tag.property);
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      });

      // Schema.org JSON-LD 추가
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "자연어로 주문하고, Ecount로 바로 전표 생성 - ERP Assist",
          "description": "품목·단가 자동 조회, 사람 검증 한 번, 전표까지 원클릭. 중소 제조·도소매를 위한 실무형 ERP 어시스턴트",
          "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/`,
          "mainEntity": {
            "@type": "SoftwareApplication",
            "name": "ERP Assist",
            "applicationCategory": "BusinessApplication",
            "operatingSystem": "Web Browser"
          }
        });
        document.head.appendChild(script);
      }
    };

    updateMetaTags();
  }, []);

  // 샘플 품목 데이터
  const sampleItems = [
    { code: "F-001", name: "우럭 필렛 1kg", price: 15000, stock: 50, unit: "개", minOrder: 10 },
    { code: "F-002", name: "광어 필렛 500g", price: 12000, stock: 30, unit: "개", minOrder: 5 },
    { code: "F-003", name: "연어 필렛 1kg", price: 25000, stock: 20, unit: "개", minOrder: 5 },
    { code: "S-001", name: "새우볼 500g", price: 8000, stock: 100, unit: "팩", minOrder: 20 },
    { code: "S-002", name: "깐새우 1kg", price: 18000, stock: 40, unit: "kg", minOrder: 10 }
  ];

  // 미니데모 입력 처리
  const handleDemoInput = (value: string) => {
    setDemoInput(value);
    
    if (value.length > 2) {
      // 간단한 키워드 매칭으로 품목 제안
      const keywords = value.toLowerCase().split(/[\s,]+/);
      const matches = sampleItems.filter(item => 
        keywords.some(keyword => 
          item.name.toLowerCase().includes(keyword) || 
          keyword.includes(item.name.toLowerCase().split(' ')[0])
        )
      ).slice(0, 5);
      
      setDemoResults(matches);
    } else {
      setDemoResults([]);
    }
  };

  // 품목 선택
  const handleSelectItem = (item: any) => {
    const existing = selectedItems.find(selected => selected.code === item.code);
    if (!existing) {
      setSelectedItems([...selectedItems, { ...item, qty: 1 }]);
    }
  };

  // 샘플 전표 미리보기
  const handlePreviewOrder = () => {
    if (selectedItems.length > 0) {
      setShowDemoModal(true);
    }
  };

  const handleLeadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLeadFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLeadFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('leads')
        .insert([leadFormData]);

      if (error) throw error;

      setShowToast(true);
      setLeadFormData({
        company: '',
        name: '',
        phone: '',
        email: '',
        note: ''
      });
      setShowLeadForm(false);

      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('제출 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Success Toast */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <i className="ri-check-circle-line text-xl"></i>
            <span>문의가 접수되었습니다. 담당자가 곧 연락드립니다!</span>
          </div>
        </div>
      )}

      {/* Lead Form Modal */}
      {showLeadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">도입 상담 신청</h3>
              <button
                onClick={() => setShowLeadForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <form onSubmit={handleLeadFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회사명 *
                </label>
                <input
                  type="text"
                  name="company"
                  value={leadFormData.company}
                  onChange={handleLeadFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="회사명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  담당자명 *
                </label>
                <input
                  type="text"
                  name="name"
                  value={leadFormData.name}
                  onChange={handleLeadFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="담당자명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처 *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={leadFormData.phone}
                  onChange={handleLeadFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="010-0000-0000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 *
                </label>
                <input
                  type="email"
                  name="email"
                  value={leadFormData.email}
                  onChange={handleLeadFormChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="example@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  간단 요구사항
                </label>
                <textarea
                  name="note"
                  value={leadFormData.note}
                  onChange={handleLeadFormChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                  placeholder="간단한 요구사항을 입력하세요"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer whitespace-nowrap"
              >
                {isSubmitting ? '제출 중...' : '상담 신청'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">샘플 전표 미리보기</h3>
              <button
                onClick={() => setShowDemoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">주문 정보</h4>
                <div className="text-sm text-gray-600">
                  <p>고객: 샘플 거래처</p>
                  <p>주문일: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">품목명</th>
                      <th className="px-3 py-2 text-right">수량</th>
                      <th className="px-3 py-2 text-right">단가</th>
                      <th className="px-3 py-2 text-right">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2 text-right">{item.qty} {item.unit}</td>
                        <td className="px-3 py-2 text-right">{item.price.toLocaleString()}원</td>
                        <td className="px-3 py-2 text-right">{(item.qty * item.price).toLocaleString()}원</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 font-medium">
                    <tr>
                      <td colSpan={3} className="px-3 py-2 text-right">합계</td>
                      <td className="px-3 py-2 text-right">
                        {selectedItems.reduce((sum, item) => sum + (item.qty * item.price), 0).toLocaleString()}원
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <i className="ri-information-line"></i>
                  <span className="font-medium">실제 전표 생성을 하려면 로그인 후 Ecount 연결이 필요합니다.</span>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate('/auth/register')}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  회원가입하고 연결하기
                </button>
                <button
                  onClick={() => navigate('/auth/login')}
                  className="flex-1 border border-blue-600 text-blue-600 py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer whitespace-nowrap"
                >
                  로그인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                자연어로 주문하고,<br />
                <span className="text-blue-600">Ecount로 바로 전표 생성</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                품목·단가 자동 조회, 사람 검증 한 번, 전표까지 원클릭.<br />
                중소 제조·도소매를 위한 실무형 ERP 어시스턴트.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  onClick={() => navigate('/demo')}
                  className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 cursor-pointer whitespace-nowrap transition-colors shadow-lg"
                >
                  무료 데모 체험
                </button>
                <button
                  onClick={() => navigate('/auth/register')}
                  className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 cursor-pointer whitespace-nowrap transition-colors"
                >
                  지금 연결(Ecount)
                </button>
              </div>
              
              {/* 신뢰 요소 배지 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <i className="ri-shield-check-line text-green-600"></i>
                  <span>정식 Ecount Open API 연동 설계</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <i className="ri-lock-line text-green-600"></i>
                  <span>Supabase 보안 저장</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <i className="ri-file-list-line text-green-600"></i>
                  <span>로그로 추적되는 책임성</span>
                </div>
              </div>
            </div>
            
            <div className="lg:text-right">
              <img 
                src="https://readdy.ai/api/search-image?query=Modern%20ERP%20automation%20system%20interface%20showing%20natural%20language%20order%20processing%20with%20Korean%20text%20input%20transforming%20into%20structured%20data%20tables%2C%20clean%20professional%20design%20with%20blue%20and%20white%20color%20scheme%2C%20showing%20order%20flow%20from%20text%20to%20invoice%20generation&width=600&height=400&seq=hero-main&orientation=landscape"
                alt="자연어 주문에서 전표 생성까지의 자동화 과정"
                className="w-full max-w-2xl mx-auto lg:mx-0 lg:ml-auto object-contain rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 문제 인식 섹션 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              아직도 엑셀과 전화로 주문 받고 계신가요?
            </h2>
            <p className="text-lg text-gray-600">
              매일 반복되는 비효율적인 업무에서 벗어나세요
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-red-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">시간 낭비</h3>
              <p className="text-gray-600 text-sm">
                전화로 주문 받고, 엑셀에 정리하고, ERP에 다시 입력하는 
                반복 작업으로 하루 2-3시간 소모
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-orange-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">입력 오류</h3>
              <p className="text-gray-600 text-sm">
                수작업으로 인한 품목명 오타, 수량 실수, 
                단가 누락으로 매월 수십 건의 정정 작업 발생
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-yellow-600 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">비용 증가</h3>
              <p className="text-gray-600 text-sm">
                주문 처리 담당자 인건비, 오류 수정 비용, 
                늦어지는 출고로 인한 고객 불만과 기회비용
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 솔루션 섹션 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ERP Assist가 해결합니다
            </h2>
            <p className="text-lg text-gray-600">
              자연어 입력부터 전표 생성까지, 모든 과정을 자동화
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-chat-3-line text-blue-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">자연어 주문 입력</h3>
                    <p className="text-gray-600">
                      "우럭 필렛 1kg 100개, 내일 출고" 같은 자연스러운 말로 주문을 입력하면 
                      AI가 자동으로 품목과 수량을 인식합니다.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-search-line text-green-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">품목·단가 자동 조회</h3>
                    <p className="text-gray-600">
                      Ecount 마스터 데이터와 연동하여 정확한 품목명, 현재 단가, 
                      재고 현황을 실시간으로 조회하고 매칭합니다.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-file-text-line text-purple-600 text-xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">원클릭 전표 생성</h3>
                    <p className="text-gray-600">
                      검증된 주문 정보로 견적서, 거래명세서를 자동 생성하고 
                      Ecount에 바로 업로드할 수 있는 파일을 제공합니다.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <img 
                src="https://readdy.ai/api/search-image?query=Step%20by%20step%20workflow%20diagram%20showing%20natural%20language%20order%20processing%2C%20item%20matching%2C%20and%20invoice%20generation%20in%20Korean%20business%20environment%2C%20clean%20infographic%20style%20with%20arrows%20and%20icons&width=600&height=500&seq=solution-flow&orientation=portrait"
                alt="ERP Assist 솔루션 워크플로우"
                className="w-full object-contain rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 흐름 다이어그램 */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              3단계로 완성되는 주문 처리
            </h2>
            <p className="text-lg text-gray-600">
              복잡한 과정을 단순하게, 5분 작업을 30초로
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">자연어 입력</h3>
              <p className="text-gray-600 mb-4">
                "A업체 우럭 필렛 100개, 새우볼 50팩 주문"
              </p>
              <div className="bg-white p-4 rounded-lg border">
                <i className="ri-chat-3-line text-blue-600 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">AI가 자동으로 분석</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">품목 매칭</h3>
              <p className="text-gray-600 mb-4">
                Ecount 마스터와 매칭하여 정확한 품목·단가 제시
              </p>
              <div className="bg-white p-4 rounded-lg border">
                <i className="ri-check-double-line text-green-600 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">사람이 최종 검증</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">전표 생성</h3>
              <p className="text-gray-600 mb-4">
                견적서, 거래명세서 자동 생성 및 ERP 업로드
              </p>
              <div className="bg-white p-4 rounded-lg border">
                <i className="ri-file-download-line text-purple-600 text-3xl mb-2"></i>
                <p className="text-sm text-gray-500">원클릭 완료</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 라이브 미니데모 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              지금 바로 체험해보세요
            </h2>
            <p className="text-lg text-gray-600">
              로그인 없이 샘플 데이터로 실제 기능을 체험할 수 있습니다
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 입력창 */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">주문 내용 입력</h3>
                <textarea
                  value={demoInput}
                  onChange={(e) => handleDemoInput(e.target.value)}
                  placeholder="예) '우럭 필렛 1kg 100개, 내일 출고'"
                  className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    입력하시면 자동으로 품목을 제안합니다
                  </p>
                  {selectedItems.length > 0 && (
                    <button
                      onClick={handlePreviewOrder}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      전표 미리보기
                    </button>
                  )}
                </div>
              </div>
              
              {/* 결과 패널 */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">품목 제안 결과</h3>
                {demoResults.length > 0 ? (
                  <div className="space-y-3">
                    {demoResults.map((item, index) => (
                      <div key={index} className="bg-white p-4 rounded-lg border hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500">코드: {item.code}</p>
                          </div>
                          <button
                            onClick={() => handleSelectItem(item)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            선택
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">단가:</span>
                            <span className="ml-1 font-medium">{item.price.toLocaleString()}원</span>
                          </div>
                          <div>
                            <span className="text-gray-500">재고:</span>
                            <span className="ml-1 font-medium">{item.stock} {item.unit}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">최소주문:</span>
                          <span className="ml-1">{item.minOrder} {item.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <i className="ri-search-line text-3xl mb-2"></i>
                    <p>주문 내용을 입력하면 품목을 제안합니다</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* 선택된 품목 */}
            {selectedItems.length > 0 && (
              <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">선택된 품목</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {selectedItems.map((item, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-500">수량: {item.qty} {item.unit}</p>
                      <p className="text-sm text-gray-500">단가: {item.price.toLocaleString()}원</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 고객 사례/효과 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              실제 도입 효과
            </h2>
            <p className="text-lg text-gray-600">
              중소기업들이 경험한 놀라운 변화
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">90%</h3>
              <p className="text-gray-600">주문 처리 시간 단축</p>
              <p className="text-sm text-gray-500 mt-1">5분 → 30초</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">95%</h3>
              <p className="text-gray-600">입력 오류 감소</p>
              <p className="text-sm text-gray-500 mt-1">월 50건 → 2건</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">60%</h3>
              <p className="text-gray-600">업무 비용 절감</p>
              <p className="text-sm text-gray-500 mt-1">인건비 + 오류비용</p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-customer-service-line text-white text-2xl"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">98%</h3>
              <p className="text-gray-600">고객 만족도</p>
              <p className="text-sm text-gray-500 mt-1">빠르고 정확한 처리</p>
            </div>
          </div>
        </div>
      </section>

      {/* 보안/프라이버시 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              안전하고 신뢰할 수 있는 시스템
            </h2>
            <p className="text-lg text-gray-600">
              기업 데이터 보안을 최우선으로 설계된 아키텍처
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-white text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">API 키 보안</h3>
              <p className="text-gray-600 text-sm">
                Ecount API 키는 서버(Edge Functions Secrets)에만 저장되며, 
                클라이언트에서는 절대 접근할 수 없습니다.
              </p>
            </div>
            
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-database-2-line text-white text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">데이터 암호화</h3>
              <p className="text-gray-600 text-sm">
                모든 데이터는 Supabase의 엔터프라이즈급 보안으로 
                암호화되어 저장되고 전송됩니다.
              </p>
            </div>
            
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-list-line text-white text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">완전한 로깅</h3>
              <p className="text-gray-600 text-sm">
                모든 API 호출과 데이터 처리 과정이 로그로 기록되어 
                추적 가능하고 책임감 있는 시스템을 제공합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-gray-600">
              ERP Assist 도입 전 궁금한 점들을 확인하세요
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. Ecount 외에 다른 ERP도 연동 가능한가요?
              </h3>
              <p className="text-gray-600">
                현재는 Ecount Open API를 우선 지원하며, 향후 더존, SAP 등 
                주요 ERP 시스템과의 연동을 순차적으로 확대할 예정입니다.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 기존 Ecount 데이터에 영향을 주나요?
              </h3>
              <p className="text-gray-600">
                ERP Assist는 읽기 전용으로 마스터 데이터를 조회하고, 
                생성된 파일을 수동으로 업로드하는 방식이므로 기존 데이터에 직접적인 영향을 주지 않습니다.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 도입 기간은 얼마나 걸리나요?
              </h3>
              <p className="text-gray-600">
                Ecount API 연결 설정 후 즉시 사용 가능합니다. 
                품목 마스터 동기화와 직원 교육까지 포함하여 보통 1-2일 내에 완료됩니다.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 월 사용료는 얼마인가요?
              </h3>
              <p className="text-gray-600">
                사용자 수와 월 처리 건수에 따라 차등 요금제를 제공합니다. 
                무료 체험 후 상담을 통해 맞춤형 요금을 안내드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            지금 시작하세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            5분 만에 설정하고, 바로 업무 효율을 경험하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/demo')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold cursor-pointer whitespace-nowrap"
            >
              무료 데모 체험
            </button>
            <button 
              onClick={() => setShowLeadForm(true)}
              className="border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-lg font-semibold cursor-pointer whitespace-nowrap"
            >
              도입 상담 신청
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
