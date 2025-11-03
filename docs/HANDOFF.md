# Handoff: ERP Assist (GitHub Pages + E2E + MCP)

## ë§í¬

- Live: https://twwoo0210.github.io/erp-assist
- GitHub: https://github.com/twwoo0210/erp-assist

## ?„ì¬ ?íƒœ

- ???˜ë“œ?? ë¡œê·¸?„ì›ƒ ???¸ì…˜/?„ë¡œ??ì¡°ì§ ì´ˆê¸°????`/auth/login` ë¦¬ë‹¤?´ë ‰??- ë¹„ì¸ì¦?ì²´í—˜ ì§„ì…: ?°ëª¨?ì„œ ë¹„ë¡œê·¸ì¸ ??ë¡œê·¸???˜ì´ì§€ë¡?? ë„
- ì²?¬ ?ëŸ¬ ì²˜ë¦¬: ì²?¬ ë¡œë“œ ?¤íŒ¨ ???ˆë¡œê³ ì¹¨ ? ë„(ìºì‹œ ë¬´ë ¥??ì¿¼ë¦¬ ?¬í•¨)
- ?¼ìš°?? `BrowserRouter`??`__BASE_PATH__` ?ìš©, Vite `BASE_PATH`ë¡?ì£¼ì…
- Pages ë°°í¬: `dist`??out` ?´ë™, `out/404.html` ?ì„±(SPA ?´ë°±)
- E2E(Playwright): ?¼ì´ë¸??˜ì´ì§€ ?€?ìœ¼ë¡??¤ëª¨??2ì¼€?´ìŠ¤(???Œë”, /dashboard ??/auth/login)

## ?¨ì? ?´ìŠˆ ?”ì•½

- ë¸Œë¼?°ì? ìºì‹œê°€ ?´ì „ ë²ˆë“¤???œê³µ?˜ëŠ” ê°„í—???„ìƒ ??`?nocache=...`ë¡?ê°•ì œ ê°±ì‹ 
- Supabase Auth ë¦¬ë‹¤?´ë ‰??URL ?¤ì •???œë¸Œ?¨ìŠ¤(`/erp-assist`) ë¯¸ë°˜????ë¡œê·¸???¤í”¼??ë¯¸ì™„ë£?ë¦¬ë‹¤?´ë ‰??- IDE??MCP Playwright ?œë²„ ?¤í–‰ ëª…ë ¹???˜ëª»?˜ì–´(?¨í‚¤ì§€ëª??¤ë¥˜) "program not found" ë°œìƒ ê°€??
## ?„ìš”???¸ë? ?¤ì • (Supabase)

Supabase Dashboard ??Authentication ??URL Configuration

- Site URL: `https://twwoo0210.github.io/erp-assist`
- Additional Redirect URLs: `https://twwoo0210.github.io/erp-assist`
- Allow Cross-Origin Auth Origins: `https://twwoo0210.github.io`

?¤ì • ë°˜ì˜ ?? ???œí¬ë¦?ì°½ìœ¼ë¡??¬ê?ì¦í•˜?¸ìš”.

## ê²€ì¦??œë‚˜ë¦¬ì˜¤ (ìºì‹œ ë¬´ë ¥??

- ???„ë¼?´ë¹—(?œí¬ë¦? ì°½ì—???‘ì†:
  - `https://twwoo0210.github.io/erp-assist/?nocache=TIMESTAMP`
  - `https://twwoo0210.github.io/erp-assist/dashboard?nocache=TIMESTAMP`
- ê¸°ë? ê²°ê³¼:
  - ?¥ë§???•ìƒ ë¶€??SPA 404 ?´ë°± ?‘ë™)
  - ë¹„ì¸ì¦?`/dashboard` ?‘ê·¼ ??`/auth/login`?¼ë¡œ ?´ë™

ë¬¸ì œ ì§€???? ì½˜ì†”/?¤íŠ¸?Œí¬ ë¡œê·¸ ê³µìœ :

- Console: Supabase/Auth/ChunkLoadError ë©”ì‹œì§€
- Network: `/erp-assist/assets/page-*.js` ?¤íŒ¨ ?”ì²­(URL/?íƒœì½”ë“œ)

## ë°°í¬/CI

- ?Œí¬?Œë¡œ: `.github/workflows/pages.yml`
  - `BASE_PATH=/erp-assist/`ë¡?ë¹Œë“œ
  - `dist`??out` ?´ë™ ??`out/404.html` ?ì„±?˜ì—¬ SPA ?´ë°± ë³´ì¥
  - Supabase env ë¯¸ì„¤????ë¹Œë“œ ?¨ê³„?ì„œ ?¤íŒ¨?˜ë„ë¡??¬ì „ ê²€ì¦?- ?¸ì‹œ/?¸ë¦¬ê±? `main` ?¸ì‹œ ?ëŠ” ?˜ë™ ?¤í–‰

## ë¡œì»¬ ê°œë°œ/ë¹Œë“œ

```bash
npm ci
BASE_PATH=/erp-assist/ npm run build
# ê²°ê³¼: dist/
```

## E2E (Playwright) ë¡œì»¬ ?¤í–‰

```bash
cd .work/erp-assist
npx -y @playwright/test@latest install
npx -y @playwright/test@latest tests/smoke.spec.ts --reporter=dot
# ê¸°ë?: "2 passed"
```

## MCP Playwright ?œë²„ (IDE ?µí•©)

?ëŸ¬: "MCP client for playwright failed to start: program not found" ë°œìƒ ?? ?„ë˜ ?¨í‚¤ì§€ëª…ìœ¼ë¡??¤í–‰?˜ì„¸??

- ?¬ë°”ë¥?ëª…ë ¹: `npx mcp-server-playwright --help`
- (?˜ëª»???ˆì‹œ) `@modelcontextprotocol/server-playwright` ??ì¡´ì¬?˜ì? ?ŠìŒ

ê¶Œì¥ ?¤í–‰ ?•íƒœ:

```bash
# Windows PowerShell (?„ë¡œ?íŠ¸ ë£¨íŠ¸?ì„œ)
npx mcp-server-playwright --help

