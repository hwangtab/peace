# peace 전면 버그 감사 체계 설계

날짜: 2026-07-03 · 상태: 승인됨 · 방식: 멀티에이전트 워크플로

## 목표

peaceandmusic.net(Next.js 16 Pages Router, 364 TS/TSX 파일, API 23개, 13로케일, Supabase)의
잠복 버그·충돌을 전수 발굴하고, 증상 나열이 아니라 **근본원인 단위의 수정 설계**로 보고한다.

## 범위 / 비범위

- **포함**: ① 코드 정적 감사(React·페이지·API) ② 데이터·인프라 감사(Supabase RLS·egress·CSP·환경변수) ③ 빌드·의존성 감사(next.config·scripts·patches·CI·취약점)
- **제외**: 실 브라우저 런타임 크롤링(Playwright E2E) — 별도 회차로 분리
- **수정 정책**: 이번 회차는 **보고만** 한다. 모든 수정은 보고서 승인 후 별도 진행.

## 기준선 (감사 전 이미 확인된 결함)

- `jest` 2건 실패 — `src/lib/archivePublicData.test.ts`가 videos 정적 JSON SSOT 이전(커밋 150c3ffb)을 미반영
- `eslint` 경고 3건 — `ContactsPanel.tsx` 등 effect 내 동기 setState
- Vercel 프로덕션 런타임 에러 최근 7일 0건 (단, 클라이언트 사이드 에러는 미집계 사각지대)

## 아키텍처 — 3단계

### 1단계 발견 (Find) — 차원별 전담 에이전트 10개 병렬

| # | 차원 | 대상 | 관점 |
|---|------|------|------|
| 1 | react-admin-board | src/components/{admin,auth,board} + src/hooks + src/context | 상태·effect·경쟁조건·낙관적 업데이트 |
| 2 | react-content-a | src/components/{home,camp,layout,common,shared,icons} | 렌더 로직·조건부 훅·메모리 누수 |
| 3 | react-content-b | src/components/{album,gallery,musicians,press,solidarity,timeline,tracks,videos} | 미디어 로딩·이벤트 해제·인덱스 경계 |
| 4 | pages-public | pages 루트 16개 + camps/album/solidarity/photographers/videos | getStaticProps 실패 경로·hydration 불일치·fallback |
| 5 | auth-board-flows | pages/{auth,board}, account/login/signup/reset·update-password + 관련 lib | 세션 만료·리다이렉트 루프·권한 우회 |
| 6 | admin-pages | pages/admin 15개 | 인가 가드 누락·CMS 쓰기 경로 |
| 7 | api-routes | pages/api 23개 전수 | zod 검증 누락·에러 응답 일관성·인증·메서드 가드 |
| 8 | supabase-data | src/lib supabase 계층 + RLS 정책 실물(CLI 조회) | RLS 구멍·service role 노출·egress 재발 패턴 |
| 9 | i18n | public/locales 13로케일 + ns 등록 3곳 규칙 | 키 누락·ns 미등록(빌드 실패 리스크)·RTL |
| 10 | build-deps | next.config.js·scripts/·patches/·.github/workflows·pnpm audit·CSP | 빌드 파이프라인 취약 고리·의존성 취약점·CSP 화이트리스트 정합 |

각 발견은 구조화 스키마로 반환: `{file, line, symptom, repro, severity(critical|high|medium|low), rootCauseGuess}`.

### 2단계 검증 (Verify) — 발견별 적대적 반박 2렌즈

발견마다 독립 에이전트 2개가 각각 다른 렌즈로 **반박을 시도**한다:
렌즈 A = 재현 가능성(코드 재독해로 실제 도달 가능한 경로인가), 렌즈 B = 실제 영향(도달해도 사용자 관측 가능한 결함인가).

- 둘 다 반박 실패 → `CONFIRMED`
- 하나만 반박 → `PLAUSIBLE` (보고서에 단서 달아 포함)
- 둘 다 반박 → 폐기

검증 전 파일:라인 기준 중복 제거. 차원별 파이프라인 — 한 차원의 검증은 다른 차원의 발견 완료를 기다리지 않는다.

### 3단계 종합 (Synthesize) — 메인 세션에서 근본원인 클러스터링

검증 통과 발견을 메인 세션(고성능 모델)이 근본원인으로 묶는다.
산출 단위: `{근본원인, 수정 설계, 해소되는 증상 목록, 심각도, 재발 방지 게이트}`.

## 실행 규칙

- 위임 에이전트(발견·검증)는 Sonnet, 종합·판단은 메인 세션 — 작업 분담 정책 준수
- Supabase 조회는 MCP가 아닌 CLI/service role 키 — CLAUDE.md 규칙
- 에이전트 실패(null)는 버리지 않고 보고서에 "커버리지 공백"으로 명시
- 발견 수 상한 없음 — 잘라내면 로그로 알린다 (침묵 절단 금지)

## 산출물

1. **버그 대장** — 심각도순, 파일:라인 링크, CONFIRMED/PLAUSIBLE 딱지
2. **근본원인별 수정 설계** — 원인 1개당 "이렇게 고치면 증상 N개 해소" 구조
3. **재발 방지 게이트 제안** — CI에 추가할 검사 목록
4. 보고서 파일: `docs/superpowers/audits/2026-07-03-full-bug-audit-report.md`

## 성공 기준

- 10개 차원 전부 커버리지 공백 없이 완료 (공백 발생 시 명시)
- 보고서의 모든 CONFIRMED 항목이 파일:라인으로 재현 경로를 특정
- 기준선 결함 3건이 보고서에 근본원인과 함께 합류
