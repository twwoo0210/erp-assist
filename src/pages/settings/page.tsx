
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_PUBLIC_SUPABASE_URL,
  import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY
);

interface ConnectionStatus {
  isConnected: boolean;
  lastSync: string | null;
  itemCount: number;
  customerCount: number;
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('ecount');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastSync: null,
    itemCount: 0,
    customerCount: 0
  });

  const [ecountSettings, setEcountSettings] = useState({
    zoneId: '',
    comCode: '',
    apiKey: ''
  });

  const [organizationInfo, setOrganizationInfo] = useState({
    companyName: '',
    adminEmail: '',
    phoneNumber: ''
  });

  useEffect(() => {
    // SEO용 동적 메타데이터 설정
    document.title = 'ERP Assist 설정 - 이카운트 연동 및 회사 정보 관리';
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', '이카운트 ERP 연동 설정, 회사 정보 관리, 사용자 권한 설정을 한 곳에서 관리하세요. 안전하고 간편한 API 연동을 지원합니다.');
    }

    // Schema.org JSON-LD 추가
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": "ERP Assist 설정",
      "description": "이카운트 ERP 연동 설정 및 회사 정보 관리",
      "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/settings`,
      "isPartOf": {
        "@type": "WebSite",
        "name": "ERP Assist",
        "url": `${import.meta.env.VITE_SITE_URL || 'https://example.com'}`
      }
    });
    document.head.appendChild(script);

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (!user) {
        navigate('/');
        return;
      }

      // 프로필 및 조직 정보 가져오기
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*, organizations(*)')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        
        if (profileData.organizations) {
          const org = profileData.organizations;
          setOrganizationInfo({
            companyName: org.company_name || '',
            adminEmail: org.admin_email || '',
            phoneNumber: org.phone_number || ''
          });
          
          setEcountSettings({
            zoneId: org.ecount_zone_id || '',
            comCode: org.ecount_com_code || '',
            apiKey: org.ecount_api_key || ''
          });

          // 마스터 데이터 개수 확인
          const { data: masters } = await supabase
            .from('cached_masters')
            .select('type')
            .eq('organization_id', org.id);

          if (masters) {
            const itemCount = masters.filter(m => m.type === 'item').length;
            const customerCount = masters.filter(m => m.type === 'customer').length;
            
            setConnectionStatus({
              isConnected: itemCount > 0 || customerCount > 0,
              lastSync: org.updated_at ? new Date(org.updated_at).toLocaleString() : null,
              itemCount,
              customerCount
            });
          }
        }
      }
    };
    
    checkUser();

    return () => {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [navigate]);

  const handleEcountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!profile?.organizations) {
        throw new Error('조직 정보를 찾을 수 없습니다.');
      }

      // 조직 정보 업데이트
      const { error } = await supabase
        .from('organizations')
        .update({
          ecount_zone_id: ecountSettings.zoneId,
          ecount_com_code: ecountSettings.comCode,
          ecount_api_key: ecountSettings.apiKey,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.organizations.id);

      if (error) {
        throw new Error(error.message);
      }

      // 마스터 동기화 호출
      await handleSync();
      
      alert('이카운트 API 연결이 성공적으로 완료되었습니다!');
    } catch (error: any) {
      alert(`연결에 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/ecount-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '동기화에 실패했습니다.');
      }

      const result = await response.json();
      
      setConnectionStatus({
        isConnected: true,
        lastSync: new Date().toLocaleString(),
        itemCount: result.itemCount,
        customerCount: result.customerCount
      });
      
      alert('마스터 데이터 동기화가 완료되었습니다.');
    } catch (error: any) {
      alert(`동기화에 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!profile?.organizations) {
        throw new Error('조직 정보를 찾을 수 없습니다.');
      }

      const { error } = await supabase
        .from('organizations')
        .update({
          company_name: organizationInfo.companyName,
          admin_email: organizationInfo.adminEmail,
          phone_number: organizationInfo.phoneNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.organizations.id);

      if (error) {
        throw new Error(error.message);
      }

      alert('회사 정보가 저장되었습니다.');
    } catch (error: any) {
      alert(`저장에 실패했습니다: ${error.message}`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로그인 확인 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">설정</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('ecount')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'ecount'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                이카운트 연동
              </button>
              <button
                onClick={() => setActiveTab('organization')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'organization'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                회사 정보
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap cursor-pointer ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                사용자 관리
              </button>
            </nav>
          </div>
        </div>

        {/* Ecount Integration Tab */}
        {activeTab === 'ecount' && (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">연결 상태</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`font-medium ${connectionStatus.isConnected ? 'text-green-700' : 'text-red-700'}`}>
                    {connectionStatus.isConnected ? '연결됨' : '연결 안됨'}
                  </span>
                </div>
                {connectionStatus.isConnected && (
                  <button
                    onClick={handleSync}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                  >
                    {isLoading ? '동기화중...' : '마스터 동기화'}
                  </button>
                )}
              </div>
              
              {connectionStatus.isConnected && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">마지막 동기화</p>
                    <p className="font-medium text-gray-900">{connectionStatus.lastSync}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">품목 수</p>
                    <p className="font-medium text-gray-900">{connectionStatus.itemCount.toLocaleString()}개</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">거래처 수</p>
                    <p className="font-medium text-gray-900">{connectionStatus.customerCount}개</p>
                  </div>
                </div>
              )}
            </div>

            {/* API Settings Form */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">이카운트 API 설정</h3>
              <form onSubmit={handleEcountSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZONE ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ecountSettings.zoneId}
                    onChange={(e) => setEcountSettings(prev => ({ ...prev, zoneId: e.target.value }))}
                    placeholder="예: zone01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사 코드 (COM_CODE) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={ecountSettings.comCode}
                    onChange={(e) => setEcountSettings(prev => ({ ...prev, comCode: e.target.value }))}
                    placeholder="예: COM001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    API 키 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={ecountSettings.apiKey}
                    onChange={(e) => setEcountSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="이카운트에서 발급받은 API 키를 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <i className="ri-information-line text-blue-600 text-lg mr-2 mt-0.5"></i>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">API 키 발급 방법:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>이카운트 ERP 로그인</li>
                        <li>시스템관리 &gt; API관리 &gt; OPEN API 설정</li>
                        <li>API 키 발급 후 위에 입력</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer whitespace-nowrap"
                >
                  {isLoading ? '연결 테스트 중...' : '저장 및 연결 테스트'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Organization Tab */}
        {activeTab === 'organization' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">회사 정보</h3>
            <form onSubmit={handleOrganizationSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">회사명</label>
                <input
                  type="text"
                  value={organizationInfo.companyName}
                  onChange={(e) => setOrganizationInfo(prev => ({ ...prev, companyName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">관리자 이메일</label>
                <input
                  type="email"
                  value={organizationInfo.adminEmail}
                  onChange={(e) => setOrganizationInfo(prev => ({ ...prev, adminEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
                <input
                  type="tel"
                  value={organizationInfo.phoneNumber}
                  onChange={(e) => setOrganizationInfo(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
              >
                저장
              </button>
            </form>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">사용자 관리</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap">
                사용자 초대
              </button>
            </div>

            <div className="space-y-4">
              {profile && (
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-blue-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{profile.full_name || '사용자'}</p>
                      <p className="text-sm text-gray-600">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      profile.role === 'admin' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {profile.role === 'admin' ? '관리자' : '멤버'}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <i className="ri-more-2-line"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
