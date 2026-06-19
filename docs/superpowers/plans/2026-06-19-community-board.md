# 다중 게시판(커뮤니티) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 로그인 회원이 다중 게시판(후기/자유/공연 소식)에 글·이미지·별점·댓글·좋아요를 올리고, 관리자가 보드와 글을 관리하는 커뮤니티를 구축한다.

**Architecture:** 회원 시스템(Phase 1) 위에 `boards`/`posts`/`post_images`/`post_comments`/`post_likes` 테이블을 올린다. 공개 목록·상세는 SSR(anon Supabase), 변경 작업은 클라이언트 `supabaseBrowser`(세션) + RLS로 강제한다. 보드/모더레이션은 전용 admin 페이지로 관리한다.

**Tech Stack:** Next.js pages router, TypeScript, Supabase(@supabase/ssr), next-i18next, Tailwind, Jest.

## Global Constraints

- 저장소 PUBLIC — 비밀/키를 코드에 넣지 않고 기존 `NEXT_PUBLIC_SUPABASE_*` env만 사용.
- pnpm 프로젝트. 새 의존성 없음(이번 plan은 추가 의존성 불필요).
- 검증은 바이너리 직접 실행(로컬 pnpm 11↔store 충돌 회피): `node node_modules/typescript/bin/tsc --noEmit --pretty false`, `node node_modules/jest/bin/jest.js`, `node node_modules/eslint/bin/eslint.js src pages`, `node node_modules/next/dist/bin/next build`.
- 마이그레이션 원격 적용: `printf 'Y\n' | supabase db push`. 검증 쿼리: `supabase db query --linked --yes -o csv "..."`. 작업 브랜치 `codex/press-og-images`.
- next-i18next `fallbackLng:false`: 신규 `board` namespace는 13개 로케일 모두 키를 채운다(ko 한국어·en 영어 작성 후 나머지 11개에 en 복사).
- 세션 클라이언트는 `@/lib/supabaseBrowser`(`createSupabaseBrowserClient`)와 `@/lib/supabaseServer`(`createSupabaseServerClient`)만. 설문용 `src/lib/supabase.ts` 사용 금지.
- 기존 회원 패턴 재사용: 페이지 `getStaticProps`/`getServerSideProps`는 `serverSideTranslations(locale, [...,'translation'], nextI18NextConfig)`; 로그인 유도는 `safeRedirectPath` from `@/lib/memberAuth`; 세션 상태는 `useAuth`/`useOptionalAuth` from `@/components/auth/AuthProvider`; Tailwind 토큰 `jeju-ocean/deep-ocean/coastal-gray/sunset-coral/ocean-sand`.
- RLS 헬퍼 재사용: `is_active_admin()`, `admin_can_edit()`(기존 마이그레이션 정의). `public.set_updated_at()` 트리거 함수 재사용.
- 공개 이미지 업로드 패턴은 `src/components/admin/AdminCollectionPage.tsx`의 `uploadGalleryImage`(storage.from(bucket).upload → getPublicUrl)를 따른다. 단 버킷은 `board-images`, 업로더는 로그인 회원.

---

## File Structure

- `supabase/migrations/<ts>_community_board_core.sql` — boards/posts/post_images + RLS + 시드 + `board-images` 버킷/정책 (2A)
- `supabase/migrations/<ts>_community_board_comments.sql` — post_comments + RLS (2B)
- `supabase/migrations/<ts>_community_board_likes.sql` — post_likes + 트리거 + RLS (2C)
- `src/types/board.ts` — `Board`, `Post`, `PostImage`, `PostComment`, `PostWithMeta` 타입
- `src/lib/boardForms.ts` (+ `.test.ts`) — 순수 검증(title/body/comment/rating/slug)
- `src/lib/boardData.ts` — 공개 SSR 조회(보드 목록, 보드별 글, 글 상세+이미지+작성자, 댓글)
- `src/components/board/` — `PostCard.tsx`, `RatingStars.tsx`, `PostImageUploader.tsx`, `CommentSection.tsx`, `LikeButton.tsx`, `BoardShell.tsx`
- `pages/board/index.tsx`, `pages/board/[slug]/index.tsx`, `pages/board/[slug]/new.tsx`, `pages/board/[slug]/[postId]/index.tsx`, `pages/board/[slug]/[postId]/edit.tsx`
- `public/locales/<lc>/board.json` (13 로케일)
- `pages/admin/boards.tsx` (보드 CRUD), `pages/admin/board-posts.tsx` (글/댓글 모더레이션)
- `src/components/admin/AdminLayout.tsx` — NAV에 "게시판" 추가 (수정)

---

# 단계 2A — 코어 (보드 + 글 + 이미지 + 별점)

## Task 1: 코어 마이그레이션 (boards/posts/post_images + RLS + 시드 + 버킷)

**Files:** Create `supabase/migrations/<ts>_community_board_core.sql` (`<ts>` = `date +%Y%m%d%H%M%S`)

**Interfaces:**
- Produces: `public.boards`, `public.posts`, `public.post_images` 테이블 + RLS + 3개 보드 시드 + `board-images` 스토리지 버킷/정책. 후속 태스크가 이 스키마를 읽고 쓴다.

- [ ] **Step 1: 마이그레이션 SQL 작성**

