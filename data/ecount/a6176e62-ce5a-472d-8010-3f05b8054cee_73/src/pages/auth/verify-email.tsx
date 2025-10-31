import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../utils/supabase';

export default function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const emailFromState = location.state?.email;
    if (emailFromState) {
      setEmail(emailFromState);
    } else {
      // 이메일 정보가 없으면 회원가입 페이지로 리다이렉트
      navigate('/auth/register');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResendEmail = async () => {
    if (!email || resending || countdown > 0) return;

    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });

      if (error) throw error;

      setResent(true);
      setCountdown(60); // 60초 쿨다운
    } catch (error: any) {
      console.error('이메일 재발송 실패:', error);
      alert('이메일 재발송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <i className="ri-mail-line text-2xl text-blue-600"></i>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            이메일 인증
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            회원가입을 완료하려면 이메일 인증이 필요합니다
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center space-y-6">
            <div>
              <p className="text-sm text-gray-600">
                다음 이메일로 인증 링크를 발송했습니다:
              </p>
              <p className="mt-1 text-sm font-medium text-gray-900 break-all">
                {email}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <i className="ri-information-line text-blue-400"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    인증 방법
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ol className="list-decimal list-inside space-y-1">
                      <li>이메일 받은편지함을 확인하세요</li>
                      <li>인증 링크를 클릭하세요</li>
                      <li>자동으로 로그인 페이지로 이동됩니다</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {resent && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                인증 이메일을 다시 발송했습니다.
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleResendEmail}
                disabled={resending || countdown > 0}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {resending ? (
                  '발송 중...'
                ) : countdown > 0 ? (
                  `다시 발송 (${countdown}초 후)`
                ) : (
                  '인증 이메일 다시 발송'
                )}
              </button>

              <div className="text-center text-sm text-gray-500">
                이메일이 오지 않나요? 스팸함도 확인해보세요.
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  다른 이메일로 가입하시겠습니까?
                </p>
                <Link
                  to="/auth/register"
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  회원가입 다시 하기
                </Link>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/auth/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                로그인 페이지로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}