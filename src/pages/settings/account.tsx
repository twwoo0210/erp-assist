import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../utils/supabase';

export default function AccountSettingsPage() {
  const { user, profile, organization, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ecountStatus, setEcountStatus] = useState<any>(null);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    if (profile?.org_id) {
      loadEcountStatus();
      loadRecentLogs();
    }
  }, [profile]);

  const loadEcountStatus = async () => {
    try {
      const { data } = await supabase
        .from('ecount_connections')
        .select('*')
        .eq('org_id', profile.org_id)
        .eq('connection_name', 'primary')
        .single();

      setEcountStatus(data);
    } catch (error) {
      console.error('Ecount 상태 조회 실패:', error);
    }
  };

  const loadRecentLogs = async () => {
    try {
      const { data } = await supabase
        .from('api_logs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setRecentLogs(data || []);
    } catch (error) {
      console.error('로그 조회 실패:', error);
    }
  };

  const testEcountConnection = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('로그인이 필요합니다.');
        return;
      }

      const { data, error } = await supabase.functions.invoke('ecount-connection-test', {
        headers: {
          Authorization: `Bearer ${session.access_token}`
        },
        body: {
          company_code: ecountStatus?.company_code || '',
          ecount_user_id: ecountStatus?.ecount_user_id || ''
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        alert('Ecount 연결 테스트 성공!');
        await loadEcountStatus();
        await loadRecentLogs();
      } else {
        alert(`Ecount 연결 테스트 실패: ${data?.error || '알 수 없는 오류'}`);
      }
    } catch (error: any) {
      console.error('연결 테스트 실패:', error);
      alert(`연결 테스트 실패: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '연결됨';
      case 'inactive': return '비활성';
      case 'error': return '오류';
      default: return '알 수 없음';
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">계정 설정</h1>
        <p className="mt-1 text-sm text-gray-600">
          계정 정보와 연결 상태를 확인하고 관리하세요
        </p>
      </div>

      <div className="space-y-6">
        {/* 프로필 정보 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              프로필 정보
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">이름</label>
                <p className="mt-1 text-sm text-gray-900">{profile?.full_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">이메일</label>
                <p className="mt-1 text-sm text-gray-900">{profile?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">휴대폰</label>
                <p className="mt-1 text-sm text-gray-900">{profile?.phone || '미등록'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">권한</label>
                <p className="mt-1 text-sm text-gray-900">
                  {profile?.role === 'owner' ? '소유자' : 
                   profile?.role === 'admin' ? '관리자' : '멤버'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 조직 정보 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              조직 정보
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">회사명</label>
                <p className="mt-1 text-sm text-gray-900">{organization?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">업종</label>
                <p className="mt-1 text-sm text-gray-900">{organization?.industry || '미설정'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">생성일</label>
                <p className="mt-1 text-sm text-gray-900">
                  {organization?.created_at ? new Date(organization.created_at).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ecount 연결 상태 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Ecount 연결 상태
              </h3>
              <button
                onClick={testEcountConnection}
                disabled={loading}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 whitespace-nowrap"
              >
                {loading ? '테스트 중...' : '연결 테스트'}
              </button>
            </div>

            {ecountStatus ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">연결 상태</label>
                  <span className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ecountStatus.status)}`}>
                    {getStatusText(ecountStatus.status)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">마지막 업데이트</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(ecountStatus.updated_at).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">연결명</label>
                  <p className="mt-1 text-sm text-gray-900">{ecountStatus.connection_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Zone</label>
                  <p className="mt-1 text-sm text-gray-900">{ecountStatus.zone || '기본'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">연결 정보를 불러오는 중...</p>
            )}
          </div>
        </div>

        {/* 최근 API 호출 로그 */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              최근 API 호출 로그
            </h3>
            
            {recentLogs.length > 0 ? (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        함수명
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        시간
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {log.fn}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            log.status === 200 ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500">최근 API 호출 기록이 없습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}