```sql
-- Community boards (Phase 2A): boards, posts, post_images.
-- Reuses is_active_admin()/admin_can_edit()/set_updated_at() from earlier migrations.

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  has_rating boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint boards_slug_unique unique (slug),
  constraint boards_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  rating int,
  status text not null default 'published',
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_len check (char_length(title) between 1 and 120),
  constraint posts_rating_range check (rating is null or rating between 1 and 5),
  constraint posts_status_check check (status in ('published','hidden'))
);
create index if not exists posts_board_list_idx on public.posts (board_id, status, created_at desc);
create index if not exists posts_author_idx on public.posts (author_id);

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0
);
create index if not exists post_images_post_idx on public.post_images (post_id, sort_order);

-- updated_at triggers
drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at before update on public.boards
for each row execute function public.set_updated_at();
drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at before update on public.posts
for each row execute function public.set_updated_at();

alter table public.boards enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;

grant select on public.boards to anon, authenticated;
grant insert, update, delete on public.boards to authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant select on public.post_images to anon, authenticated;
grant insert, update, delete on public.post_images to authenticated;

-- boards: public reads active; admins manage
drop policy if exists "boards are readable" on public.boards;
create policy "boards are readable" on public.boards for select to anon, authenticated
using (is_active or public.is_active_admin());
drop policy if exists "admins manage boards" on public.boards;
create policy "admins manage boards" on public.boards for all to authenticated
using (public.admin_can_edit()) with check (public.admin_can_edit());

-- posts: public reads published; author/admin read all; author creates own; author/admin edit/delete
drop policy if exists "posts readable" on public.posts;
create policy "posts readable" on public.posts for select to anon, authenticated
using (status = 'published' or author_id = (select auth.uid()) or public.is_active_admin());
drop policy if exists "members create own posts" on public.posts;
create policy "members create own posts" on public.posts for insert to authenticated
with check ((select auth.uid()) is not null and author_id = (select auth.uid()));
drop policy if exists "authors or admins update posts" on public.posts;
create policy "authors or admins update posts" on public.posts for update to authenticated
using (author_id = (select auth.uid()) or public.is_active_admin())
with check (author_id = (select auth.uid()) or public.is_active_admin());
drop policy if exists "authors or admins delete posts" on public.posts;
create policy "authors or admins delete posts" on public.posts for delete to authenticated
using (author_id = (select auth.uid()) or public.is_active_admin());

-- post_images: readable when parent post is; mutable by parent author or admin
drop policy if exists "post images readable" on public.post_images;
create policy "post images readable" on public.post_images for select to anon, authenticated
using (exists (select 1 from public.posts p where p.id = post_id
  and (p.status = 'published' or p.author_id = (select auth.uid()) or public.is_active_admin())));
drop policy if exists "authors manage own post images" on public.post_images;
create policy "authors manage own post images" on public.post_images for all to authenticated
using (exists (select 1 from public.posts p where p.id = post_id
  and (p.author_id = (select auth.uid()) or public.is_active_admin())))
with check (exists (select 1 from public.posts p where p.id = post_id
  and (p.author_id = (select auth.uid()) or public.is_active_admin())));

-- seed initial boards
insert into public.boards (slug, name, description, sort_order, has_rating) values
  ('reviews', '후기', '캠프·공연 후기를 나눠요', 1, true),
  ('free',    '자유게시판', '자유롭게 이야기하는 공간', 2, false),
  ('shows',   '공연 소식', '다른 공연·행사 소식을 공유해요', 3, false)
on conflict (slug) do nothing;

-- storage bucket for post images (public read, logged-in members upload)
insert into storage.buckets (id, name, public) values ('board-images', 'board-images', true)
on conflict (id) do nothing;

drop policy if exists "board images publicly readable" on storage.objects;
create policy "board images publicly readable" on storage.objects for select
using (bucket_id = 'board-images');
drop policy if exists "members upload board images" on storage.objects;
create policy "members upload board images" on storage.objects for insert to authenticated
with check (bucket_id = 'board-images');
drop policy if exists "members update own board images" on storage.objects;
create policy "members update own board images" on storage.objects for update to authenticated
using (bucket_id = 'board-images' and owner = (select auth.uid()))
with check (bucket_id = 'board-images' and owner = (select auth.uid()));
drop policy if exists "members delete own board images" on storage.objects;
create policy "members delete own board images" on storage.objects for delete to authenticated
using (bucket_id = 'board-images' and owner = (select auth.uid()));
```

- [ ] **Step 2: 원격 적용**

Run: `printf 'Y\n' | supabase db push`
Expected: `Applying migration <ts>_community_board_core.sql...` → `Finished supabase db push.`

- [ ] **Step 3: 검증**

Run: `supabase db query --linked --yes -o csv "select slug, has_rating from public.boards order by sort_order;"`
Expected: 3 rows — reviews(true), free(false), shows(false).
Run: `supabase db query --linked --yes -o csv "select count(*) from pg_policies where tablename in ('boards','posts','post_images');"`
Expected: count ≥ 8.

- [ ] **Step 4: Commit**

```bash
git add "supabase/migrations/"*"_community_board_core.sql"
git commit -m "feat(board): add boards/posts/post_images tables, RLS, seed, storage bucket"
```

---

## Task 2: 게시판 순수 로직 (`boardForms.ts`) — TDD

**Files:** Create `src/types/board.ts`, `src/lib/boardForms.ts`, `src/lib/boardForms.test.ts`

