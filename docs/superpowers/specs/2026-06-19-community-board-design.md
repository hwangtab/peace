# 다중 게시판(커뮤니티) 설계 (Phase 2)

작성일: 2026-06-19
대상 저장소: `hwangtab/peace` (PUBLIC), Next.js pages router, Supabase
선행: 회원 시스템 Phase 1 ([2026-06-19-membership-auth-design.md](2026-06-19-membership-auth-design.md)) — `profiles`, `AuthProvider`/`useAuth`, member auth.

## 1. 목적과 범위

로그인 회원이 글을 쓰고 읽는 다중 게시판을 만든다. 보드는 관리자 CMS로 관리하고,
초기 보드 3개를 시드한다. 후기 보드에는 별점을 켠다.

- **이번 범위(Phase 2)**: boards(admin 관리) + posts CRUD(제목/본문/이미지 다중/별점) +
  댓글 + 좋아요 + 공개 목록·상세 + 권한 RLS. 아래 D의 단계로 순차 구현.
- 회원 시스템(Phase 1) 위에 올라간다. `profiles.id`가 글/댓글 작성자.

### 확정된 결정 사항
- **형태**: 다중 게시판(보드별 글 목록).
- **보드 관리**: 관리자 CMS(`boards` 테이블 + /admin UI). 기존 `AdminCollectionPage` 패턴 재사용.
- **기능**: 이미지 첨부(글당 다중), 댓글, 별점(보드별 토글), 좋아요(회원당 1회).
- **권한**: 읽기=공개, 작성=로그인 회원, 수정·삭제=작성자 본인, 모더레이션=admin.
- **별점**: 보드별 `has_rating` 토글. 후기 보드만 켬.
- **이미지**: 글당 여러 장. Supabase Storage 신규 비공개→공개 URL 버킷 `board-images`.
- **초기 보드 3개 시드**: 후기(`reviews`, 별점 ON), 자유게시판(`free`), 공연 소식(`shows`, 다른 공연 정보 공유). 이후 보드는 admin이 추가.
- **i18n**: 게시판 UI는 ko/en만 실제 번역(신규 `board` namespace, 나머지 11 로케일은 영어 사본 — `fallbackLng:false` 대응). 글 본문은 사용자 작성이라 언어 무관.

## 2. 데이터 모델 (4개 신규 테이블 + 1 조인)

### 2.1 `public.boards`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid PK default gen_random_uuid() | |
| `slug` | text unique not null | URL 식별자, `^[a-z0-9-]+$` |
| `name` | text not null | 표시명 |
| `description` | text | |
| `sort_order` | int not null default 0 | |
| `has_rating` | boolean not null default false | 별점 사용 보드 |
| `is_active` | boolean not null default true | 비활성 시 공개 목록에서 숨김 |
| `created_at`/`updated_at` | timestamptz default now() | `set_updated_at` 트리거 |

### 2.2 `public.posts`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid PK | |
| `board_id` | uuid not null → boards(id) on delete cascade | |
| `author_id` | uuid not null → profiles(id) on delete cascade | |
| `title` | text not null | 1~120자 check |
| `body` | text not null default '' | |
| `rating` | int | nullable, 1~5 check; 후기 보드에서만 사용 |
| `status` | text not null default 'published' | check in ('published','hidden') — 모더레이션 |
| `like_count` | int not null default 0 | post_likes 트리거로 동기화 |
| `created_at`/`updated_at` | timestamptz | |
- 인덱스: `(board_id, status, created_at desc)`.

### 2.3 `public.post_images`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid PK | |
| `post_id` | uuid not null → posts(id) on delete cascade | |
| `image_url` | text not null | http(s) 또는 / 경로 |
| `sort_order` | int not null default 0 | |

### 2.4 `public.post_comments`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `id` | uuid PK | |
| `post_id` | uuid not null → posts(id) on delete cascade | |
| `author_id` | uuid not null → profiles(id) on delete cascade | |
| `body` | text not null | 1~1000자 check |
| `status` | text not null default 'published' | check in ('published','hidden') |
| `created_at`/`updated_at` | timestamptz | |
- 인덱스: `(post_id, created_at)`.

### 2.5 `public.post_likes`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| `post_id` | uuid not null → posts(id) on delete cascade | |
| `user_id` | uuid not null → profiles(id) on delete cascade | |
| `created_at` | timestamptz default now() | |
- PK: `(post_id, user_id)` — 회원당 1회.
- 트리거 `sync_post_like_count`(AFTER INSERT/DELETE): `posts.like_count`를 갱신.

### 2.6 초기 시드 (마이그레이션)
```sql
insert into public.boards (slug, name, description, sort_order, has_rating) values
  ('reviews', '후기', '캠프·공연 후기를 나눠요', 1, true),
  ('free',    '자유게시판', '자유롭게 이야기하는 공간', 2, false),
  ('shows',   '공연 소식', '다른 공연·행사 소식을 공유해요', 3, false)
on conflict (slug) do nothing;
```

## 3. 보안 (RLS)

헬퍼 재사용: `is_active_admin()`, `admin_can_edit()` (회원/admin 마이그레이션에서 정의됨).
`auth.uid()`로 작성자 판별. anon은 published 읽기만.

- **boards**: select = `is_active or is_active_admin()`; insert/update/delete = `admin_can_edit()`.
- **posts**: 
  - select = `status='published' or author_id = auth.uid() or is_active_admin()`
  - insert = `auth.uid() is not null and author_id = auth.uid()` (로그인 회원, 본인 명의)
  - update = `author_id = auth.uid() or is_active_admin()` (본인 또는 모더레이션)
  - delete = `author_id = auth.uid() or is_active_admin()`
