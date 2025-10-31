
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function ServerError() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "서버 오류 - ERP Assist";
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 text-red-500 mb-6">
            <i className="ri-error-warning-line text-6xl"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">500</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">서버 내부 오류</h2>
          <p className="text-gray-600 mb-8">
            죄송합니다. 서버에 일시적인 문제가 발생했습니다.<br />
            잠시 후 다시 시도해 주세요.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              페이지 새로고침
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          문제가 지속되면 고객지원팀에 문의해 주세요.
        </p>
        <p className="text-sm text-gray-500">
          이메일: support@erpassist.co.kr | 전화: 02-1234-5678
        </p>
      </div>
    </div>
  );
}