**Interfaces:**
- Produces:
  - `validatePostTitle(v: string): { ok: true; value: string } | { ok: false; reason: string }` (1~120자, trim)
  - `validatePostBody(v: string): { ok: true; value: string } | { ok: false; reason: string }` (1~10000자, trim)
  - `validateComment(v: string): { ok: true; value: string } | { ok: false; reason: string }` (1~1000자, trim)
  - `validateRating(v: number | null, required: boolean): { ok: true; value: number | null } | { ok: false; reason: string }` (required면 1~5, 아니면 null 허용)
  - `isValidBoardSlug(v: string): boolean` (`^[a-z0-9-]+$`, 1~40자)
  - 타입 `Board, Post, PostImage, PostComment, PostWithMeta`

- [ ] **Step 1: 타입 작성** — `src/types/board.ts`

```typescript
export interface Board {
  id: string; slug: string; name: string; description: string;
  sort_order: number; has_rating: boolean; is_active: boolean;
  created_at: string; updated_at: string;
}
export interface PostImage { id: string; post_id: string; image_url: string; sort_order: number; }
export interface Post {
  id: string; board_id: string; author_id: string; title: string; body: string;
  rating: number | null; status: 'published' | 'hidden'; like_count: number;
  created_at: string; updated_at: string;
}
export interface PostComment {
  id: string; post_id: string; author_id: string; body: string;
  status: 'published' | 'hidden'; created_at: string; updated_at: string;
}
export interface PostWithMeta extends Post {
  author_nickname: string;
  images: PostImage[];
  board_slug?: string;
}
```

- [ ] **Step 2: 실패 테스트 작성** — `src/lib/boardForms.test.ts`

```typescript
import { validatePostTitle, validatePostBody, validateComment, validateRating, isValidBoardSlug } from './boardForms';

describe('validatePostTitle', () => {
  it('trims and accepts 1-120 chars', () => {
    expect(validatePostTitle('  좋은 공연  ')).toEqual({ ok: true, value: '좋은 공연' });
  });
  it('rejects empty', () => { expect(validatePostTitle('   ').ok).toBe(false); });
  it('rejects >120', () => { expect(validatePostTitle('a'.repeat(121)).ok).toBe(false); });
});
describe('validatePostBody', () => {
  it('accepts normal body', () => { expect(validatePostBody('내용').ok).toBe(true); });
  it('rejects empty', () => { expect(validatePostBody('  ').ok).toBe(false); });
});
describe('validateComment', () => {
  it('accepts 1-1000', () => { expect(validateComment('굿').ok).toBe(true); });
  it('rejects empty', () => { expect(validateComment('').ok).toBe(false); });
  it('rejects >1000', () => { expect(validateComment('a'.repeat(1001)).ok).toBe(false); });
});
describe('validateRating', () => {
  it('required: accepts 1-5', () => { expect(validateRating(5, true)).toEqual({ ok: true, value: 5 }); });
  it('required: rejects 0 and 6 and null', () => {
    expect(validateRating(0, true).ok).toBe(false);
    expect(validateRating(6, true).ok).toBe(false);
    expect(validateRating(null, true).ok).toBe(false);
  });
  it('optional: null ok, out-of-range rejected', () => {
    expect(validateRating(null, false)).toEqual({ ok: true, value: null });
    expect(validateRating(7, false).ok).toBe(false);
  });
});
describe('isValidBoardSlug', () => {
  it('accepts lowercase/digits/hyphen', () => { expect(isValidBoardSlug('shows-2026')).toBe(true); });
  it('rejects uppercase/space/empty', () => {
    expect(isValidBoardSlug('Shows')).toBe(false);
    expect(isValidBoardSlug('a b')).toBe(false);
    expect(isValidBoardSlug('')).toBe(false);
  });
});
```

- [ ] **Step 3: 테스트 실패 확인** — Run: `node node_modules/jest/bin/jest.js src/lib/boardForms.test.ts` → FAIL (module not found).

- [ ] **Step 4: 구현** — `src/lib/boardForms.ts`

```typescript
const trimmed = (v: string) => (v ?? '').trim();
type Ok<T> = { ok: true; value: T };
type Err = { ok: false; reason: string };

export const validatePostTitle = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 120) return { ok: false, reason: '제목은 1~120자여야 합니다.' };
  return { ok: true, value: t };
};
export const validatePostBody = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 10000) return { ok: false, reason: '내용은 1~10000자여야 합니다.' };
  return { ok: true, value: t };
};
export const validateComment = (v: string): Ok<string> | Err => {
  const t = trimmed(v);
  if (t.length < 1 || t.length > 1000) return { ok: false, reason: '댓글은 1~1000자여야 합니다.' };
  return { ok: true, value: t };
};
export const validateRating = (
  v: number | null, required: boolean
): Ok<number | null> | Err => {
  if (v === null || v === undefined) {
    return required ? { ok: false, reason: '별점을 선택해 주세요.' } : { ok: true, value: null };
  }
  if (!Number.isInteger(v) || v < 1 || v > 5) return { ok: false, reason: '별점은 1~5점입니다.' };
  return { ok: true, value: v };
};
export const isValidBoardSlug = (v: string): boolean =>
  typeof v === 'string' && /^[a-z0-9-]{1,40}$/.test(v);
```