- **post_images**: select = 공개(부모 글이 보이면); insert/update/delete = 부모 글의 작성자 또는 admin. (정책은 `exists(select 1 from posts p where p.id = post_id and (p.author_id = auth.uid() or is_active_admin()))`)
- **post_comments**: select = `status='published' or author_id = auth.uid() or is_active_admin()`; insert = 로그인 본인; update/delete = 작성자 또는 admin.
- **post_likes**: select = 공개; insert/delete = 본인(`user_id = auth.uid()`)만.
- grant: anon select(boards/posts/post_images/post_comments/post_likes); authenticated select+insert+update+delete(정책으로 제한). storage `board-images` 버킷은 authenticated upload, 공개 read.

## 4. 페이지 (공개, `board` i18n namespace ko/en)

| 경로 | 동작 |
|---|---|
| `/board` | 활성 보드 목록(이름/설명/글 수) |
| `/board/[slug]` | 보드 글 목록(페이지네이션, 최신순; 별점 보드는 평균/별점 표시), "글쓰기"(로그인 시) |
| `/board/[slug]/new` | 글 작성(제목/본문/이미지 업로드/별점[보드 has_rating 시]). 로그인 가드 |
| `/board/[slug]/[postId]` | 글 상세 + 이미지 + 좋아요 버튼 + 댓글 목록·작성. 작성자에게 수정/삭제 |
| `/board/[slug]/[postId]/edit` | 글 수정(작성자/admin) |

- 데이터 로딩: 공개 목록/상세는 `getServerSideProps`(SSR, anon Supabase 클라이언트 — SEO + 공개 노출). 작성/수정/삭제/좋아요/댓글 등 변경은 클라이언트 `supabaseBrowser`(세션). new/edit 폼은 클라 가드(`useAuth`).
- 작성자 표시: `profiles.nickname` 조인.
- admin 모더레이션: 기존 `/admin`에 **전용 경량 페이지** 2개 — `/admin/boards`(보드 CRUD: 이름·slug·설명·정렬·has_rating·is_active)와 `/admin/board-posts`(글/댓글 목록 + 숨김 토글). boards는 archive 컬렉션과 구조가 달라(`public_id`/`locale` 없음) 기존 `AdminCollectionPage`를 재사용하지 않고 전용 페이지로 만든다. AdminLayout NAV에 admin_can_edit 이상에게 노출.

## 5. 컴포넌트 / 파일 경계
- `supabase/migrations/<ts>_community_board.sql` (테이블·RLS·트리거·시드·스토리지 버킷)
- `src/types/board.ts` (`Board`, `Post`, `PostImage`, `PostComment` 타입)
- `src/lib/boardData.ts` (공개 조회: 보드/글/댓글 로드 — anon 클라, 회원 archivePublicData 패턴 참고)
- `src/lib/boardForms.ts` (제목/본문/댓글/별점 검증 — 순수 로직, 테스트 대상)
- `src/components/board/*` (PostList, PostCard, PostDetail, CommentList, LikeButton, ImageUploader, RatingInput/Stars)
- `pages/board/*` (위 경로들)
- `public/locales/<lc>/board.json` (13 로케일)
- admin: `boards`를 `ADMIN_COLLECTION_CONFIGS`에 추가(또는 전용 admin 페이지) + posts/comments 모더레이션 페이지

## 6. 단계 분해 (plan에서 순차)
- **2A 코어**: 마이그레이션(boards/posts/post_images + RLS + 시드 + 버킷), boardForms(테스트), 공개 보드/글 목록·상세·작성·수정·삭제, 이미지 업로드, 별점(보드 토글), admin boards 관리.
- **2B 댓글**: post_comments(테이블/RLS) + 상세 댓글 UI + 모더레이션.
- **2C 좋아요**: post_likes(테이블/RLS/트리거) + 좋아요 버튼 + like_count 표시.
- 각 단계는 그 자체로 동작·테스트 가능. typecheck/test/lint/build로 검증.

## 7. 에러 처리
- 미로그인 작성 시도 → `/login?next=<현재경로>`로 유도(safeRedirectPath 재사용).
- 권한 없는 수정/삭제 → RLS가 차단(0 rows), UI는 작성자에게만 버튼 노출.
- 이미지 업로드 실패/용량 초과(10MB) → 폼 메시지.
- 빈 제목/본문, 별점 범위, 댓글 길이 → boardForms 검증 + DB check.

## 8. 테스트 계획
- `boardForms` 순수 로직 단위 테스트(제목/본문/댓글/별점 경계, slug 형식).
- like_count 트리거는 마이그레이션 적용 후 SQL로 검증(insert/delete → count).
- 기존 테스트 회귀 + typecheck/lint + `next build`(신규 동적 라우트, board namespace parity).

## 9. 운영/배포 메모
- 마이그레이션 `supabase db push`로 원격 적용.
- Supabase Storage: `board-images` 버킷 생성(공개 read) — 마이그레이션 SQL 또는 대시보드.
- 레포 PUBLIC: 키/비밀 코드 미포함.

## 10. 비범위(YAGNI)
- 대댓글(중첩 댓글), 글 검색, 신고 기능, 알림, 무한스크롤, 리치 텍스트 에디터 — 이번 제외. 본문은 평문(+줄바꿈), 필요 시 후속.