# ?„ìš” ??ë¸Œë¼?°ì? ?¤ì¹˜
npx playwright install

# IDE?ì„œ MCP ?œë²„ ì»¤ë§¨???¤ì • ?ˆì‹œ
# command: npx
# args: mcp-server-playwright
# cwd: C:\Users\twwoo\OneDrive\backup\?…ë¬´\Code\.work\erp-assist
# env (?µì…˜): PLAYWRIGHT_BROWSERS_PATH=0

# ê°™ì? ?¸ì—??npx ?•ì¸
npx mcp-server-playwright --help
```

PATHê°€ ê¼¬ì¸ ê²½ìš°:

- Windows PowerShell: ``$env:Path = "$PWD\node_modules\.bin;$env:Path"``
- WSL: `export PATH="$PWD/node_modules/.bin:$PATH"`

## ?´ì˜ ì²´í¬ë¦¬ìŠ¤??
- [ ] Supabase Auth URL/Origins ?¤ì • ë°˜ì˜
- [ ] Pages ë°°í¬ ?Œí¬?Œë¡œ ?±ê³µ ??`Actions` ?•ì¸
- [ ] ?œí¬ë¦?ì°½ì—???¥ë§??ë¦¬ë‹¤?´ë ‰???•ìƒ ?™ì‘ ?•ì¸
- [ ] E2E ?¤ëª¨??ë¡œì»¬/CI) ?µê³¼
- [ ] IDE?ì„œ MCP ?œë²„(`npx mcp-server-playwright`) ?•ìƒ ê¸°ë™

## ì°¸ê³  ?Œì¼

- ?? `src/App.tsx`, `src/components/common/ChunkErrorBoundary.tsx`, `src/hooks/useAuth.ts`, `src/components/feature/Navigation.tsx`
- ?°ëª¨: `src/pages/demo/page.tsx`
- ?Œí¬?Œë¡œ: `.github/workflows/pages.yml`, `.github/workflows/e2e.yml`
- ?ŒìŠ¤?? `tests/smoke.spec.ts`



## Ecount ¿¬µ¿ (ÇÊ¼ö ¼³Á¤)

1) Supabase Project Secrets (Project ¡æ Settings ¡æ Configuration ¡æ Secrets)

- ECOUNT_COMPANY_CODE = (È¸»ç ÄÚµå)
- ECOUNT_USER_ID = (»ç¿ëÀÚ ID)
- ECOUNT_API_KEY = (API Å° ¶Ç´Â ºñ¹Ğ¹øÈ£)

2) Edge Functions ¹èÆ÷ (±ÇÀå)

- ÇÊ¼ö ÇÔ¼ö: ensure-ecount-connection, ecount-login, ecount-sales-create, ecount-items-search, suggest-items
- supabase CLI »ç¿ë ¿¹½Ã:

```
supabase login                           # ¾×¼¼½º ÅäÅ« ÇÊ¿ä
supabase link --project-ref <PROJECT_REF>
supabase functions deploy ensure-ecount-connection
supabase functions deploy ecount-login
supabase functions deploy ecount-sales-create
supabase functions deploy ecount-items-search
supabase functions deploy suggest-items
```

3) ÃÖ¼Ò Å×ÀÌºí(ÀÌ¹Ì ÀÖ´Ù¸é »ı·«)

- profiles(id, org_id¡¦), organizations(id, name¡¦), ecount_connections(org_id, connection_name, status, company_code, ecount_user_id, masked_api_key_suffix, last_session_id, updated_at), api_logs, ecount_logs, ecount_sessions

4) ¾Û ³» ¿¬µ¿ °æ·Î

- ¼³Á¤ ¡æ Ecount ¿¬°á ÆäÀÌÁö¿¡¼­ ÇöÀç ¿¬°á »óÅÂ Á¶È¸ ¹× "¿¬°á Å×½ºÆ®" ¼öÇà
- ÇÁ·ĞÆ®´Â ensure-ecount-connection ÇÔ¼ö¸¦ È£ÃâÇØ ¼¼¼ÇÀ» ¹ß±Ş/°ËÁõÇÏ°í »óÅÂ ½º³À¼¦À» °»½ÅÇÕ´Ï´Ù.

5) ¹®Á¦ ¹ß»ı ½Ã

- Functions ·Î±×: Supabase Studio ¡æ Logs ¡æ Edge Functions
- DB ½ºÅ°¸¶: SQL Editor·Î Å×ÀÌºí/±ÇÇÑ È®ÀÎ
- Secrets °ª º¯°æ ½Ã ´ÙÀ½ È£ÃâºÎÅÍ ¹İ¿µµÊ