- [ ] **Step 5: 테스트 통과 확인** — Run: `node node_modules/jest/bin/jest.js src/lib/boardForms.test.ts` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/types/board.ts src/lib/boardForms.ts src/lib/boardForms.test.ts
git commit -m "feat(board): add board form validation pure logic with tests"
```

---

## Task 3: 공개 데이터 레이어 (`boardData.ts`)

**Files:** Create `src/lib/boardData.ts`

**Interfaces:**
- Consumes: types from `@/types/board`; anon Supabase via `@supabase/supabase-js` `createClient` with `getSupabasePublicConfig` (mirror `src/lib/archivePublicData.ts` client setup).
- Produces:
  - `loadActiveBoards(): Promise<Board[]>`
  - `loadBoardBySlug(slug: string): Promise<Board | null>`
  - `loadBoardPosts(boardId: string, { limit, offset }): Promise<{ items: PostWithMeta[]; total: number }>` (published only, newest first, joins author nickname + images)
  - `loadPostDetail(postId: string): Promise<PostWithMeta | null>` (published only; includes images + author nickname + board_slug)
- Returns empty/null gracefully if Supabase not configured (mirror archivePublicData null-guard).

- [ ] **Step 1: 구현**

Mirror the client setup in `src/lib/archivePublicData.ts` (cached `getPublicClient()` using `getSupabasePublicConfig`, `persistSession:false`). Then:

```typescript
import type { Board, PostImage, PostWithMeta } from '@/types/board';
// ... getPublicClient() identical pattern to archivePublicData.ts ...

export const loadActiveBoards = async (): Promise<Board[]> => {
  const client = getPublicClient();
  if (!client) return [];
  const { data } = await client.from('boards').select('*').eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data as Board[]) ?? [];
};

export const loadBoardBySlug = async (slug: string): Promise<Board | null> => {
  const client = getPublicClient();
  if (!client) return null;
  const { data } = await client.from('boards').select('*').eq('slug', slug)
    .eq('is_active', true).maybeSingle();
  return (data as Board) ?? null;
};

export const loadBoardPosts = async (
  boardId: string, { limit = 20, offset = 0 }: { limit?: number; offset?: number }
): Promise<{ items: PostWithMeta[]; total: number }> => {
  const client = getPublicClient();
  if (!client) return { items: [], total: 0 };
  const { data, count } = await client
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(nickname), post_images(*)', { count: 'exact' })
    .eq('board_id', boardId).eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  const items = ((data as Record<string, unknown>[]) ?? []).map(mapPostRow);
  return { items, total: count ?? items.length };
};

export const loadPostDetail = async (postId: string): Promise<PostWithMeta | null> => {
  const client = getPublicClient();
  if (!client) return null;
  const { data } = await client
    .from('posts')
    .select('*, profiles!posts_author_id_fkey(nickname), post_images(*), boards(slug)')
    .eq('id', postId).eq('status', 'published').maybeSingle();
  if (!data) return null;
  return mapPostRow(data as Record<string, unknown>);
};

// maps the joined row → PostWithMeta (author_nickname, images sorted, board_slug)
const mapPostRow = (row: Record<string, unknown>): PostWithMeta => {
  const images = (((row.post_images as PostImage[]) ?? [])
    .slice().sort((a, b) => a.sort_order - b.sort_order));
  const profile = row.profiles as { nickname?: string } | null;
  const board = row.boards as { slug?: string } | null;
  return {
    id: String(row.id), board_id: String(row.board_id), author_id: String(row.author_id),
    title: String(row.title), body: String(row.body ?? ''),
    rating: (row.rating as number | null) ?? null,
    status: (row.status as 'published' | 'hidden'),
    like_count: Number(row.like_count ?? 0),
    created_at: String(row.created_at), updated_at: String(row.updated_at),
    author_nickname: profile?.nickname ?? '익명',
    images,
    ...(board?.slug ? { board_slug: board.slug } : {}),
  };
};
```

NOTE: the FK hint `profiles!posts_author_id_fkey` must match the actual FK constraint name. Verify with `supabase db query --linked --yes -o csv "select conname from pg_constraint where conrelid='public.posts'::regclass and contype='f';"` and use the real name (Postgres default is `posts_author_id_fkey`).

- [ ] **Step 2: 타입체크** — Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false` → clean.

- [ ] **Step 3: Commit**

```bash
git add src/lib/boardData.ts
git commit -m "feat(board): add public board data loaders (SSR)"
```

---

## Task 4: board i18n namespace (13 로케일)

**Files:** Create `public/locales/ko/board.json`, `public/locales/en/board.json`, then copy en → 11 others.

**Interfaces:** Produces `board` namespace. Pages load `serverSideTranslations(locale, ['board','translation'], nextI18NextConfig)`.

- [ ] **Step 1: ko 작성** — `public/locales/ko/board.json`

```json
{
  "index": { "title": "게시판", "posts": "글", "writeCta": "글쓰기", "loginToWrite": "로그인하고 글쓰기" },
  "list": { "empty": "아직 글이 없습니다.", "newPost": "새 글", "by": "작성자", "more": "더 보기" },
  "post": { "title": "제목", "body": "내용", "rating": "별점", "images": "사진", "save": "저장", "cancel": "취소", "edit": "수정", "delete": "삭제", "deleteConfirm": "이 글을 삭제할까요?", "saving": "저장 중", "uploadImage": "사진 추가", "likes": "좋아요" },
  "comment": { "heading": "댓글", "placeholder": "댓글을 입력하세요", "submit": "등록", "empty": "첫 댓글을 남겨 보세요.", "delete": "삭제" },
  "error": { "loginRequired": "로그인이 필요합니다.", "notFound": "글을 찾을 수 없습니다.", "saveFailed": "저장하지 못했습니다." }
}
```

