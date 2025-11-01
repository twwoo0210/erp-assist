# Handoff: ERP Assist (GitHub Pages + E2E + MCP)

## 링크

- Live: https://twwoo0210.github.io/erp-assist
- GitHub: https://github.com/twwoo0210/erp-assist

## 현재 상태

- 앱 하드닝: 로그아웃 시 세션/프로필/조직 초기화 후 `/auth/login` 리다이렉트
- 비인증 체험 진입: 데모에서 비로그인 시 로그인 페이지로 유도
- 청크 에러 처리: 청크 로드 실패 시 새로고침 유도(캐시 무력화 쿼리 포함)
- 라우팅: `BrowserRouter`에 `__BASE_PATH__` 적용, Vite `BASE_PATH`로 주입
- Pages 배포: `dist`→`out` 이동, `out/404.html` 생성(SPA 폴백)
- E2E(Playwright): 라이브 페이지 대상으로 스모크 2케이스(홈 렌더, /dashboard → /auth/login)

## 남은 이슈 요약

- 브라우저 캐시가 이전 번들을 제공하는 간헐적 현상 → `?nocache=...`로 강제 갱신
- Supabase Auth 리다이렉트 URL 설정이 서브패스(`/erp-assist`) 미반영 시 로그인 스피너/미완료 리다이렉트
- IDE의 MCP Playwright 서버 실행 명령이 잘못되어(패키지명 오류) "program not found" 발생 가능

## 필요한 외부 설정 (Supabase)

Supabase Dashboard → Authentication → URL Configuration

- Site URL: `https://twwoo0210.github.io/erp-assist`
- Additional Redirect URLs: `https://twwoo0210.github.io/erp-assist`
- Allow Cross-Origin Auth Origins: `https://twwoo0210.github.io`

설정 반영 후, 새 시크릿 창으로 재검증하세요.

## 검증 시나리오 (캐시 무력화)

- 새 프라이빗(시크릿) 창에서 접속:
  - `https://twwoo0210.github.io/erp-assist/?nocache=TIMESTAMP`
  - `https://twwoo0210.github.io/erp-assist/dashboard?nocache=TIMESTAMP`
- 기대 결과:
  - 딥링크 정상 부팅(SPA 404 폴백 작동)
  - 비인증 `/dashboard` 접근 시 `/auth/login`으로 이동

문제 지속 시, 콘솔/네트워크 로그 공유:

- Console: Supabase/Auth/ChunkLoadError 메시지
- Network: `/erp-assist/assets/page-*.js` 실패 요청(URL/상태코드)

## 배포/CI

- 워크플로: `.github/workflows/pages.yml`
  - `BASE_PATH=/erp-assist/`로 빌드
  - `dist`→`out` 이동 후 `out/404.html` 생성하여 SPA 폴백 보장
  - Supabase env 미설정 시 빌드 단계에서 실패하도록 사전 검증
- 푸시/트리거: `main` 푸시 또는 수동 실행

## 로컬 개발/빌드

```bash
npm ci
BASE_PATH=/erp-assist/ npm run build
# 결과: dist/
```

## E2E (Playwright) 로컬 실행

```bash
cd .work/erp-assist
npx -y @playwright/test@latest install
npx -y @playwright/test@latest tests/smoke.spec.ts --reporter=dot
# 기대: "2 passed"
```

## MCP Playwright 서버 (IDE 통합)

에러: "MCP client for playwright failed to start: program not found" 발생 시, 아래 패키지명으로 실행하세요.

- 올바른 명령: `npx mcp-server-playwright --help`
- (잘못된 예시) `@modelcontextprotocol/server-playwright` → 존재하지 않음

권장 실행 형태:

```bash
# Windows PowerShell (프로젝트 루트에서)
npx mcp-server-playwright --help

# 필요 시 브라우저 설치
npx playwright install

# IDE에서 MCP 서버 커맨드 설정 예시
# command: npx
# args: mcp-server-playwright
# cwd: C:\Users\twwoo\OneDrive\backup\업무\Code\.work\erp-assist
# env (옵션): PLAYWRIGHT_BROWSERS_PATH=0

# 같은 셸에서 npx 확인
npx mcp-server-playwright --help
```

PATH가 꼬인 경우:

- Windows PowerShell: ``$env:Path = "$PWD\node_modules\.bin;$env:Path"``
- WSL: `export PATH="$PWD/node_modules/.bin:$PATH"`

## 운영 체크리스트

- [ ] Supabase Auth URL/Origins 설정 반영
- [ ] Pages 배포 워크플로 성공 → `Actions` 확인
- [ ] 시크릿 창에서 딥링크/리다이렉트 정상 동작 확인
- [ ] E2E 스모크(로컬/CI) 통과
- [ ] IDE에서 MCP 서버(`npx mcp-server-playwright`) 정상 기동

## 참고 파일

- 앱: `src/App.tsx`, `src/components/common/ChunkErrorBoundary.tsx`, `src/hooks/useAuth.ts`, `src/components/feature/Navigation.tsx`
- 데모: `src/pages/demo/page.tsx`
- 워크플로: `.github/workflows/pages.yml`, `.github/workflows/e2e.yml`
- 테스트: `tests/smoke.spec.ts`

