# ERP Assist

이카운트 ERP와 연동되는 AI 기반 전표 입력 시스템

## 기능

- **AI 전표 입력**: 자연어로 전표를 생성하고 이카운트 ERP에 자동 등록
- **대시보드**: 전표 처리 현황 및 통계 확인
- **실시간 연동**: Supabase를 통한 이카운트 ERP API 연동
- **다국어 지원**: 한국어/영어 인터페이스

## 기술 스택

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase Functions (Edge Runtime)
- **Build Tool**: Vite
- **State Management**: React Hooks
- **UI Components**: Lucide React Icons
- **Charts**: Recharts

## 주요 기능

### 1. AI 전표 입력 (Chat)
- 자연어로 전표 내용을 입력하면 AI가 자동으로 파싱
- 거래처, 품목, 수량 정보를 자동 추출
- 이카운트 ERP API를 통해 전표 자동 생성

### 2. 대시보드
- 오늘 처리된 전표 수량
- 등록된 품목 및 거래처 통계
- 처리 성공률 모니터링
- 최근 전표 입력 내역 조회

### 3. 설정 관리
- 이카운트 ERP API 설정
- 사용자 인증 정보 관리

## Supabase Functions

- `ai-parse-order`: AI를 통한 전표 내용 파싱
- `ecount-create-order`: 이카운트 ERP 전표 생성
- `ecount-sync`: 이카운트 데이터 동기화

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 미리보기
npm run preview
```

## 환경 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_ECOUNT_API_KEY=your_ecount_api_key
```

## 프로젝트 구조

```
src/
├── pages/          # 페이지 컴포넌트
│   ├── chat/       # AI 전표 입력 페이지
│   ├── dashboard/  # 대시보드 페이지
│   ├── home/       # 홈 페이지
│   └── settings/   # 설정 페이지
├── router/         # 라우팅 설정
├── i18n/           # 다국어 지원
└── components/     # 재사용 컴포넌트

supabase/
└── functions/      # Edge Functions
    ├── ai-parse-order/
    ├── ecount-create-order/
    └── ecount-sync/
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 제공됩니다.
