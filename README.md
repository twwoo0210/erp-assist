# ERP Assist - 풀스택 웹 애플리케이션

이카운트 ERP와 연동하는 AI 기반 주문 입력 시스템 - Cloudflare Pages에서 실행되는 풀스택 웹 애플리케이션

## 프로젝트 개요

- **이름**: ERP Assist
- **목표**: 자연어로 주문 내용을 입력하면 AI가 자동으로 파싱하여 이카운트 ERP에 전표를 생성하는 시스템
- **주요 기능**:
  - AI 기반 자연어 주문 파싱
  - 품목 자동 매칭
  - 이카운트 ERP 전표 자동 생성
  - 실시간 대시보드
  - 다국어 지원 (한국어/영어)

## 현재 구현된 기능

### ✅ 완료된 기능
1. **Hono 백엔드 API**
   - `/api/health` - 헬스 체크
   - `/api/ai-parse-order` - AI 주문 파싱 (Gemini API 사용)
   - `/api/ecount-create-order` - 이카운트 전표 생성 시뮬레이션

2. **React 프론트엔드**
   - AI 채팅 인터페이스
   - 주문 입력 페이지
   - 대시보드
   - 설정 페이지
   - 인증 시스템 (Supabase Auth)

3. **통합 기능**
   - Supabase Functions에서 Hono API로 마이그레이션 완료
   - Cloudflare Pages 배포 준비 완료
   - 로컬 개발 환경 구성

### 🚧 아직 구현되지 않은 기능
1. 실제 이카운트 ERP API 연동 (현재는 시뮬레이션)
2. Supabase 데이터베이스 연동 (인증 제외)
3. 주문 로그 저장 기능
4. 실시간 알림 기능

## 기술 스택

### Frontend
- **React 19** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Tailwind CSS** - 스타일링
- **React Router** - 라우팅
- **i18next** - 다국어 지원
- **Vite** - 빌드 도구

### Backend
- **Hono** - Edge 프레임워크
- **Cloudflare Workers** - 서버리스 런타임
- **Gemini API** - AI 자연어 처리
- **Supabase** - 인증 (선택사항)

### Development & Deployment
- **Wrangler** - Cloudflare 개발 도구
- **PM2** - 프로세스 관리 (로컬 개발)
- **esbuild** - Functions 빌드

## 현재 API 엔드포인트

### 헬스 체크
```
GET /api/health
```

### AI 주문 파싱
```
POST /api/ai-parse-order
Content-Type: application/json

{
  "inputText": "A거래처, 깐쇼새우 100개, 새우볼 50개"
}
```

**응답 예시:**
```json
{
  "customer_name": "A거래처",
  "items": [
    {
      "item_name": "깐쇼새우",
      "qty": 100,
      "matched_item": {
        "code": "A-001",
        "name": "깐쇼새우 1kg",
        "price": 5000,
        "unit": "개"
      },
      "confidence": 0.95
    }
  ]
}
```

### 전표 생성
```
POST /api/ecount-create-order
Content-Type: application/json

{
  "orderData": {
    "customer_name": "A거래처",
    "items": [...]
  }
}
```

## 로컬 개발 환경 설정

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env` 파일 생성:
```env
# Supabase (optional)
VITE_PUBLIC_SUPABASE_URL=
VITE_PUBLIC_SUPABASE_ANON_KEY=

# Feature flags
VITE_FEATURE_AI_CHAT=true

# API Base URL
VITE_API_BASE_URL=/api
```

### 3. 빌드
```bash
npm run build
```

### 4. 로컬 서버 시작
```bash
# PM2를 사용한 개발 서버
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# 또는 wrangler 직접 사용
npx wrangler pages dev dist --ip 0.0.0.0 --port 3000
```

### 5. 테스트
```bash
# API 테스트
curl http://localhost:3000/api/health

# 웹 브라우저에서
open http://localhost:3000
```

## 샌드박스 환경 URL

- **메인 페이지**: https://3000-if5a4z7oqjo08gdccwhoh-ad490db5.sandbox.novita.ai
- **API 헬스 체크**: https://3000-if5a4z7oqjo08gdccwhoh-ad490db5.sandbox.novita.ai/api/health

## 프로젝트 구조

```
webapp/
├── functions/              # Cloudflare Functions
│   └── [[api]].ts         # API 라우트 (Hono)
├── src/                   # React 프론트엔드
│   ├── pages/            # 페이지 컴포넌트
│   │   ├── chat/         # AI 채팅 페이지
│   │   ├── dashboard/    # 대시보드
│   │   ├── orders/       # 주문 관리
│   │   └── settings/     # 설정
│   ├── components/       # 공통 컴포넌트
│   ├── hooks/           # React Hooks
│   ├── utils/           # 유틸리티
│   │   ├── api.ts       # API 클라이언트
│   │   └── supabase.ts  # Supabase 클라이언트
│   └── i18n/            # 다국어 지원
├── public/              # 정적 파일
├── dist/                # 빌드 출력
├── build.sh             # 빌드 스크립트
├── ecosystem.config.cjs # PM2 설정
├── wrangler.jsonc       # Cloudflare 설정
├── vite.config.ts       # Vite 설정
└── package.json         # 프로젝트 설정
```

## 주요 변경 사항

### Supabase Functions → Hono API 마이그레이션
- ✅ `ai-parse-order` - AI 주문 파싱 API로 변환
- ✅ `ecount-create-order` - 전표 생성 API로 변환
- ✅ 프론트엔드 API 호출 로직 업데이트

### 빌드 시스템 개선
- 클라이언트 빌드 (Vite)와 Functions 빌드 (esbuild) 통합
- `build.sh` 스크립트로 원스텝 빌드

### 배포 준비
- Cloudflare Pages 구조로 변환
- `_worker.js` 및 `_routes.json` 자동 생성
- PM2를 이용한 로컬 개발 환경

## 다음 개발 단계

### 단기 목표
1. **실제 이카운트 API 연동**
   - API 인증 설정
   - 품목 검색 API 연동
   - 전표 생성 API 연동

2. **Cloudflare Pages 배포**
   - 프로덕션 환경 설정
   - 커스텀 도메인 연결

3. **데이터 영속성**
   - Cloudflare D1 데이터베이스 설정
   - 주문 로그 저장 기능

### 장기 목표
1. **고급 AI 기능**
   - 품목 추천 시스템
   - 주문 패턴 분석
   - 자동 가격 제안

2. **통합 기능**
   - 이메일 알림
   - Slack/Teams 연동
   - 모바일 앱 지원

3. **엔터프라이즈 기능**
   - 멀티테넌트 지원
   - 역할 기반 권한 관리
   - 상세 로깅 및 감사

## 배포 상태

- **플랫폼**: Cloudflare Pages (준비 완료)
- **상태**: ✅ 로컬 테스트 완료
- **샌드박스**: ✅ 활성
- **프로덕션**: ⏳ 배포 대기

## 기여 가이드

1. 이 저장소를 포크합니다
2. 새 기능 브랜치를 만듭니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다

## 라이선스

이 프로젝트는 MIT 라이선스 하에 공개됩니다.

## 지원 및 문의

- GitHub Issues: https://github.com/twwoo0210/erp-assist/issues
- 샌드박스 데모: https://3000-if5a4z7oqjo08gdccwhoh-ad490db5.sandbox.novita.ai

---

**마지막 업데이트**: 2025-11-04
**버전**: 1.0.0 (Cloudflare Pages 풀스택 버전)