- [ ] **Step 2: en 작성** — `public/locales/en/board.json` (same keys, English values: Board / Write / etc.).

```json
{
  "index": { "title": "Boards", "posts": "posts", "writeCta": "Write", "loginToWrite": "Log in to write" },
  "list": { "empty": "No posts yet.", "newPost": "New post", "by": "by", "more": "Load more" },
  "post": { "title": "Title", "body": "Body", "rating": "Rating", "images": "Photos", "save": "Save", "cancel": "Cancel", "edit": "Edit", "delete": "Delete", "deleteConfirm": "Delete this post?", "saving": "Saving", "uploadImage": "Add photo", "likes": "Likes" },
  "comment": { "heading": "Comments", "placeholder": "Write a comment", "submit": "Post", "empty": "Be the first to comment.", "delete": "Delete" },
  "error": { "loginRequired": "Login required.", "notFound": "Post not found.", "saveFailed": "Could not save." }
}
```

- [ ] **Step 3: 11개 로케일 복사** — Run:
```bash
for lc in es fr de pt ru ar ja zh-Hans zh-Hant hi id; do cp public/locales/en/board.json "public/locales/$lc/board.json"; done
```

- [ ] **Step 4: parity 확인** — Run:
```bash
for lc in ko en es fr de pt ru ar ja zh-Hans zh-Hant hi id; do node -e "const o=require('./public/locales/$lc/board.json'); if(!o.post||!o.post.save){process.exit(1)}" && echo "$lc ok"; done
```
Expected: 13 × `ok`.

- [ ] **Step 5: Commit**

```bash
git add public/locales/*/board.json
git commit -m "feat(board): add board i18n namespace (ko/en + en copies)"
```

---

## Task 5: 보드 목록 + 보드별 글 목록 페이지

**Files:** Create `src/components/board/PostCard.tsx`, `src/components/board/RatingStars.tsx`, `pages/board/index.tsx`, `pages/board/[slug]/index.tsx`

**Interfaces:**
- Consumes: `loadActiveBoards`, `loadBoardBySlug`, `loadBoardPosts` (Task 3); `useOptionalAuth` (login-aware write CTA); `board` namespace.
- Produces: `RatingStars`({ value, max=5 }) read-only display; `PostCard`({ post, boardSlug }) list item.

- [ ] **Step 1: RatingStars + PostCard 컴포넌트**

`RatingStars.tsx`: render `value` filled stars out of `max` (★/☆), `aria-label`. Pure presentational.
`PostCard.tsx`: a `<Link href={`/board/${boardSlug}/${post.id}`}>` showing title, author_nickname, created_at (ko-KR), like_count, first image thumbnail if present, and `<RatingStars value={post.rating}/>` when `post.rating != null`. Use Tailwind tokens.

- [ ] **Step 2: `/board` 보드 목록**

`pages/board/index.tsx`: `getServerSideProps` → `loadActiveBoards()` + per-board post count (use `loadBoardPosts(id,{limit:0})` total or a count query); render board cards linking to `/board/[slug]`. Load `['board','translation']`. Page chrome via existing public layout (Navigation/Footer come from `_app`). Title via `board:index.title`.

```tsx
export const getServerSideProps = async ({ locale }: GetServerSidePropsContext) => {
  const boards = await loadActiveBoards();
  return { props: { boards, ...(await serverSideTranslations(locale ?? 'ko', ['board','translation'], nextI18NextConfig)) } };
};
```

- [ ] **Step 3: `/board/[slug]` 글 목록**

`pages/board/[slug]/index.tsx`: `getServerSideProps` resolves `loadBoardBySlug(params.slug)` (404 via `notFound:true` if null), then `loadBoardPosts(board.id, {limit:20, offset:0})`. Render board name/description, a "글쓰기" CTA: if `useOptionalAuth()?.user` → `Link` to `/board/[slug]/new`, else `Link` to `/login?next=/board/[slug]/new`. Map posts to `PostCard`. Pagination: a "더 보기" button that client-fetches the next page via `supabaseBrowser` (or `Link` with `?offset=`). Keep it simple: offset via query param + SSR.

- [ ] **Step 4: 타입체크 + lint** — Run: `node node_modules/typescript/bin/tsc --noEmit --pretty false && node node_modules/eslint/bin/eslint.js pages/board src/components/board` → clean.

- [ ] **Step 5: Commit**

```bash
git add pages/board/index.tsx pages/board/[slug]/index.tsx src/components/board/PostCard.tsx src/components/board/RatingStars.tsx
git commit -m "feat(board): add board index and per-board post list pages"
```

---

## Task 6: 글 상세 페이지 (이미지 + 작성자, 수정/삭제 진입)

**Files:** Create `pages/board/[slug]/[postId]/index.tsx`

**Interfaces:**
- Consumes: `loadPostDetail`, `loadBoardBySlug` (Task 3); `useAuth`/`useOptionalAuth`; `RatingStars`; `createSupabaseBrowserClient` (delete). `board` namespace.
- (CommentSection / LikeButton are added in 2B / 2C — leave a placeholder slot but do NOT implement them here.)

- [ ] **Step 1: 상세 페이지**

