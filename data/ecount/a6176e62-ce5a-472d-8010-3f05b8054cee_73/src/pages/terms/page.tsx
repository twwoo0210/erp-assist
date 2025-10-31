
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navigation from '../../components/feature/Navigation';
import Footer from '../../components/feature/Footer';

export default function TermsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "이용약관 - ERP Assist";
    
    const updateMetaTags = () => {
      const existingMeta = document.querySelectorAll('meta[name="description"], meta[name="keywords"], meta[property^="og:"], meta[name="twitter:"]');
      existingMeta.forEach(tag => tag.remove());

      const metaTags = [
        { name: 'description', content: 'ERP Assist 이용약관. 서비스 이용에 관한 조건과 규정을 안내합니다.' },
        { name: 'keywords', content: '이용약관, 서비스 약관, 이용조건, 서비스 규정' },
        { property: 'og:title', content: '이용약관 - ERP Assist' },
        { property: 'og:description', content: 'ERP Assist 이용약관. 서비스 이용에 관한 조건과 규정을 안내합니다.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: `${import.meta.env.VITE_SITE_URL || 'https://example.com'}/terms` }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">이용약관</h1>
        
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제1조 (목적)</h2>
            <p className="text-gray-700">
              이 약관은 ERP Assist(이하 "회사")가 제공하는 AI 기반 ERP 자동화 솔루션 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 이용자의 권리, 의무, 책임사항과 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제2조 (정의)</h2>
            <p className="text-gray-700 mb-4">이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>"서비스"라 함은 회사가 제공하는 AI 기반 ERP 자동화 솔루션을 의미합니다.</li>
              <li>"이용자"라 함은 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 의미합니다.</li>
              <li>"회원"이라 함은 회사에 개인정보를 제공하여 회원등록을 한 자로서, 회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 이용할 수 있는 자를 의미합니다.</li>
              <li>"비회원"이라 함은 회원에 가입하지 않고 회사가 제공하는 서비스를 이용하는 자를 의미합니다.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제3조 (약관의 효력 및 변경)</h2>
            <p className="text-gray-700 mb-4">
              1. 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.
            </p>
            <p className="text-gray-700 mb-4">
              2. 회사는 필요하다고 인정되는 경우 이 약관을 변경할 수 있으며, 회사가 약관을 변경할 경우에는 적용일자 및 변경사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제4조 (서비스의 제공 및 변경)</h2>
            <p className="text-gray-700 mb-4">
              1. 회사는 다음과 같은 업무를 수행합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>AI 자연어 처리를 통한 주문 데이터 자동 변환</li>
              <li>기존 ERP 시스템과의 연동 서비스</li>
              <li>실시간 경영 대시보드 제공</li>
              <li>업무 자동화 및 효율성 개선 솔루션</li>
              <li>기타 회사가 정하는 업무</li>
            </ul>
            <p className="text-gray-700 mt-4">
              2. 회사는 서비스의 품질 향상을 위해 서비스의 내용을 변경할 수 있으며, 변경 시에는 사전에 공지합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제5조 (서비스의 중단)</h2>
            <p className="text-gray-700 mb-4">
              1. 회사는 컴퓨터 등 정보통신설비의 보수점검·교체 및 고장, 통신의 두절 등의 사유가 발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
            </p>
            <p className="text-gray-700">
              2. 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 배상하지 않습니다. 단, 회사의 고의 또는 중과실에 의한 경우에는 그러하지 아니합니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제6조 (회원가입)</h2>
            <p className="text-gray-700 mb-4">
              1. 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.
            </p>
            <p className="text-gray-700 mb-4">
              2. 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
              <li>등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
              <li>기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제7조 (회원탈퇴 및 자격 상실 등)</h2>
            <p className="text-gray-700 mb-4">
              1. 회원은 회사에 언제든지 탈퇴를 요청할 수 있으며 회사는 즉시 회원탈퇴를 처리합니다.
            </p>
            <p className="text-gray-700 mb-4">
              2. 회원이 다음 각 호의 사유에 해당하는 경우, 회사는 회원자격을 제한 및 정지시킬 수 있습니다.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>가입 신청 시에 허위 내용을 등록한 경우</li>
              <li>다른 사람의 서비스 이용을 방해하거나 그 정보를 도용하는 등 전자상거래 질서를 위협하는 경우</li>
              <li>서비스를 이용하여 법령 또는 이 약관이 금지하거나 공서양속에 반하는 행위를 하는 경우</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제8조 (이용자의 의무)</h2>
            <p className="text-gray-700 mb-4">이용자는 다음 행위를 하여서는 안 됩니다.</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>신청 또는 변경 시 허위 내용의 등록</li>
              <li>타인의 정보 도용</li>
              <li>회사가 게시한 정보의 변경</li>
              <li>회사가 정한 정보 이외의 정보(컴퓨터 프로그램 등) 등의 송신 또는 게시</li>
              <li>회사 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
              <li>회사 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
              <li>외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제9조 (저작권의 귀속 및 이용제한)</h2>
            <p className="text-gray-700 mb-4">
              1. 회사가 작성한 저작물에 대한 저작권 기타 지적재산권은 회사에 귀속합니다.
            </p>
            <p className="text-gray-700">
              2. 이용자는 서비스를 이용함으로써 얻은 정보 중 회사에게 지적재산권이 귀속된 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안됩니다.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">제10조 (분쟁해결)</h2>
            <p className="text-gray-700 mb-4">
              1. 회사는 이용자가 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 피해보상처리기구를 설치·운영합니다.
            </p>
            <p className="text-gray-700">
              2. 회사와 이용자 간에 발생한 전자상거래 분쟁에 관한 소송은 서울중앙지방법원을 관할 법원으로 합니다.
            </p>
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
