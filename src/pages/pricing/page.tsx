
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function PricingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "요금제 - ERP Assist AI 자동화 솔루션";
    
    const updateMetaTags = () => {
      const existingMeta = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"]');
      existingMeta.forEach(tag => tag.remove());

      const metaTags = [
        { name: 'description', content: 'ERP Assist 요금제 안내. 신규 인력 1명 채용 예산으로 AI 자동화 시스템과 전문 컨설팅팀을 확보하세요. 합리적인 월 구독료로 더 높은 가치를 제공합니다.' },
        { name: 'keywords', content: '요금제, 가격, 월 구독료, AI 자동화 비용, ERP 도입 비용' },
        { property: 'og:title', content: '요금제 - ERP Assist AI 자동화 솔루션' },
        { property: 'og:description', content: 'ERP Assist 요금제 안내. 신규 인력 1명 채용 예산으로 AI 자동화 시스템과 전문 컨설팅팀을 확보하세요.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/pricing` }
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
            최소 비용으로 최대 효율을 구현합니다
          </h1>
          <p className="text-lg md:text-xl text-blue-600 font-semibold leading-relaxed max-w-4xl mx-auto">
            신규 인력 1명 채용 예산으로, 인력 리스크가 없는 AI 자동화 시스템과<br />
            전문 컨설팅팀을 확보하십시오.
          </p>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              왜 ERP Assist가 더 나은 선택인가?
            </h2>
            <p className="text-lg text-gray-600">
              기존 방식과 비교해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* 기존 방식 */}
            <div className="bg-red-50 rounded-lg p-8 border border-red-100">
              <h3 className="text-xl font-bold text-red-900 mb-6 text-center">기존 방식 (인력 채용)</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-close-line text-red-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-red-900">높은 인건비</h4>
                    <p className="text-red-800 text-sm">월 300-500만원 + 4대보험 + 퇴직금</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-close-line text-red-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-red-900">인력 리스크</h4>
                    <p className="text-red-800 text-sm">업무 공백, 데이터 유실, 내부 통제 문제</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-close-line text-red-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-red-900">제한된 업무 시간</h4>
                    <p className="text-red-800 text-sm">주 40시간, 휴가/병가 시 업무 중단</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-close-line text-red-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-red-900">교육 비용</h4>
                    <p className="text-red-800 text-sm">신규 직원 교육 및 적응 기간 필요</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-red-100 rounded-lg">
                <p className="text-red-900 font-semibold text-center">
                  연간 총 비용: 5,000만원 이상
                </p>
              </div>
            </div>

            {/* ERP Assist */}
            <div className="bg-green-50 rounded-lg p-8 border border-green-100">
              <h3 className="text-xl font-bold text-green-900 mb-6 text-center">ERP Assist 방식</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-green-900">합리적인 월 구독료</h4>
                    <p className="text-green-800 text-sm">인건비 대비 50% 이상 절약</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-green-900">리스크 제거</h4>
                    <p className="text-green-800 text-sm">인력 의존성 없는 안정적인 시스템</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-green-900">24/7 무중단 운영</h4>
                    <p className="text-green-800 text-sm">365일 24시간 자동화 처리</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold text-green-900">전문가 지원</h4>
                    <p className="text-green-800 text-sm">세무/데이터 전문가 팀의 지속적 지원</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-green-100 rounded-lg">
                <p className="text-green-900 font-semibold text-center">
                  연간 총 비용: 2,000만원 내외
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              요금제 안내
            </h2>
            <p className="text-lg text-gray-600">
              기업 규모와 요구사항에 맞는 최적의 플랜을 선택하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter Plan */}
            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
                <p className="text-gray-600 mb-4">소규모 기업용</p>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  월 150만원
                  <span className="text-lg font-normal text-gray-600">부터</span>
                </div>
                <p className="text-sm text-gray-500">VAT 별도</p>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">AI 자연어 처리 (월 1,000건)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">기본 ERP 연동</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">실시간 대시보드</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">이메일 지원</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/contact')}
                className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                문의하기
              </button>
            </div>

            {/* Professional Plan */}
            <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-blue-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  추천
                </span>
              </div>
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Professional</h3>
                <p className="text-gray-600 mb-4">중소기업용</p>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  월 250만원
                  <span className="text-lg font-normal text-gray-600">부터</span>
                </div>
                <p className="text-sm text-gray-500">VAT 별도</p>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">AI 자연어 처리 (월 5,000건)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">고급 ERP 연동</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">맞춤형 대시보드</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">월간 경영 리포트</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">전화/이메일 지원</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">월 2시간 컨설팅</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/contact')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                문의하기
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-600 mb-4">대기업용</p>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  맞춤 견적
                </div>
                <p className="text-sm text-gray-500">요구사항에 따라 산정</p>
              </div>
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">무제한 AI 처리</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">다중 ERP 연동</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">고급 분석 대시보드</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">주간 경영 리포트</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">24/7 전담 지원</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">무제한 컨설팅</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">맞춤 개발</span>
                </div>
              </div>
              <button 
                onClick={() => navigate('/contact')}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                문의하기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Calculator */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              투자 대비 효과 (ROI)
            </h2>
            <p className="text-lg text-gray-600">
              ERP Assist 도입으로 얻을 수 있는 실질적인 효과를 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-green-50 rounded-lg p-6 border border-green-100 text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-white text-xl"></i>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">비용 절감</h3>
              <p className="text-2xl font-bold text-green-600 mb-2">50%+</p>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                인건비 대비 절약 효과
              </p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-white text-xl"></i>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">시간 단축</h3>
              <p className="text-2xl font-bold text-blue-600 mb-2">90%+</p>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                업무 처리 시간 단축
              </p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border border-purple-100 text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-white text-xl"></i>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">오류 감소</h3>
              <p className="text-2xl font-bold text-purple-600 mb-2">95%+</p>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                수작업 오류 감소
              </p>
            </div>

            <div className="bg-orange-50 rounded-lg p-6 border border-orange-100 text-center">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-line-chart-line text-white text-xl"></i>
              </div>
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">생산성 향상</h3>
              <p className="text-2xl font-bold text-orange-600 mb-2">300%+</p>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                전체 업무 생산성 향상
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              자주 묻는 질문
            </h2>
            <p className="text-lg text-gray-600">
              요금제 관련 궁금한 점들을 확인하세요
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 초기 구축 비용은 별도인가요?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A. 네, 초기 구축 비용은 별도입니다. 기업의 규모와 요구사항에 따라 
                500만원~2,000만원 범위에서 책정되며, 무료 진단 후 정확한 견적을 제공해드립니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 계약 기간은 어떻게 되나요?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A. 최소 계약 기간은 12개월입니다. 이후 월 단위로 연장 가능하며, 
                장기 계약 시 할인 혜택을 제공합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 기존 ERP 시스템 변경이 필요한가요?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A. 아니요, 기존 ERP 시스템을 그대로 사용하시면 됩니다. 
                ERP Assist는 기존 시스템과 연동하여 작동하므로 별도의 시스템 교체가 불필요합니다.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Q. 중도 해지 시 위약금이 있나요?
              </h3>
              <p className="text-gray-600 leading-relaxed">
                A. 최소 계약 기간 내 중도 해지 시 잔여 기간에 대한 위약금이 발생할 수 있습니다. 
                자세한 내용은 계약서에 명시되며, 상담 시 안내해드립니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            지금 바로 무료 진단을 받아보세요
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            귀하의 기업에 최적화된 솔루션과 정확한 견적을<br />
            무료로 제공해드립니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contact')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold cursor-pointer whitespace-nowrap"
            >
              무료 견적 받기
            </button>
            <button 
              onClick={() => navigate('/demo')}
              className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold cursor-pointer whitespace-nowrap"
            >
              시스템 체험하기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