`getServerSideProps`: `loadPostDetail(params.postId)`; if null → `notFound`. Render title, author_nickname, created_at, `RatingStars` if rating, body (preserve line breaks: `whitespace-pre-wrap`), images gallery (post_images sorted). If `useOptionalAuth()?.user?.id === post.author_id` → show 수정(`Link` to `.../edit`) and 삭제 button. Delete: client `supabaseBrowser.from('posts').delete().eq('id', post.id)` then `router.push('/board/[slug]')`; RLS enforces author/admin. Confirm via `window.confirm(t('post.deleteConfirm'))`. Load `['board','translation']`.

- [ ] **Step 2: 타입체크 + lint** — clean.

- [ ] **Step 3: Commit**

```bash
git add "pages/board/[slug]/[postId]/index.tsx"
git commit -m "feat(board): add post detail page with images and author actions"
```

---

## Task 7: 글 작성/수정 + 이미지 업로더 (별점 보드 토글)

**Files:** Create `src/components/board/PostImageUploader.tsx`, `src/components/board/PostForm.tsx`, `pages/board/[slug]/new.tsx`, `pages/board/[slug]/[postId]/edit.tsx`

**Interfaces:**
- Consumes: `validatePostTitle/Body/Rating` (Task 2); `useAuth`; `createSupabaseBrowserClient`; `RatingStars`; `board` namespace; storage bucket `board-images`.
- Produces: `PostForm`({ board, initial?, mode }) — shared create/edit form; `PostImageUploader`({ value, onChange }) — uploads to `board-images`, returns URL list.

- [ ] **Step 1: PostImageUploader**

Mirror `uploadGalleryImage` in `src/components/admin/AdminCollectionPage.tsx`: validate image type, ≤10MB, upload to `supabase.storage.from('board-images').upload(path, file)`, `getPublicUrl`, append URL to `value`. Allow removing/reordering URLs in local state. `path = `${user.id}/${Date.now()}-${rand}.${ext}``.

- [ ] **Step 2: PostForm (shared)**

Fields: title, body (textarea), rating (only when `board.has_rating` — render selectable `RatingStars` input 1~5), images (PostImageUploader). On submit:
- validate title/body, and rating with `required = board.has_rating`.
- create mode: insert post `{ board_id: board.id, author_id: user.id, title, body, rating }` → returns id; then insert `post_images` rows for each URL with sort_order. 
- edit mode: update post; replace images (delete existing rows for post, insert current). 
- Use `createSupabaseBrowserClient`; errors via `t('board:error.saveFailed')` / validation reasons. Redirect to detail on success.

- [ ] **Step 3: new / edit 페이지**

`pages/board/[slug]/new.tsx`: `getServerSideProps` loads board (`loadBoardBySlug`) + i18n; client gate via `useAuth` (if `!loading && !user` → `router.replace('/login?next=' + safeRedirectPath(currentPath))`). Render `<PostForm board mode="create" />`.
`pages/board/[slug]/[postId]/edit.tsx`: SSR loads board + post detail; client gate + author check (non-author → redirect to detail). Render `<PostForm board initial={post} mode="edit" />`.

- [ ] **Step 4: 타입체크 + lint** — clean.

- [ ] **Step 5: Commit**

```bash
git add src/components/board/PostImageUploader.tsx src/components/board/PostForm.tsx pages/board/[slug]/new.tsx "pages/board/[slug]/[postId]/edit.tsx"
git commit -m "feat(board): add post create/edit form with image upload and rating"
```

---

## Task 8: 관리자 보드 관리 페이지 (`/admin/boards`)

**Files:** Create `pages/admin/boards.tsx`; Modify `src/components/admin/AdminLayout.tsx` (NAV)

**Interfaces:**
- Consumes: `getAdminSession`/`requireAdminRole` patterns (mirror `pages/admin/members.tsx`); `createSupabaseServerClient` (SSR list) + `createSupabaseBrowserClient` (mutations). `isValidBoardSlug` (Task 2).
- Produces: board CRUD UI (name, slug, description, sort_order, has_rating, is_active).

- [ ] **Step 1: API route** — Create `pages/api/admin/boards.ts`

Mirror `pages/api/admin/members.ts`: `requireAdminRole(req,res,'editor')`. GET list; POST create (validate slug via `isValidBoardSlug`, Zod for fields); PATCH update by id; DELETE by id. Use `createSupabaseServerClient`.

- [ ] **Step 2: admin page** — `pages/admin/boards.tsx`

Mirror `pages/admin/members.tsx` structure (AdminLayout + list + add form + per-row edit). `getServerSideProps` gates with `getAdminSession` + `canEditContent(session.member)` (redirect to `/admin` if viewer). List boards, add/edit form, toggle is_active/has_rating, delete.

- [ ] **Step 3: NAV** — `src/components/admin/AdminLayout.tsx`

Add `{ href: '/admin/boards', label: '게시판' }` to NAV_ITEMS (visible to all admins; board mutation is gated by role at API/RLS).

- [ ] **Step 4: 타입체크 + lint** — clean.

- [ ] **Step 5: Commit**

```bash
git add pages/admin/boards.tsx pages/api/admin/boards.ts src/components/admin/AdminLayout.tsx
git commit -m "feat(board): add admin board management page"
```

---

## Task 9: 관리자 글 모더레이션 (`/admin/board-posts`)

**Files:** Create `pages/admin/board-posts.tsx`, `pages/api/admin/board-posts.ts`; Modify `AdminLayout.tsx` NAV

**Interfaces:**
- Consumes: admin auth patterns; status toggle on posts (published↔hidden).

- [ ] **Step 1: API** — `pages/api/admin/board-posts.ts`: `requireAdminRole(...,'editor')`. GET recent posts (join board slug + author nickname, all statuses). PATCH `{id, status}` to hide/unhide.

