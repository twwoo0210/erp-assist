# Ecount API 키 설정 가이드

## GitHub Secrets 설정

다음 Secrets를 GitHub 저장소에 설정해야 합니다:

1. **ECOUNT_API_KEY**: `476ea37c56ee24a94bb57d22a867b40400`
2. **ECOUNT_COMPANY_CODE**: `678106` (또는 실제 회사코드)
3. **ECOUNT_USER_ID**: `EYTY_` (또는 실제 사용자 ID)

## 설정 방법

1. GitHub 저장소로 이동: https://github.com/twwoo0210/erp-assist
2. Settings > Secrets and variables > Actions 클릭
3. "New repository secret" 클릭
4. 다음 Secrets 추가:
   - Name: `ECOUNT_API_KEY`, Value: `476ea37c56ee24a94bb57d22a867b40400`
   - Name: `ECOUNT_COMPANY_CODE`, Value: `678106`
   - Name: `ECOUNT_USER_ID`, Value: `EYTY_`

## 확인

Secrets 설정 후, GitHub Actions 워크플로가 자동으로 실행되어 Supabase Edge Functions에 Secrets가 설정됩니다.

워크플로 실행 확인:
- https://github.com/twwoo0210/erp-assist/actions

## Edge Function 테스트

Secrets 설정 후:
1. https://twwoo0210.github.io/erp-assist/settings/ecount 접속
2. 회사코드: `678106`, 사용자 ID: `EYTY_` 입력
3. "연결 테스트" 클릭

## API 매뉴얼 참고

- 엔드포인트: `http://sboapi.ecount.com/login`
- 메서드: `POST`
- Content-Type: `application/json`
- 요청 본문:
  ```json
  {
    "company_code": "678106",
    "user_id": "EYTY_",
    "api_key": "476ea37c56ee24a94bb57d22a867b40400"
  }
  ```
- 성공 응답:
  ```json
  {
    "session_id": "...",
    "status": "200"
  }
  ```

