
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ProcessPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "도입 프로세스 - ERP Assist AI 자동화 솔루션";
    
    const updateMetaTags = () => {
      const existingMeta = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"]');
      existingMeta.forEach(tag => tag.remove());

      const metaTags = [
        { name: 'description', content: 'ERP Assist 도입 프로세스를 단계별로 안내합니다. 업무 진단부터 시스템 구축, 운영까지 체계적인 3단계 프로세스로 완벽한 AI 자동화를 구현하세요.' },
        { name: 'keywords', content: '도입 프로세스, 업무 진단, 시스템 구축, AI 자동화 도입, ERP 컨설팅' },
        { property: 'og:title', content: '도입 프로세스 - ERP Assist AI 자동화 솔루션' },
        { property: 'og:description', content: 'ERP Assist 도입 프로세스를 단계별로 안내합니다. 업무 진단부터 시스템 구축, 운영까지 체계적인 3단계 프로세스' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/process` }
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
            ERP Assist 도입 프로세스
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            체계적인 3단계 프로세스로 완벽한 AI 자동화 시스템을 구축합니다.<br />
            전문가와 함께하는 안전하고 확실한 디지털 전환을 경험하세요.
          </p>
        </div>
      </section>

      {/* Step 1: 진단 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mr-4">
                  1
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  업무 프로세스 진단 (AS-IS)
                </h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                대표/실무진 인터뷰를 통해 현재 업무 프로세스의 비효율(Pain Point)과 
                데이터 병목 구간을 정밀 진단합니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">현황 분석</h3>
                    <p className="text-gray-600">기존 업무 프로세스와 시스템 현황 파악</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">문제점 도출</h3>
                    <p className="text-gray-600">업무 비효율과 데이터 병목 구간 식별</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">개선 방향 제시</h3>
                    <p className="text-gray-600">AI 자동화를 통한 개선 방안 제안</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-semibold text-blue-900 mb-2">진단 기간: 1-2주</h4>
                <p className="text-blue-800 text-sm">무료 진단 서비스로 제공됩니다</p>
              </div>
            </div>
            <div>
              <img 
                src="https://readdy.ai/api/search-image?query=Business%20process%20analysis%20and%20diagnosis%20meeting%20with%20CEO%20and%20staff%2C%20professional%20consultation%20setting%2C%20Korean%20business%20environment%2C%20charts%20and%20workflow%20diagrams%20on%20whiteboard%2C%20analytical%20atmosphere&width=600&height=400&seq=process1&orientation=landscape"
                alt="업무 프로세스 진단"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Step 2: 구축 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="lg:order-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mr-4">
                  2
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  맞춤형 솔루션 설계 및 구축 (TO-BE)
                </h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                진단 결과를 바탕으로 기존 ERP 연동, AI 자동화 모듈 적용 등 
                귀사에 최적화된 시스템을 설계 및 구축합니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">시스템 설계</h3>
                    <p className="text-gray-600">기업 특성에 맞는 맞춤형 시스템 아키텍처 설계</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">ERP 연동</h3>
                    <p className="text-gray-600">기존 ERP 시스템과의 안전한 연동 구현</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI 모듈 적용</h3>
                    <p className="text-gray-600">자연어 처리 및 자동화 모듈 구축</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">테스트 및 검증</h3>
                    <p className="text-gray-600">철저한 테스트를 통한 시스템 안정성 확보</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-semibold text-green-900 mb-2">구축 기간: 4-8주</h4>
                <p className="text-green-800 text-sm">단계별 검수를 통한 안전한 구축</p>
              </div>
            </div>
            <div className="lg:order-1">
              <img 
                src="https://readdy.ai/api/search-image?query=Custom%20solution%20design%20and%20system%20construction%2C%20technical%20team%20working%20on%20ERP%20integration%20and%20AI%20automation%20modules%2C%20modern%20development%20environment%2C%20Korean%20tech%20workspace&width=600&height=400&seq=process2&orientation=landscape"
                alt="맞춤형 솔루션 설계"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Step 3: 운영 */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center text-xl font-bold mr-4">
                  3
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  지속적인 운영 및 고도화 (BPO)
                </h2>
              </div>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                시스템 오픈 후, 경리 업무 대행(BPO), 데이터 모니터링, 
                정기적인 경영 리포트 제공 등 지속적인 운영 파트너가 되어 드립니다.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">24/7 모니터링</h3>
                    <p className="text-gray-600">시스템 안정성과 데이터 품질 지속 관리</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">업무 대행 서비스</h3>
                    <p className="text-gray-600">경리 업무 BPO 서비스 제공</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">정기 리포트</h3>
                    <p className="text-gray-600">월간/분기별 경영 분석 리포트 제공</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="ri-check-line text-green-600 text-xl mt-1"></i>
                  <div>
                    <h3 className="font-semibold text-gray-900">지속적 개선</h3>
                    <p className="text-gray-600">AI 모델 학습 및 시스템 고도화</p>
                  </div>
                </div>
              </div>
              <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-900 mb-2">운영 기간: 지속적</h4>
                <p className="text-purple-800 text-sm">장기 파트너십을 통한 지속적 가치 창출</p>
              </div>
            </div>
            <div>
              <img 
                src="https://readdy.ai/api/search-image?query=Ongoing%20system%20operation%20and%20business%20process%20outsourcing%2C%20monitoring%20dashboards%2C%20regular%20business%20reports%2C%20professional%20Korean%20business%20support%20team%2C%20continuous%20improvement&width=600&height=400&seq=process3&orientation=landscape"
                alt="지속적인 운영 및 고도화"
                className="rounded-lg shadow-lg w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              도입 일정 및 마일스톤
            </h2>
            <p className="text-lg text-gray-600">
              체계적인 일정 관리로 안전하고 확실한 도입을 보장합니다
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-200"></div>
            
            <div className="space-y-12">
              <div className="flex items-center">
                <div className="flex-1 text-right pr-8">
                  <h3 className="text-lg font-semibold text-gray-900">1주차: 초기 상담 및 현황 파악</h3>
                  <p className="text-gray-600">업무 프로세스 분석 및 요구사항 정의</p>
                </div>
                <div className="w-4 h-4 bg-blue-600 rounded-full relative z-10"></div>
                <div className="flex-1 pl-8"></div>
              </div>

              <div className="flex items-center">
                <div className="flex-1 pr-8"></div>
                <div className="w-4 h-4 bg-blue-600 rounded-full relative z-10"></div>
                <div className="flex-1 text-left pl-8">
                  <h3 className="text-lg font-semibold text-gray-900">2-3주차: 상세 진단 및 설계</h3>
                  <p className="text-gray-600">시스템 아키텍처 설계 및 개발 계획 수립</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-1 text-right pr-8">
                  <h3 className="text-lg font-semibold text-gray-900">4-7주차: 시스템 개발 및 구축</h3>
                  <p className="text-gray-600">AI 모듈 개발 및 ERP 연동 구현</p>
                </div>
                <div className="w-4 h-4 bg-green-600 rounded-full relative z-10"></div>
                <div className="flex-1 pl-8"></div>
              </div>

              <div className="flex items-center">
                <div className="flex-1 pr-8"></div>
                <div className="w-4 h-4 bg-green-600 rounded-full relative z-10"></div>
                <div className="flex-1 text-left pl-8">
                  <h3 className="text-lg font-semibold text-gray-900">8주차: 테스트 및 검증</h3>
                  <p className="text-gray-600">시스템 테스트 및 사용자 교육</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="flex-1 text-right pr-8">
                  <h3 className="text-lg font-semibold text-gray-900">9주차 이후: 운영 및 지원</h3>
                  <p className="text-gray-600">시스템 운영 및 지속적인 개선</p>
                </div>
                <div className="w-4 h-4 bg-purple-600 rounded-full relative z-10"></div>
                <div className="flex-1 pl-8"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            지금 바로 무료 진단을 시작하세요
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            전문가와의 1:1 상담을 통해 귀하의 업무 프로세스를 분석하고<br />
            최적의 AI 자동화 방안을 제안해드립니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/contact')}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold cursor-pointer whitespace-nowrap"
            >
              무료 진단 신청하기
            </button>
            <button 
              onClick={() => navigate('/demo')}
              className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold cursor-pointer whitespace-nowrap"
            >
              시스템 미리보기
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}