- [ ] **Step 2: page** — `pages/admin/board-posts.tsx`: list recent posts with board/author/status, a 숨김/공개 toggle button per row (calls PATCH). Gate via `getAdminSession` + editor.

- [ ] **Step 3: NAV** — add `{ href: '/admin/board-posts', label: '게시글 관리' }`.

- [ ] **Step 4: 타입체크 + lint** — clean.

- [ ] **Step 5: Commit**

```bash
git add pages/admin/board-posts.tsx pages/api/admin/board-posts.ts src/components/admin/AdminLayout.tsx
git commit -m "feat(board): add admin post moderation page"
```

---

# 단계 2B — 댓글

## Task 10: 댓글 마이그레이션 + 데이터 로더

**Files:** Create `supabase/migrations/<ts>_community_board_comments.sql`; Modify `src/lib/boardData.ts`

**Interfaces:**
- Produces: `public.post_comments` + RLS. `loadPostComments(postId): Promise<(PostComment & {author_nickname:string})[]>`.

- [ ] **Step 1: 마이그레이션**

```sql
create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_comments_body_len check (char_length(body) between 1 and 1000),
  constraint post_comments_status_check check (status in ('published','hidden'))
);
create index if not exists post_comments_post_idx on public.post_comments (post_id, created_at);

drop trigger if exists set_post_comments_updated_at on public.post_comments;
create trigger set_post_comments_updated_at before update on public.post_comments
for each row execute function public.set_updated_at();

alter table public.post_comments enable row level security;
grant select on public.post_comments to anon, authenticated;
grant insert, update, delete on public.post_comments to authenticated;

drop policy if exists "comments readable" on public.post_comments;
create policy "comments readable" on public.post_comments for select to anon, authenticated
using (status = 'published' or author_id = (select auth.uid()) or public.is_active_admin());
drop policy if exists "members create own comments" on public.post_comments;
create policy "members create own comments" on public.post_comments for insert to authenticated
with check ((select auth.uid()) is not null and author_id = (select auth.uid()));
drop policy if exists "authors or admins update comments" on public.post_comments;
create policy "authors or admins update comments" on public.post_comments for update to authenticated
using (author_id = (select auth.uid()) or public.is_active_admin())
with check (author_id = (select auth.uid()) or public.is_active_admin());
drop policy if exists "authors or admins delete comments" on public.post_comments;
create policy "authors or admins delete comments" on public.post_comments for delete to authenticated
using (author_id = (select auth.uid()) or public.is_active_admin());
```

- [ ] **Step 2: 적용 + 검증** — `printf 'Y\n' | supabase db push`; `supabase db query --linked --yes -o csv "select count(*) from pg_policies where tablename='post_comments';"` → ≥4.

- [ ] **Step 3: loader** — add to `boardData.ts`:

```typescript
export const loadPostComments = async (postId: string) => {
  const client = getPublicClient();
  if (!client) return [];
  const { data } = await client.from('post_comments')
    .select('*, profiles!post_comments_author_id_fkey(nickname)')
    .eq('post_id', postId).eq('status', 'published').order('created_at', { ascending: true });
  return ((data as Record<string, unknown>[]) ?? []).map((r) => ({
    id: String(r.id), post_id: String(r.post_id), author_id: String(r.author_id),
    body: String(r.body), status: r.status as 'published'|'hidden',
    created_at: String(r.created_at), updated_at: String(r.updated_at),
    author_nickname: (r.profiles as {nickname?:string} | null)?.nickname ?? '익명',
  }));
};
```
(Verify FK name `post_comments_author_id_fkey` via pg_constraint as in Task 3.)

- [ ] **Step 4: typecheck** — clean.

- [ ] **Step 5: Commit**

```bash
git add "supabase/migrations/"*"_community_board_comments.sql" src/lib/boardData.ts
git commit -m "feat(board): add post_comments table, RLS, and loader"
```

---

## Task 11: 댓글 UI (상세 페이지)

**Files:** Create `src/components/board/CommentSection.tsx`; Modify `pages/board/[slug]/[postId]/index.tsx`

**Interfaces:**
- Consumes: `loadPostComments` (SSR initial), `validateComment`, `useAuth`, `createSupabaseBrowserClient`.
- Produces: `CommentSection`({ postId, initialComments }) — list + add form (logged-in) + delete (author/admin).

- [ ] **Step 1: CommentSection** — render comments (nickname, created_at, body). Add form when `useAuth().user` (else "로그인이 필요합니다" link to `/login?next=`). Submit: `validateComment` → insert `{post_id, author_id:user.id, body}` → refetch (client `supabaseBrowser` select) or optimistic append. Delete own/admin via `.delete().eq('id', commentId)`.

- [ ] **Step 2: wire into detail** — `pages/board/[slug]/[postId]/index.tsx` `getServerSideProps` also calls `loadPostComments(postId)`; render `<CommentSection postId initialComments={comments} />` in the placeholder slot from Task 6.

- [ ] **Step 3: typecheck + lint** — clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/CommentSection.tsx "pages/board/[slug]/[postId]/index.tsx"
git commit -m "feat(board): add comments to post detail"
```

---

# 단계 2C — 좋아요

## Task 12: 좋아요 마이그레이션 + 트리거

**Files:** Create `supabase/migrations/<ts>_community_board_likes.sql`

**Interfaces:** Produces `public.post_likes` (PK post_id+user_id) + `sync_post_like_count` trigger keeping `posts.like_count` accurate.

- [ ] **Step 1: 마이그레이션**

```sql
create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint post_likes_pk primary key (post_id, user_id)
);

