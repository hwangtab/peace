# peace 전면 버그 감사 보고서

날짜: 2026-07-03 · 방식: 10차원 발견(Sonnet) → 발견별 2렌즈 적대 검증(Sonnet) → 근본원인 종합(Fable)
규모: 에이전트 44개, 도구 호출 845회, 약 16분 · 발견 15건 전원 CONFIRMED(검증 반박 생존) + 기준선 3건

> 이 보고서는 **수정 없이 보고만** 한다. 각 근본원인의 수정은 승인 후 별도 진행(실작업 Opus 위임).

## 요약 — 근본원인 10개

| # | 근본원인 | 심각도 | 해소되는 증상 |
|---|---------|--------|--------------|
| R1 | main CI 빨간불 — stale 테스트 2건 | **긴급(프로세스)** | 품질 게이트 복구 |
| R2 | 비동기 완료 콜백이 현재 UI 컨텍스트를 검증 안 함 | HIGH | 3건 + lint 3건 |
| R3 | 메일 발송이 HTTP 요청 수명·비원자성에 묶임 | HIGH | 2건 (타임아웃·중복발송) |
| R4 | 미저장 편집 보호(dirty guard) 부재 | MEDIUM | 2건 |
| R5 | DB 권한 변경과 클라이언트 호출부 계약 불일치 | MEDIUM | 1건 (2차원 중복 발견 병합) |
| R6 | 실패 경로가 1급 상태가 아님 (onError·403 무시) | MEDIUM | 2건 |
| R7 | `new Date('YYYY-MM-DD')` UTC 파싱 함정 | MEDIUM | 1건 (hydration mismatch) |
| R8 | 인증 플로우 경계 경로 미처리 | MEDIUM | 2건 |
| R9 | sitemap lastmod — 얕은 클론에서 git log 오판 | MEDIUM | 1건 |
| R10 | dev 의존성 취약점 12건 (prod 0건) | LOW | Dependabot 경고 해소 |

---

## R1. main CI 빨간불 — stale 테스트 (긴급)

- **증상**: 커밋 150c3ffb(videos/press 정적 JSON SSOT 이전, 7/3 07:25) 이후 main의 GitHub Actions가 계속 실패. `src/lib/archivePublicData.test.ts`의 2개 테스트가 "videos는 CMS(archive_videos)에서 조회한다"는 폐기된 계약을 여전히 검증.
- **영향**: Vercel 배포는 CI와 분리돼 사이트는 정상이지만, CI가 빨간불인 동안 이후 모든 커밋의 회귀가 게이트 없이 통과한다. 실제로 이 감사의 설계 문서 커밋도 같은 이유로 "실패"로 찍혔다.
- **근본 수정**: 해당 테스트 2건을 정적 SSOT 계약(정적 JSON에서 로드, CMS 미조회)으로 재작성. CMS 병합 로직이 press에만 남았다면 press 기준으로 테스트 이전.
- **재발 방지**: 리팩터링 커밋 전 `pnpm test` 로컬 실행 원칙(작업 지침에 이미 있는 prettier와 동급으로 승격).

## R2. 비동기 완료 콜백이 현재 UI 컨텍스트를 검증하지 않음 (경쟁 조건군)

같은 습관에서 나온 결함 3건 + lint 경고 3건. 완료 콜백이 "응답이 도착한 지금도 그 작업의 컨텍스트가 유효한가"를 확인하지 않는다.

