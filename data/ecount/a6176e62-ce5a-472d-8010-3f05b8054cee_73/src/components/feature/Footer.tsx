
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold mb-4" style={{ fontFamily: '"Pacifico", serif' }}>
              ERP Assist
            </h3>
            <p className="text-gray-400 mb-4">
              AI 기반 경리/ERP 통합 솔루션으로 기업의 업무 효율성을 혁신합니다
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/contact')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                무료 진단 신청
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">솔루션</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => navigate('/features')}
                  className="hover:text-white cursor-pointer"
                >
                  AI 자동화
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/features')}
                  className="hover:text-white cursor-pointer"
                >
                  ERP 연동
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/features')}
                  className="hover:text-white cursor-pointer"
                >
                  경영 대시보드
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">지원</h4>
            <ul className="space-y-2 text-gray-400">
              <li>
                <button 
                  onClick={() => navigate('/process')}
                  className="hover:text-white cursor-pointer"
                >
                  도입 컨설팅
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/contact')}
                  className="hover:text-white cursor-pointer"
                >
                  기술 지원
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/demo')}
                  className="hover:text-white cursor-pointer"
                >
                  시스템 체험
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
          <p>&copy; 2024 ERP Assist. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <button 
              onClick={() => navigate('/privacy')}
              className="hover:text-white cursor-pointer"
            >
              개인정보처리방침
            </button>
            <button 
              onClick={() => navigate('/terms')}
              className="hover:text-white cursor-pointer"
            >
              이용약관
            </button>
            <a href="https://readdy.ai/?origin=logo" className="hover:text-white cursor-pointer">
              Powered by Readdy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