create or replace function public.sync_post_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end; $$;

drop trigger if exists post_likes_count_sync on public.post_likes;
create trigger post_likes_count_sync
after insert or delete on public.post_likes
for each row execute function public.sync_post_like_count();

alter table public.post_likes enable row level security;
grant select on public.post_likes to anon, authenticated;
grant insert, delete on public.post_likes to authenticated;

drop policy if exists "likes readable" on public.post_likes;
create policy "likes readable" on public.post_likes for select to anon, authenticated using (true);
drop policy if exists "members like as self" on public.post_likes;
create policy "members like as self" on public.post_likes for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists "members unlike own" on public.post_likes;
create policy "members unlike own" on public.post_likes for delete to authenticated
using (user_id = (select auth.uid()));
```

- [ ] **Step 2: 적용 + 트리거 검증** — `printf 'Y\n' | supabase db push`. Verify trigger logic with a temporary row is risky on prod; instead confirm objects exist: `supabase db query --linked --yes -o csv "select tgname from pg_trigger where tgrelid='public.post_likes'::regclass and not tgisinternal;"` → `post_likes_count_sync`.

- [ ] **Step 3: Commit**

```bash
git add "supabase/migrations/"*"_community_board_likes.sql"
git commit -m "feat(board): add post_likes table with like_count sync trigger"
```

---

## Task 13: 좋아요 버튼 (상세 페이지)

**Files:** Create `src/components/board/LikeButton.tsx`; Modify `pages/board/[slug]/[postId]/index.tsx`

**Interfaces:**
- Consumes: `useAuth`, `createSupabaseBrowserClient`; initial `like_count` from post; initial `liked` state (SSR or client check).
- Produces: `LikeButton`({ postId, initialCount }) — toggles like, optimistic count.

- [ ] **Step 1: LikeButton** — on mount (if logged in) check membership: `supabaseBrowser.from('post_likes').select('post_id').eq('post_id',postId).eq('user_id',user.id).maybeSingle()`. Toggle: if not liked → insert `{post_id, user_id}`; else delete matching row. Update local count optimistically; revert on error. If logged out, clicking → `router.push('/login?next=' + current)`.

- [ ] **Step 2: wire into detail** — render `<LikeButton postId initialCount={post.like_count} />` in detail page.

- [ ] **Step 3: typecheck + lint** — clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/board/LikeButton.tsx "pages/board/[slug]/[postId]/index.tsx"
git commit -m "feat(board): add like button to post detail"
```

---

## Task 14: 전체 검증 + 운영 메모

**Files:** none (verification)

- [ ] **Step 1: typecheck** — `node node_modules/typescript/bin/tsc --noEmit --pretty false` → exit 0.
- [ ] **Step 2: test** — `node node_modules/jest/bin/jest.js` → all pass (existing + boardForms).
- [ ] **Step 3: lint** — `node node_modules/eslint/bin/eslint.js src pages` → 0 errors.
- [ ] **Step 4: build** — `node node_modules/next/dist/bin/next build` → success (new `/board/*` routes; board namespace parity; no raw-key failure).
- [ ] **Step 5: 운영 메모** — record in memory/plan: `board-images` bucket created by migration; boards seeded (reviews/free/shows); board pages are SSR (dynamic). Commit any docs.
- [ ] **Step 6: push** — `git push origin codex/press-og-images`.

---

## Self-Review (작성자 점검 결과)

- **Spec coverage:** boards/posts/post_images/comments/likes 테이블+RLS(Task 1,10,12) · 시드 3보드(Task 1) · 버킷(Task 1) · 순수 로직+테스트(Task 2) · 데이터 레이어(Task 3,10) · i18n(Task 4) · 공개 페이지 목록/상세/작성/수정(Task 5,6,7) · 별점 보드토글(Task 7) · 이미지 다중(Task 7) · 댓글(Task 10,11) · 좋아요+트리거(Task 12,13) · admin 보드/모더레이션(Task 8,9) · 검증/배포(Task 14). 전 항목 매핑됨.
- **Placeholder scan:** 마이그레이션·순수로직·타입·데이터로더는 완전 코드. 페이지/컴포넌트는 정확한 supabase 호출·검증·RLS 의존·필드 목록을 명시하고 회원 시스템의 확립된 패턴(getStaticProps i18n, supabaseBrowser, safeRedirectPath, uploadGalleryImage)을 참조 — 구현자가 헤매지 않도록 인터페이스/시그니처를 못 박음. `<ts>`는 실행 시 생성하는 의도된 값.
- **Type consistency:** `Board/Post/PostImage/PostComment/PostWithMeta`(Task 2) 와 `loadActiveBoards/loadBoardBySlug/loadBoardPosts/loadPostDetail/loadPostComments`(Task 3,10) 반환형이 소비 태스크(5–13)와 일치. `validatePostTitle/Body/Comment/Rating`(Task 2)이 폼/댓글(Task 7,11)에서 동일 시그니처로 소비.
- **알려진 검증 포인트:** Supabase PostgREST 임베드 FK 힌트(`profiles!posts_author_id_fkey`, `post_comments_author_id_fkey`)는 실제 제약명과 일치해야 하므로 Task 3에 pg_constraint 확인 단계를 넣음.