| 발견 | 위치 | 심각도 | 증상 |
|------|------|--------|------|
| 저장 응답이 다른 항목 편집을 덮어씀 | [AdminCollectionPage.tsx:421](../../../src/components/admin/AdminCollectionPage.tsx#L421) | HIGH | A 저장 중 B 편집 시작 → A 응답 도착 시 B 입력 내용 소실 (hideSelected·cloneMissingLocales도 동일) |
| 필터 응답 순서 역전 | [ComposePanel.tsx:26](../../../src/components/admin/mailbox/ComposePanel.tsx#L26) | HIGH | 그룹 필터 연속 변경 시 이전 필터의 명단이 최종 표시 → **전체선택 발송 시 다른 그룹에게 메일 발송** |
| 댓글 저장이 다른 댓글 편집창을 닫음 | [CommentSection.tsx:183](../../../src/components/board/CommentSection.tsx#L183) | MEDIUM | A 저장 완료 시 무조건 cancelEdit() → B 수정 세션·입력 소실 |
| lint 경고 3건 (fetch-on-mount setState) | NotificationBell.tsx:41, ComposePanel.tsx:41, ContactsPanel.tsx:25 | LOW | react-hooks/set-state-in-effect |

- **근본 수정**: 공용 패턴 도입 — ① 요청 시퀀스 토큰 또는 AbortController를 내장한 데이터 패칭 훅, ② 완료 콜백에서 `selected?.id === requestedId` / `editId === commentId` 대조 후에만 상태 반영. admin·board의 해당 콜백 전수 적용.
- **재발 방지**: 훅 도입 후 직접 fetch→setState 패턴을 리뷰 체크리스트에 등재.

## R3. 메일 발송이 HTTP 요청 수명·비원자성에 묶임

| 발견 | 위치 | 심각도 | 증상 |
|------|------|--------|------|
| 대량 발송 타임아웃 | [send.ts:78](../../../pages/api/admin/mailbox/send.ts#L78) + [mailBroadcast.ts](../../../src/lib/mailBroadcast.ts) | HIGH | 수신자당 600ms 스로틀 순차 루프를 응답 전에 완주 → 15명 이상이면 함수 실행 제한 초과, 어디까지 발송됐는지 알 수 없음. MAX_RECIPIENTS=500인데 maxDuration 설정 없음 |
| 발송 성공+기록 실패 = 실패로 위장 | [reply.ts:96](../../../pages/api/admin/mailbox/reply.ts#L96) | MEDIUM | 메일은 이미 나갔는데 500 반환 → 관리자가 재전송하면 **중복 발송** |

- **근본 수정(설계)**: 발송을 요청 수명에서 분리 — 청크 단위 발송 + 진행 커서를 DB에 저장해 이어보내기(클라이언트가 반복 호출), 함수 `maxDuration` 명시. 응답 스키마에 `sent/failed/recorded` 구분과 resend_id를 담아 "발송됨·기록만 실패"를 클라이언트가 구별. 재시도에 멱등성 키.
- **선택지**: (a) 청크+커서 방식(구조 단순, Vercel 순정) vs (b) Vercel Queues/백그라운드 잡(깔끔하지만 신규 인프라). 승인 시 결정 필요.

## R4. 미저장 편집 보호(dirty guard) 부재

| 발견 | 위치 | 증상 |
|------|------|------|
| 필터·언어 변경이 편집 내용 파괴 | [AdminCollectionPage.tsx:334](../../../src/components/admin/AdminCollectionPage.tsx#L334) | 편집 중 필터 변경 → router.push + key 리마운트로 입력 전량 소실 |
| 백서 회차 변경 동일 | [whitepaper.tsx:111](../../../pages/admin/whitepaper.tsx#L111) | 편집 중 회차 변경 → 마크다운 본문 소실 |

- **근본 수정**: 공용 `useUnsavedChangesGuard` 훅 — form dirty 시 ① 페이지 내 네비게이션(필터·언어·회차) 전 confirm ② `routeChangeStart`·`beforeunload` 가드. admin 편집 화면 전체 적용.

## R5. DB 권한 변경과 클라이언트 계약 불일치 — 익명 조회수 회귀

- **위치**: [pages/board/[slug]/[postId]/index.tsx:58](../../../pages/board/%5Bslug%5D/%5BpostId%5D/index.tsx#L58) — 두 차원(supabase-data, auth-board-flows)에서 독립적으로 발견되어 병합.
- **증상**: 조회수 조작 방지 마이그레이션(6/29)이 `increment_post_view`의 anon 실행권한을 회수했는데, 클라이언트는 여전히 로그인 여부와 무관하게 호출 → 비로그인 조회는 매번 조용한 403, **익명 방문 조회수가 집계되지 않는 회귀**. `.error`도 확인하지 않아 어디에도 드러나지 않음.
- **근본 수정 — 방향 결정 필요**: (a) 익명 집계 포기 확정 → 로그인 사용자만 rpc 호출하도록 가드 + 의도 주석. (b) 익명 집계 복원 → API 라우트 경유 서버측 호출(rate limit 포함)로 재설계.
- **재발 방지**: Supabase 마이그레이션으로 권한·정책을 바꿀 때 호출부 grep을 체크리스트화. rpc 호출은 `.error` 최소 로깅.

## R6. 실패 경로가 1급 상태가 아님

| 발견 | 위치 | 증상 |
|------|------|------|
| 이미지 onError 부재 | [GalleryImageItem.tsx:47](../../../src/components/gallery/GalleryImageItem.tsx#L47) | 깨진 이미지 → 영구 스켈레톤 펄스(대체 UI 없음) |
| viewer 역할 403 무한 폴링 | [AdminLayout.tsx:69](../../../src/components/admin/AdminLayout.tsx#L69) | viewer에게도 NotificationBell 렌더 → 60초마다 403, 조용히 무시 |

- **근본 수정**: GalleryImageItem에 onError → 스켈레톤 해제 + 대체 표시. AdminLayout은 member.role로 벨 렌더 분기(editor 이상).

## R7. `new Date('YYYY-MM-DD')` UTC 파싱 함정

- **위치**: [VideoDetailPage.tsx:63](../../../src/pages/VideoDetailPage.tsx#L63)
- **증상**: 서버(UTC)와 서구권 브라우저의 날짜 계산이 달라 hydration 직후 발행일이 하루 어긋난 값으로 교체됨.
- **맥락**: [CampHero.tsx:29-36](../../../src/components/camp/CampHero.tsx#L29-L36)에 이미 올바른 우회 패턴이 주석과 함께 존재. VideoCard는 suppressHydrationWarning으로 임시 방어만.
- **근본 수정**: CampHero의 패턴을 공용 util(`parseLocalDate`/`formatDateLocalized`)로 승격하고 날짜 표시처 전수 교체(리터럴 `new Date('` grep으로 잔여 사용처 확인).

## R8. 인증 플로우 경계 경로 미처리

| 발견 | 위치 | 증상 |
|------|------|------|
| 만료 재설정 링크 무안내 | [update-password.tsx:35](../../../pages/update-password.tsx#L35) | 만료/사용된 링크여도 정상 폼 노출 → 제출 후에야 무의미한 일반 오류 |
| login self-redirect | [login.tsx:35](../../../pages/login.tsx#L35) + [memberAuth.ts:33-39](../../../src/lib/memberAuth.ts#L33-L39) | `?next=/login`이면 로그인 성공 후 다시 로그인 폼 → 실패로 오인 |

- **근본 수정**: ① confirm.tsx에 이미 있는 "code 교환 실패 → 만료 안내 + 재요청 유도" 패턴을 update-password에 이식, 세션 사전 점검. ② `safeRedirectPath`가 `/login`·`/signup` 등 인증 페이지를 기본 목적지로 치환 + login 페이지에 "이미 로그인 → 리다이렉트" 가드.

## R9. sitemap lastmod — 얕은 클론에서 git log 오판

- **위치**: [next-sitemap.config.js:71](../../../next-sitemap.config.js#L71)
- **증상**: 얕은 클론(depth 1)에선 `git log -1 -- <file>`이 모든 파일에 루트 커밋을 반환 → sitemap.xml의 전 페이지 lastmod가 빌드 시점 커밋 날짜로 동일하게 찍힘 (SEO 신호 왜곡). 로컬 depth-1 클론으로 재현 확인됨.
- **근본 수정**: getGitLastmod에 "결과가 HEAD(루트) 커밋이며 저장소가 shallow면 신뢰하지 않고 mtime fallback" 검증 추가, 또는 빌드 환경 fetch-depth 조정. Vercel의 실제 클론 깊이 확인 후 결정.

## R10. dev 의존성 취약점 12건 (프로덕션 0건)

`pnpm audit --prod`는 **통과** — 12건 전부 devDependencies 경유라 배포 사이트 런타임에는 미포함. GitHub 경고 해소용 정비 건.

| 패키지 | 심각도 | 유입 경로 |
|--------|--------|----------|
| undici ×7 | high 3 · moderate 2 · low 2 | open-graph-scraper |
| ws | high | puppeteer, jest-environment-jsdom, @next/bundle-analyzer |
| form-data | high | jest-environment-jsdom |
| js-yaml | moderate | eslint 계열, jest, puppeteer |

- **근본 수정**: Dependabot PR 수용 + 해결 안 되는 전이 의존성은 `pnpm-workspace.yaml` overrides (기존 정책과 동일 경로).

---

## 재발 방지 게이트 제안

1. **CI green 상시 유지** — R1 복구가 선행. 이후 main 빨간불을 즉시 대응 대상으로 취급.
2. **마이그레이션-호출부 계약 체크** — Supabase 권한·정책 변경 시 해당 함수/테이블 호출부 grep을 필수 단계로.
3. **날짜 리터럴 가드** — 공용 date util 도입 후 `new Date('` 문자열 리터럴 사용을 lint/grep 체크로 차단.
4. **데이터 패칭 훅 표준화** — R2 훅 도입 후 컴포넌트 직접 fetch→setState를 리뷰에서 반려.
5. **API 응답 스키마에 부분 성공 표현** — 외부 부수효과(메일 등)가 있는 라우트는 sent/recorded 구분 필드 의무화.

## 커버리지 공백 (이번 감사가 못 본 곳)

- **실 브라우저 런타임 감사 제외** (설계 시 합의) — 콘솔 에러·깨진 링크·실제 hydration 검증은 별도 회차.
- `src/components/common/ImageLightbox.tsx`(라이트박스 인덱스 경계) — 차원 경계에 걸려 미검토.
- `pages/admin/board-posts.tsx`의 게시글·댓글 관리 상태 훅 상세.
- `adminMembers.ts`의 `listUsers({perPage:1000})` — 회원 1,000명 초과 시 조용한 절단 (현재 5명이라 발현 안 함, 성장 시 재검토).
- admin CMS 원본 테이블(archive_videos 등)의 RLS 실물 — 공개 경로가 정적 JSON으로 전환돼 우선순위 낮음.
- 프로덕션 환경변수 실값(설문 백엔드 KOSMART vs 메인 Supabase 라우팅) — 코드 정적 확인만.

## 수정 결과 (2026-07-04 완료)

전 클러스터 승인 후 3개 웨이브(Opus 서브에이전트)로 수정 완료. **근본원인 10개 전부 해소.**

| 클러스터 | 커밋 | 비고 |
| -------- | ---- | ---- |
| R1 | 87981af3 + c6470d89 + 6418a0f6 | CI 빨간불 원인은 3중이었음(stale 테스트 + prettier 미포맷 + R8 타입 에러) — 전부 해소, CI 초록 복귀 |
| R2 | 7762df1f | selectedIdRef/editIdRef 컨텍스트 대조 + AbortController |
| R3 | da27b98e | mail_broadcast_jobs 테이블(DB 적용됨) + 청크 8명/커서 + 멱등 2중 + reply recorded:false |
| R4 | f738370f | useUnsavedChangesGuard 훅 신설(routeChangeStart·beforeunload·1회용 bypass) |
| R5 | c0d38e45 | POST /api/board/view (service role 경유, IP+postId 60초 rate limit) |
| R6 | e889f8ec | 갤러리 onError 대체 표시, viewer 벨 미렌더+403 폴링 중단 |
| R7 | edf60e96 | src/utils/date.ts (parseLocalDate/formatDateLocalized) 신설, 사용처 통일 |
| R8 | f676090b | authLinkErrorFromUrl·isAuthSessionMissingError·safeRedirectPath 인증페이지 배제, 13로케일 키 3개 |
| R9 | 4ab428ec | isShallowRepo 감지 → mtime fallback |
| R10 | 041448ad | pnpm overrides — pnpm audit 0건 |

최종 게이트: typecheck 0 에러 · lint 0 에러(경고 4 — admin fetch-on-mount 잔여) · jest 43 스위트 338 테스트 전부 통과 · format:check 통과 · pnpm audit 0건 · i18n parity 100%.

## 다음 단계 (승인 대기)

1. **R1 즉시 수정 승인** — CI 게이트 복구가 다른 모든 수정의 전제.
2. **R5 방향 결정** — 익명 조회수 (a) 포기 확정 vs (b) API 경유 복원.
3. **R3 설계 선택** — (a) 청크+진행 커서 vs (b) Vercel Queues.
4. 나머지(R2·R4·R6·R7·R8·R9·R10) 일괄 수정 승인 — Opus 서브에이전트로 근본원인 단위 배분, 클러스터당 1커밋.
