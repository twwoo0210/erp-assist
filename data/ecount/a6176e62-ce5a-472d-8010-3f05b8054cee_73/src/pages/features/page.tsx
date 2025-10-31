
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function FeaturesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "기능 소개 - ERP Assist AI 자동화 솔루션";
    
    const updateMetaTags = () => {
      const existingMeta = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"]');
      existingMeta.forEach(tag => tag.remove());

      const metaTags = [
        { name: 'description', content: 'ERP Assist의 AI 자연어 처리, ERP 완벽 연동, 실시간 경영 대시보드 등 핵심 기능을 상세히 알아보세요. 업무 효율성 10배 향상의 비밀을 확인하세요.' },
        { name: 'keywords', content: 'AI 자연어 처리, ERP 연동, 경영 대시보드, 업무 자동화, 전표 생성' },
        { property: 'og:title', content: '기능 소개 - ERP Assist AI 자동화 솔루션' },
        { property: 'og:description', content: 'ERP Assist의 AI 자연어 처리, ERP 완벽 연동, 실시간 경영 대시보드 등 핵심 기능을 상세히 알아보세요.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/features` }
      ];

      metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        if (tag.name) meta.setAttribute('name', tag.name);
        if (tag.property) meta.setAttribute('property', tag.property);
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      });
    };

    updateMetaTags();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ERP Assist 핵심 기능
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            AI 기술과 전문가의 노하우가 결합된 혁신적인 기능들로<br />
            귀하의 업무 효율성을 극대화합니다
          </p>
        </div>
      </section>

      {/* AI 자연어 처리 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-robot-line text-blue-600 text-2xl"></i>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                AI 자연어 처리 기술
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                복잡한 주문 내용을 자연어로 입력하면 AI가 자동으로 분석하여 
                정확한 전표 데이터로 변환합니다. 더 이상 복잡한 양식을 채울 필요가 없습니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">다양한 입력 형태 지원</h3>
                    <p className="text-gray-600">카톡, 전화, 엑셀, 한글 파일 등 모든 형태의 주문 데이터 처리</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">높은 정확도</h3>
                    <p className="text-gray-600">95% 이상의 정확도로 품목명, 수량, 단가 자동 인식</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">학습 기능</h3>
                    <p className="text-gray-600">사용할수록 더 정확해지는 AI 학습 시스템</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://readdy.ai/api/search-image?query=AI%20natural%20language%20processing%20interface%20showing%20Korean%20text%20input%20being%20converted%20to%20structured%20ERP%20data%2C%20modern%20dashboard%20with%20chat-like%20interface%2C%20blue%20and%20white%20color%20scheme%2C%20professional%20business%20setting&width=600&height=400&seq=ai-nlp&orientation=landscape"
                alt="AI 자연어 처리 기능"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ERP 완벽 연동 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-links-line text-green-600 text-2xl"></i>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                기존 ERP와 완벽 연동
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                이카운트, 더존 등 기존 ERP 시스템을 그대로 활용하면서 
                사용하기 쉬운 맞춤형 UI로 업무 효율성을 극대화합니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">실시간 데이터 동기화</h3>
                    <p className="text-gray-600">ERP 시스템과 실시간으로 데이터 동기화</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">기존 데이터 보존</h3>
                    <p className="text-gray-600">기존 ERP 데이터를 그대로 유지하며 연동</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">간편한 UI/UX</h3>
                    <p className="text-gray-600">복잡한 ERP 대신 직관적인 인터페이스 제공</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:order-1">
              <img 
                src="https://readdy.ai/api/search-image?query=ERP%20system%20integration%20diagram%20showing%20seamless%20connection%20between%20existing%20ERP%20software%20and%20modern%20AI%20interface%2C%20data%20flow%20visualization%2C%20Korean%20business%20environment%2C%20professional%20technical%20illustration&width=600&height=400&seq=erp-integration&orientation=landscape"
                alt="ERP 완벽 연동"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 실시간 경영 대시보드 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-dashboard-line text-purple-600 text-2xl"></i>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                CEO 맞춤형 실시간 경영 대시보드
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                핵심 경영 지표를 실시간으로 확인하고 데이터 기반의 
                빠른 의사결정을 내릴 수 있습니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">실시간 재고 현황</h3>
                    <p className="text-gray-600">품목별 재고 수량과 회전율을 실시간 모니터링</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">매출 분석</h3>
                    <p className="text-gray-600">채널별, 품목별 매출 현황과 수익성 분석</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">모바일 지원</h3>
                    <p className="text-gray-600">언제 어디서나 모바일로 경영 현황 확인</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img 
                src="https://readdy.ai/api/search-image?query=Modern%20business%20dashboard%20interface%20showing%20real-time%20KPI%20metrics%2C%20sales%20analytics%2C%20inventory%20status%2C%20Korean%20business%20data%20visualization%2C%20clean%20professional%20design%20with%20charts%20and%20graphs&width=600&height=400&seq=dashboard&orientation=landscape"
                alt="실시간 경영 대시보드"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 추가 기능들 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              더 많은 혁신적인 기능들
            </h2>
            <p className="text-lg text-gray-600">
              업무 효율성을 극대화하는 다양한 기능들을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-file-text-line text-orange-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">자동 전표 생성</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                AI가 분석한 데이터를 바탕으로 정확한 회계 전표를 자동 생성합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-alert-line text-red-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">이상 거래 감지</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                비정상적인 거래 패턴을 자동으로 감지하여 알림을 제공합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-bar-chart-box-line text-indigo-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">경영 리포트</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                정기적인 경영 분석 리포트를 자동으로 생성하여 제공합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-team-line text-teal-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">다중 사용자 지원</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                부서별, 권한별로 다양한 사용자가 동시에 이용할 수 있습니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-shield-check-line text-pink-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">보안 강화</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                기업급 보안 시스템으로 중요한 경영 데이터를 안전하게 보호합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-customer-service-2-line text-yellow-600 text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">24/7 지원</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                언제든지 전문가의 기술 지원과 컨설팅을 받을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            이 모든 기능을 지금 바로 체험해보세요
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            무료 체험으로 ERP Assist의 강력한 기능들을 직접 확인하실 수 있습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/demo')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold cursor-pointer whitespace-nowrap"
            >
              무료 체험 시작하기
            </button>
            <button 
              onClick={() => navigate('/contact')}
              className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold cursor-pointer whitespace-nowrap"
            >
              전문가 상담 신청
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
