
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../../hooks/useAuth';

export default function DemoPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    document.title = "시스템 체험 - ERP Assist AI 자동화 솔루션";
    
    const updateMetaTags = () => {
      const existingMeta = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"]');
      existingMeta.forEach(tag => tag.remove());

      const metaTags = [
        { name: 'description', content: 'ERP Assist AI 자동화 시스템을 직접 체험해보세요. 자연어 처리, ERP 연동, 실시간 대시보드 등 핵심 기능을 무료로 테스트할 수 있습니다.' },
        { name: 'keywords', content: '시스템 체험, 무료 체험, AI 자동화 테스트, ERP 데모, 실시간 체험' },
        { property: 'og:title', content: '시스템 체험 - ERP Assist AI 자동화 솔루션' },
        { property: 'og:description', content: 'ERP Assist AI 자동화 시스템을 직접 체험해보세요. 자연어 처리, ERP 연동, 실시간 대시보드 등 핵심 기능을 무료로 테스트' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/demo` }
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

  const handleStartDemo = () => {
    if (!user) {
      navigate('/auth/login', { state: { from: { pathname: '/chat' } } });
      return;
    }

    navigate('/chat');
  };

  const handleViewDashboard = () => {
    navigate('/dashboard');
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
              <h3 className="text-lg font-semibold text-gray-900">빠른 문의</h3>
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
                {isSubmitting ? '제출 중...' : '문의 제출'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            ERP Assist 시스템 체험
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            AI 자동화의 강력한 기능을 직접 체험해보세요.<br />
            실제 업무 환경와 동일한 시스템으로 테스트할 수 있습니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleStartDemo}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg text-base font-semibold hover:bg-blue-700 cursor-pointer whitespace-nowrap transition-colors"
            >
              AI 채팅 체험하기
            </button>
            <button
              onClick={handleViewDashboard}
              className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg text-base font-semibold hover:bg-blue-50 cursor-pointer whitespace-nowrap transition-colors"
            >
              대시보드 보기
            </button>
          </div>
        </div>
      </section>

      {/* Demo Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">체험 가능한 기능들</h2>
            <p className="text-lg text-gray-600">실제 업무에서 사용하는 모든 기능을 체험해보세요</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* AI 채팅 체험 */}
            <div className="bg-blue-50 rounded-lg p-8 border border-blue-100">
              <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-chat-3-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI 채팅 인터페이스</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                자연어로 주문 내용을 입력하면 AI가 자동으로 분석하여 
                정확한 전표 데이터로 변환하는 과정을 체험할 수 있습니다.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">실시간 AI 자연어 처리</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">품목 자동 매칭</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">전표 자동 생성</span>
                </div>
              </div>
              <button
                onClick={handleStartDemo}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                AI 채팅 체험하기
              </button>
            </div>

            {/* 대시보드 체험 */}
            <div className="bg-green-50 rounded-lg p-8 border border-green-100">
              <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center mb-6">
                <i className="ri-dashboard-line text-white text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">실시간 경영 대시보드</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                CEO를 위한 맞춤형 대시보드에서 실시간 경영 지표와 
                데이터 분석 결과를 확인할 수 있습니다.
              </p>
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">실시간 매출 현황</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">재고 관리 현황</span>
                </div>
                <div className="flex items-center space-x-3">
                  <i className="ri-check-line text-green-600"></i>
                  <span className="text-gray-700">주문 처리 로그</span>
                </div>
              </div>
              <button
                onClick={handleViewDashboard}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                대시보드 보기
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Instructions */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">체험 가이드</h2>
            <p className="text-lg text-gray-600">효과적인 체험을 위한 단계별 가이드를 확인하세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 채팅 체험</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                "A거래처에 깐쇼새우 100개, 탕수육 50개 주문" 같은 
                자연어로 주문을 입력해보세요.
              </p>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 text-xs font-medium">
                  예시: "B업체 짜장면 200개, 짬뽕 150개 납품"
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
              <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI 분석 확인</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                AI가 자동으로 분석한 결과를 확인하고 
                필요시 수정할 수 있습니다.
              </p>
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-green-800 text-xs font-medium">
                  품목명, 수량, 단가가 자동으로 인식됩니다
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border text-center">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">대시보드 확인</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                처리된 주문이 실시간으로 대시보드에 
                반영되는 것을 확인하세요.
              </p>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-purple-800 text-xs font-medium">
                  실시간 데이터 업데이트를 체험할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sample Data */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">체험용 샘플 데이터</h2>
            <p className="text-lg text-gray-600">아래 샘플 데이터를 복사해서 AI 챗팅에 입력해보세요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-lg p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">음식점 주문 예시</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-800 text-sm">"A식당에 짜장면 100개, 짬뽕 80개, 탕수육 50개 주문합니다"</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-800 text-sm">"B업체 깐쇼새우 200개, 볶음밥 150개 납품 요청"</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-800 text-sm">"C거래처 마파두부 120개, 양장피 80개 주문"</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">일반 상품 주문 예시</h3>
              <div className="space-y-3">
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-800 text-sm">"D회사에 노트북 10대, 마우스 20개 납품"</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-800 text-sm">"E업체 프린터 5대, A4용지 100박스 주문"</p>
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="text-gray-800 text-sm">"F거래처 의자 50개, 책상 25개 납품 요청"</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              체험 후 기대 효과
            </h2>
            <p className="text-lg text-blue-100">
              실제 도입 시 얻을 수 있는 효과를 미리 확인하세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-white text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">시간 절약</h3>
              <p className="text-blue-100 text-sm">
                기존 5분 → 30초로<br />업무 시간 90% 단축
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-white text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">오류 감소</h3>
              <p className="text-blue-100 text-sm">
                수작업 오류<br />95% 이상 감소
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-money-dollar-circle-line text-white text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">비용 절감</h3>
              <p className="text-blue-100 text-sm">
                인건비 대비<br />50% 이상 절약
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <i className="ri-line-chart-line text-white text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">생산성 향상</h3>
              <p className="text-blue-100 text-sm">
                전체 업무 생산성<br />300% 이상 향상
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleStartDemo}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold cursor-pointer whitespace-nowrap"
              >
                지금 바로 체험하기
              </button>
              <button
                onClick={() => setShowLeadForm(true)}
                className="border-2 border-white text-white px-6 py-3 rounded-lg hover:bg-white/10 transition-colors font-semibold cursor-pointer whitespace-nowrap"
              >
                전문가 상담 신청
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
