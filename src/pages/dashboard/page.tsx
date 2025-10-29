import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface OrderLog {
  id: string;
  raw_input_text: string;
  status: 'success' | 'failed' | 'pending';
  created_at: string;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState<OrderLog[]>([
    {
      id: '1',
      raw_input_text: 'A거래처, 깐쇼새우 100개, 새우볼 50개',
      status: 'success',
      created_at: '2024-01-29 14:30'
    },
    {
      id: '2', 
      raw_input_text: 'B거래처, 치킨너겟 200개',
      status: 'success',
      created_at: '2024-01-29 13:15'
    },
    {
      id: '3',
      raw_input_text: 'C거래처, 돈까스 150개, 함박스테이크 80개',
      status: 'pending',
      created_at: '2024-01-29 12:45'
    }
  ]);

  const [stats, setStats] = useState({
    todayOrders: 12,
    totalItems: 1250,
    totalCustomers: 45,
    successRate: 98.5
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'success': return '완료';
      case 'failed': return '실패';
      case 'pending': return '처리중';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
                onClick={() => navigate('/chat')}
                className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap cursor-pointer"
              >
                AI 전표입력
              </button>
              <button 
                onClick={() => navigate('/settings')}
                className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap cursor-pointer"
              >
                설정
              </button>
              <button className="text-gray-700 hover:text-blue-600 font-medium whitespace-nowrap cursor-pointer">
                로그아웃
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h2>
          <p className="text-gray-600">이카운트 ERP 연동 현황과 최근 전표 입력 내역을 확인하세요</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">오늘 처리된 전표</p>
                <p className="text-3xl font-bold text-gray-900">{stats.todayOrders}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <i className="ri-file-text-line text-blue-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">등록된 품목</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalItems.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <i className="ri-box-3-line text-green-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">등록된 거래처</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalCustomers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <i className="ri-building-line text-purple-600 text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">처리 성공률</p>
                <p className="text-3xl font-bold text-gray-900">{stats.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-orange-600 text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => navigate('/chat')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-chat-3-line text-blue-600 text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">AI 전표 입력</p>
                    <p className="text-sm text-gray-600">자연어로 전표 생성</p>
                  </div>
                </button>

                <button 
                  onClick={() => navigate('/settings')}
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-200 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="ri-settings-3-line text-green-600 text-lg"></i>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">이카운트 연동</p>
                    <p className="text-sm text-gray-600">API 설정 관리</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">시간 절약 효과</h3>
            <p className="text-blue-100 text-sm mb-4">기존 3분 → 현재 10초</p>
            <div className="text-2xl font-bold mb-1">94%</div>
            <p className="text-blue-100 text-sm">업무 시간 단축</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">최근 전표 입력 내역</h3>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium cursor-pointer whitespace-nowrap">
                전체 보기
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{order.raw_input_text}</p>
                    <p className="text-sm text-gray-600">{order.created_at}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}