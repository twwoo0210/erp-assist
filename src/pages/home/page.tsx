import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: '"Pacifico", serif' }}>
                ERP Assist
              </h1>
              <span className="text-sm text-gray-500 bg-blue-50 px-2 py-1 rounded-full">v3.0</span>
            </div>
            <nav className="flex items-center space-x-6">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                시작하기
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                이카운트 ERP의<br />
                <span className="text-blue-600">수기 전표 입력</span>을<br />
                AI로 혁신하세요
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                "깐쇼새우 100개, 새우볼 50개"라고 말하면 10초 만에 전표가 완성됩니다. 
                기존 3분 걸리던 작업을 94% 단축하세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold cursor-pointer whitespace-nowrap"
                >
                  무료로 시작하기
                </button>
                <button className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold cursor-pointer whitespace-nowrap">
                  데모 보기
                </button>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://readdy.ai/api/search-image?query=Modern%20business%20professional%20using%20AI%20chatbot%20interface%20on%20computer%20screen%20for%20ERP%20system%2C%20clean%20office%20environment%2C%20Korean%20business%20setting%2C%20professional%20lighting%2C%20high-tech%20atmosphere%2C%20blue%20and%20white%20color%20scheme&width=600&height=400&seq=hero1&orientation=landscape"
                alt="ERP Assist AI 인터페이스"
                className="rounded-lg shadow-xl object-cover w-full h-96"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">왜 ERP Assist인가요?</h2>
            <p className="text-xl text-gray-600">이카운트 사용자를 위한 특별한 솔루션</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-time-line text-blue-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">시간 단축</h3>
              <p className="text-gray-600">
                건당 3분 걸리던 전표 입력을 10초로 단축. 
                하루 100건 처리 시 약 5시간 절약
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-shield-check-line text-green-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">오류 감소</h3>
              <p className="text-gray-600">
                AI가 품목/거래처를 표준 마스터에서 자동 매칭하여 
                수기 입력 오류를 원천 차단
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-chat-3-line text-purple-600 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">직관적 UI</h3>
              <p className="text-gray-600">
                복잡한 ERP 화면 대신 친숙한 채팅 인터페이스로 
                누구나 쉽게 사용 가능
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">어떻게 작동하나요?</h2>
            <p className="text-xl text-gray-600">3단계로 완성되는 간단한 프로세스</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-lg flex items-center justify-center mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">자연어 입력</h3>
              <p className="text-gray-600 mb-4">
                "A거래처, 깐쇼새우 100개, 새우볼 50개"처럼 
                평소 말하는 방식 그대로 입력하세요
              </p>
              <img 
                src="https://readdy.ai/api/search-image?query=Person%20typing%20natural%20language%20order%20into%20chat%20interface%20on%20smartphone%2C%20Korean%20text%20visible%2C%20modern%20mobile%20app%20design%2C%20clean%20white%20background%2C%20professional%20business%20setting&width=300&height=200&seq=step1&orientation=landscape"
                alt="자연어 입력"
                className="rounded-lg w-full h-32 object-cover"
              />
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="w-12 h-12 bg-green-600 text-white rounded-lg flex items-center justify-center mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">AI 자동 매칭</h3>
              <p className="text-gray-600 mb-4">
                AI가 이카운트 마스터 데이터에서 
                정확한 품목과 거래처를 자동으로 찾아줍니다
              </p>
              <img 
                src="https://readdy.ai/api/search-image?query=AI%20artificial%20intelligence%20matching%20products%20and%20customers%20in%20ERP%20system%2C%20data%20visualization%2C%20Korean%20business%20interface%2C%20modern%20technology%2C%20blue%20and%20green%20color%20scheme&width=300&height=200&seq=step2&orientation=landscape"
                alt="AI 자동 매칭"
                className="rounded-lg w-full h-32 object-cover"
              />
            </div>

            <div className="bg-white rounded-lg p-8 shadow-sm border">
              <div className="w-12 h-12 bg-purple-600 text-white rounded-lg flex items-center justify-center mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">전표 자동 생성</h3>
              <p className="text-gray-600 mb-4">
                확인 후 클릭 한 번으로 
                이카운트에 판매전표가 즉시 생성됩니다
              </p>
              <img 
                src="https://readdy.ai/api/search-image?query=Completed%20sales%20invoice%20automatically%20generated%20in%20ERP%20system%2C%20Korean%20business%20document%2C%20professional%20interface%2C%20success%20confirmation%2C%20modern%20office%20setting&width=300&height=200&seq=step3&orientation=landscape"
                alt="전표 자동 생성"
                className="rounded-lg w-full h-32 object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Target Customers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">이런 분들께 추천합니다</h2>
            <p className="text-xl text-gray-600">이카운트 ERP를 사용하는 중소기업</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-restaurant-line text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">식품 제조업</h3>
              <p className="text-gray-600">전화로 받은 발주를 수기로 입력하는 식품 제조사</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-100">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-store-line text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">도소매업</h3>
              <p className="text-gray-600">카톡이나 메모로 받은 주문을 ERP에 입력하는 도소매업체</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-6 border border-purple-100">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-building-line text-white text-xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">유통업</h3>
              <p className="text-gray-600">다양한 채널로 들어오는 주문을 통합 관리하는 유통업체</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            지금 시작하여 업무 효율을 94% 높이세요
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            무료 체험으로 ERP Assist의 강력한 기능을 직접 경험해보세요
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors text-lg font-semibold cursor-pointer whitespace-nowrap"
          >
            무료로 시작하기
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold mb-4" style={{ fontFamily: '"Pacifico", serif' }}>
                ERP Assist
              </h3>
              <p className="text-gray-400 mb-4">
                이카운트 ERP 사용자를 위한 AI 기반 전표 입력 솔루션
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">제품</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white cursor-pointer">AI 전표 입력</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">이카운트 연동</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">실시간 동기화</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">지원</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white cursor-pointer">문서</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">고객지원</a></li>
                <li><a href="#" className="hover:text-white cursor-pointer">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ERP Assist. All rights reserved. | 
              <a href="https://readdy.ai/?origin=logo" className="hover:text-white ml-2 cursor-pointer">
                Powered by Readdy
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}