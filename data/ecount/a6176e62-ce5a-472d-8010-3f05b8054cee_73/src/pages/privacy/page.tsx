
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';

export default function PrivacyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "개인정보처리방침 - ERP Assist";
    
    const updateMetaTags = () => {
      const existingMeta = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"]');
      existingMeta.forEach(tag => tag.remove());

      const metaTags = [
        { name: 'description', content: 'ERP Assist 개인정보처리방침. 고객의 개인정보 보호를 위한 정책과 처리 방침을 안내합니다.' },
        { name: 'keywords', content: '개인정보처리방침, 개인정보보호, 정보보안, 데이터 보호' },
        { property: 'og:title', content: '개인정보처리방침 - ERP Assist' },
        { property: 'og:description', content: 'ERP Assist 개인정보처리방침. 고객의 개인정보 보호를 위한 정책과 처리 방침을 안내합니다.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/privacy` }
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
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">개인정보처리방침</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-8">
            ERP Assist(이하 "회사")는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (개인정보의 처리목적)</h2>
            <p className="text-gray-700 mb-4">회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>서비스 제공 및 계약의 이행</li>
              <li>회원 관리 및 본인 확인</li>
              <li>고객 상담 및 불만 처리</li>
              <li>서비스 개선 및 신규 서비스 개발</li>
              <li>마케팅 및 광고에의 활용</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (개인정보의 처리 및 보유기간)</h2>
            <p className="text-gray-700 mb-4">회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>회원 정보: 회원 탈퇴 시까지</li>
              <li>상담 기록: 상담 완료 후 3년</li>
              <li>계약 관련 정보: 계약 종료 후 5년</li>
              <li>결제 정보: 결제 완료 후 5년</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (개인정보의 제3자 제공)</h2>
            <p className="text-gray-700 mb-4">회사는 정보주체의 개인정보를 제1조(개인정보의 처리목적)에서 명시한 범위 내에서만 처리하며, 정보주체의 동의, 법률의 특별한 규정 등 개인정보보호법 제17조 및 제18조에 해당하는 경우에만 개인정보를 제3자에게 제공합니다.</p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (개인정보처리의 위탁)</h2>
            <p className="text-gray-700 mb-4">회사는 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다.</p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700"><strong>수탁업체:</strong> 클라우드 서비스 제공업체</p>
              <p className="text-gray-700"><strong>위탁업무:</strong> 데이터 저장 및 관리</p>
              <p className="text-gray-700"><strong>보유기간:</strong> 위탁계약 종료 시까지</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (정보주체의 권리·의무 및 행사방법)</h2>
            <p className="text-gray-700 mb-4">정보주체는 회사에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>개인정보 처리현황 통지요구</li>
              <li>개인정보 열람요구</li>
              <li>개인정보 정정·삭제요구</li>
              <li>개인정보 처리정지요구</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (개인정보의 안전성 확보조치)</h2>
            <p className="text-gray-700 mb-4">회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>관리적 조치: 내부관리계획 수립·시행, 정기적 직원 교육 등</li>
              <li>기술적 조치: 개인정보처리시스템 등의 접근권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치</li>
              <li>물리적 조치: 전산실, 자료보관실 등의 접근통제</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (개인정보보호책임자)</h2>
            <div className="bg-blue-50 p-6 rounded-lg">
              <p className="text-gray-700 mb-2"><strong>개인정보보호책임자</strong></p>
              <p className="text-gray-700">성명: 홍길동</p>
              <p className="text-gray-700">직책: 개인정보보호책임자</p>
              <p className="text-gray-700">연락처: 02-1234-5678</p>
              <p className="text-gray-700">이메일: privacy@erpassist.co.kr</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (개인정보처리방침 변경)</h2>
            <p className="text-gray-700">이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
          </section>

          <div className="bg-gray-100 p-6 rounded-lg mt-8">
            <p className="text-gray-700 text-center">
              <strong>시행일자: 2024년 1월 1일</strong>
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
