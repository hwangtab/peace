# peace 프로젝트 작업 지침

## Supabase — 반드시 CLI로

Supabase DB 조회·수정은 **MCP가 아니라 Supabase CLI(또는 psql / service role 키)** 로 직접 한다.

- MCP Supabase 도구는 연결된 일부 프로젝트만 노출해서, 이 레포의 Supabase(`jmelvfcluezlhdxewger` — 백서·회원·게시판)가 목록에 안 잡힌다. "권한 밖"이 아니라 MCP 한계다.
- supabase CLI는 이미 link됨(`supabase/.temp/project-ref`).
- service role 키 취득: `supabase projects api-keys --project-ref jmelvfcluezlhdxewger`
- 임의 SQL/데이터: service_role 키 + `@supabase/supabase-js`(설치됨) 스크립트, 또는 psql connection string. `.env.local`엔 anon 키만 있으니 service role은 CLI로 가져온다.
- 관리자 백서: `admin_documents` 테이블, slug `camp-2026-whitepaper`, `body_md` 컬럼. `/admin/whitepaper`가 렌더.

## 브라우저 검증 — chrome-devtools MCP

브라우저 자동화·시각 검증·성능 측정은 **chrome-devtools MCP만** 쓴다. Playwright(및 Playwright MCP)는 이 레포에서 쓰지 않는다.

- 스크린샷·DOM 점검: `mcp__chrome-devtools__navigate_page` → `take_snapshot` / `take_screenshot`
- 성능(LCP·CLS·INP): `performance_start_trace` → `performance_stop_trace` → `performance_analyze_insight`, Lighthouse는 `lighthouse_audit`
- 콘솔·네트워크 확인: `list_console_messages`, `list_network_requests`
- 로그인 세션이 필요한 페이지 조회나 여러 페이지 루프 점검은 `aside-browser` 스킬, 공개 페이지 대량 수집은 `crawl4ai` 스킬.
- 산출물(스크린샷 등)은 레포 루트가 아니라 스크래치패드에 남긴다. 루트 `/*.png`는 `.gitignore` 처리됨.

### 스크린샷은 최후의 수단 — 토큰 비용 때문

스크린샷 한 장이 수천 토큰이다. 확인하려는 것이 **수치로 판정 가능하면 스크린샷을 찍지 말고 `evaluate_script`로 숫자를 뽑는다.**

- 스크립트로 측정할 것: 정렬·좌우 여백(`getBoundingClientRect`), 섹션 간격, 가로 오버플로(`scrollWidth > clientWidth`), 색 대비(`getComputedStyle`), 요소 존재·개수, 폰트 크기. 표로 정리하면 스크린샷보다 정확하고 훨씬 싸다.
- Aside(`aside-browser`)에 맡길 것: 로그인 세션이 필요한 페이지, "보기에 어떤가"를 사람 눈으로 판단해야 하는 심미 검토, 여러 페이지 순회. **요약만 받는다**(이미지를 이쪽 컨텍스트로 끌어오지 않는다).
- 직접 스크린샷을 찍는 경우: 위 둘로 안 되는 시각 확인이 꼭 필요할 때만. 전체 페이지(`fullPage`) 캡처는 특히 비싸니 뷰포트 단위로, `format: 'jpeg'` + `quality` 낮춰서 찍는다.

## 기타

- 의존성은 **pnpm**. `package.json` 변경 시 `pnpm-lock.yaml` 함께 커밋(안 하면 Vercel 빌드 실패).
- 커밋 전 **prettier** 필수(CI에 `format:check` 있음).
- 작업 완료 후 `git push origin main`.
