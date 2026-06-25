# 관리자 종 알림 (Notification Bell) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 관리자 페이지 헤더 우측에 페이스북 스타일 종 알림을 추가해, 새 문의·게시글·댓글·가입 이벤트를 빨간 배지 + 드롭다운으로 보여주고 클릭 시 해당 관리 페이지로 이동시킨다.

**Architecture:** 알림을 저장하지 않는 파생(derived) 방식. 종을 열거나 폴링할 때 service-role 클라이언트로 4개 기존 테이블(`mailbox_messages`, `posts`, `post_comments`, `profiles`)에서 최근 이벤트를 읽어 병합한다. 읽음은 관리자별 `admin_members.notifications_seen_at` 시각 기준으로 판정한다. 데이터 가공(매핑·병합·안읽음 판정·상대시간)은 순수 함수로 분리해 jest로 단위 테스트하고, API/UI는 그 위에 얇게 얹는다.

**Tech Stack:** Next.js Pages Router, TypeScript, Supabase(service-role 클라이언트), Tailwind CSS, Framer Motion, jest.

## Global Constraints

- 의존성은 **pnpm**. `package.json` 변경 시 `pnpm-lock.yaml` 함께 커밋. (이 계획은 새 의존성 추가 없음 — framer-motion/classnames 기존 사용)
- 커밋 전 **prettier** 필수: `pnpm format` 후 커밋(CI에 `format:check` 있음).
- 서버에서 RLS 우회가 필요한 admin 데이터 읽기/쓰기는 `createSupabaseServiceClient()`(인자 없음, `@/lib/supabaseService`)를 쓴다 — 기존 admin 대시보드와 동일.
- API 라우트는 `requireAdminApi(req, res)`로 보호(반환이 null이면 이미 401 응답됨).
- 서버는 UTC이므로 "현재 시각"은 `new Date().toISOString()`을 그대로 써도 무방(시각 비교는 절대시각 기준). 날짜 경계 계산은 이 기능에 없음.
- admin 색상 팔레트: `jeju-ocean`, `deep-ocean`, `coastal-gray`, `sunset-coral`(배지), `ocean-sand`. 기존 AdminLayout 클래스 스타일을 따른다.

---

## File Structure

신규:
- `supabase/migrations/<timestamp>_admin_notifications_seen_at.sql` — `admin_members.notifications_seen_at` 컬럼
- `src/lib/adminNotifications.ts` — 타입 + 순수 가공 함수(매퍼, `buildNotificationFeed`, `formatRelativeTime`)
- `src/lib/adminNotifications.test.ts` — 순수 함수 단위 테스트
- `pages/api/admin/notifications/index.ts` — GET 피드
- `pages/api/admin/notifications/seen.ts` — POST 읽음 갱신
- `src/components/admin/NotificationBell.tsx` — 종 UI

수정:
- `src/components/admin/AdminLayout.tsx` — 헤더 우측에 `<NotificationBell />` 삽입

---

## Task 1: 마이그레이션 — `admin_members.notifications_seen_at`

**Files:**
- Create: `supabase/migrations/<timestamp>_admin_notifications_seen_at.sql`

**Interfaces:**
- Produces: `admin_members` 테이블에 `notifications_seen_at timestamptz` 컬럼(기존 행은 `now()`로 채움 → 과거 이벤트가 한꺼번에 안읽음으로 잡히지 않게)

- [ ] **Step 1: 마이그레이션 파일 생성**

파일명 타임스탬프는 기존 최신(`20260624102359...`)보다 뒤여야 한다. 다음 명령으로 현재 UTC 타임스탬프 파일을 만든다:

```bash
TS=$(date -u +%Y%m%d%H%M%S)
cat > "supabase/migrations/${TS}_admin_notifications_seen_at.sql" <<'SQL'
-- 관리자 종 알림의 "읽음" 기준 시각. 이 시각 이후 발생한 이벤트를 안읽음으로 본다.
-- 기존 기획단 행은 now()로 채워 도입 시점 이전 이벤트가 한꺼번에 안읽음으로 잡히지 않게 한다.
alter table public.admin_members add column if not exists notifications_seen_at timestamptz;
update public.admin_members set notifications_seen_at = now() where notifications_seen_at is null;
SQL
echo "created: supabase/migrations/${TS}_admin_notifications_seen_at.sql"
```

- [ ] **Step 2: DB에 적용**

CLAUDE.md 지침대로 Supabase는 CLI/직접 적용. 프로젝트 표준에 맞춰 적용한다(예: `supabase db push` 또는 psql). 적용 후 컬럼 존재 확인:

```bash
supabase db push
```

확인(psql 또는 service-role 스크립트로):
```sql
select column_name from information_schema.columns
where table_name = 'admin_members' and column_name = 'notifications_seen_at';
```
Expected: `notifications_seen_at` 1행 반환

- [ ] **Step 3: 커밋**

```bash
git add supabase/migrations/
git commit -m "feat(admin): admin_members.notifications_seen_at 알림 읽음 기준 컬럼"
```

---

## Task 2: 순수 가공 로직 — `src/lib/adminNotifications.ts`

매퍼·병합·안읽음 판정·상대시간을 순수 함수로 만들고 TDD로 검증한다. API는 여기에 raw 행만 넘긴다.

**Files:**
- Create: `src/lib/adminNotifications.ts`
- Test: `src/lib/adminNotifications.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type AdminNotificationType = 'inquiry' | 'post' | 'comment' | 'signup';

  export interface AdminNotification {
    id: string; // `${type}:${sourceId}`
    type: AdminNotificationType;
    title: string;
    summary: string;
    createdAt: string; // ISO
    href: string;
    isUnread: boolean;
  }

  export interface NotificationFeed {
    items: AdminNotification[];
    unreadCount: number; // 표시 상한 없음(배지에서 9+ 처리)
  }

  // raw 행 타입(Supabase select 결과; 조인은 객체 또는 배열로 올 수 있음)
  export interface RawInquiry { id: string; subject: string | null; from_name: string | null; from_email: string | null; created_at: string; }
  export interface RawPost { id: string; title: string; created_at: string; profiles?: { nickname?: string } | { nickname?: string }[] | null; }
  export interface RawComment { id: string; body: string; created_at: string; posts?: { title?: string } | { title?: string }[] | null; }
  export interface RawSignup { id: string; nickname: string | null; created_at: string; }

  export interface RawSources { inquiries: RawInquiry[]; posts: RawPost[]; comments: RawComment[]; signups: RawSignup[]; }

  export function buildNotificationFeed(sources: RawSources, seenAt: string | null, limit?: number): NotificationFeed;
  export function formatRelativeTime(iso: string, now: Date): string;
  ```

- [ ] **Step 1: 실패하는 테스트 작성**

`src/lib/adminNotifications.test.ts`:

```ts
import {
  buildNotificationFeed,
  formatRelativeTime,
  type RawSources,
} from './adminNotifications';

const sources: RawSources = {
  inquiries: [
    { id: 'm1', subject: '공연 문의', from_name: '홍길동', from_email: 'h@x.com', created_at: '2026-06-25T10:00:00Z' },
  ],
  posts: [
    { id: 'p1', title: '좋은 캠프였어요', created_at: '2026-06-25T09:00:00Z', profiles: { nickname: '바다' } },
    { id: 'p2', title: '질문 있습니다', created_at: '2026-06-25T08:00:00Z', profiles: [{ nickname: '산' }] },
  ],
  comments: [
    { id: 'c1', body: '동감합니다', created_at: '2026-06-25T11:00:00Z', posts: { title: '좋은 캠프였어요' } },
  ],
  signups: [
    { id: 'u1', nickname: '새회원', created_at: '2026-06-25T07:00:00Z' },
  ],
};

describe('buildNotificationFeed', () => {
  it('모든 소스를 createdAt 내림차순으로 병합한다', () => {
    const feed = buildNotificationFeed(sources, '2026-06-25T00:00:00Z');
    expect(feed.items.map((i) => i.id)).toEqual([
      'comment:c1',
      'inquiry:m1',
      'post:p1',
      'post:p2',
      'signup:u1',
    ]);
  });

  it('seenAt 이후 이벤트만 안읽음으로 표시하고 unreadCount를 센다', () => {
    const feed = buildNotificationFeed(sources, '2026-06-25T08:30:00Z');
    // 08:30 이후: comment(11:00), inquiry(10:00), post p1(09:00) = 3건
    expect(feed.unreadCount).toBe(3);
    expect(feed.items.find((i) => i.id === 'post:p2')?.isUnread).toBe(false);
    expect(feed.items.find((i) => i.id === 'inquiry:m1')?.isUnread).toBe(true);
  });

  it('seenAt이 null이면 전부 안읽음', () => {
    const feed = buildNotificationFeed(sources, null);
    expect(feed.unreadCount).toBe(feed.items.length);
  });

  it('조인이 객체/배열 어느 형태든 작성자·제목을 뽑는다', () => {
    const feed = buildNotificationFeed(sources, null);
    expect(feed.items.find((i) => i.id === 'post:p2')?.summary).toContain('산');
    expect(feed.items.find((i) => i.id === 'comment:c1')?.summary).toContain('좋은 캠프였어요');
  });

  it('타입별 href가 올바르다', () => {
    const feed = buildNotificationFeed(sources, null);
    const href = (id: string) => feed.items.find((i) => i.id === id)?.href;
    expect(href('inquiry:m1')).toBe('/admin/mailbox');
    expect(href('post:p1')).toBe('/admin/board-posts');
    expect(href('comment:c1')).toBe('/admin/board-posts');
    expect(href('signup:u1')).toBe('/admin/members');
  });

  it('limit으로 상위 N건만 반환하되 unreadCount는 잘리기 전 기준', () => {
    const feed = buildNotificationFeed(sources, null, 2);
    expect(feed.items).toHaveLength(2);
    expect(feed.unreadCount).toBe(5);
  });
});

describe('formatRelativeTime', () => {
  const now = new Date('2026-06-25T12:00:00Z');
  it('1분 미만은 방금 전', () => {
    expect(formatRelativeTime('2026-06-25T11:59:30Z', now)).toBe('방금 전');
  });
  it('분 단위', () => {
    expect(formatRelativeTime('2026-06-25T11:57:00Z', now)).toBe('3분 전');
  });
  it('시간 단위', () => {
    expect(formatRelativeTime('2026-06-25T09:00:00Z', now)).toBe('3시간 전');
  });
  it('일 단위', () => {
    expect(formatRelativeTime('2026-06-23T12:00:00Z', now)).toBe('2일 전');
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

Run: `pnpm test src/lib/adminNotifications.test.ts`
Expected: FAIL — `Cannot find module './adminNotifications'`

- [ ] **Step 3: 구현 작성**

`src/lib/adminNotifications.ts`:

```ts
export type AdminNotificationType = 'inquiry' | 'post' | 'comment' | 'signup';

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  summary: string;
  createdAt: string;
  href: string;
  isUnread: boolean;
}

export interface NotificationFeed {
  items: AdminNotification[];
  unreadCount: number;
}

export interface RawInquiry {
  id: string;
  subject: string | null;
  from_name: string | null;
  from_email: string | null;
  created_at: string;
}
export interface RawPost {
  id: string;
  title: string;
  created_at: string;
  profiles?: { nickname?: string } | { nickname?: string }[] | null;
}
export interface RawComment {
  id: string;
  body: string;
  created_at: string;
  posts?: { title?: string } | { title?: string }[] | null;
}
export interface RawSignup {
  id: string;
  nickname: string | null;
  created_at: string;
}
export interface RawSources {
  inquiries: RawInquiry[];
  posts: RawPost[];
  comments: RawComment[];
  signups: RawSignup[];
}

const pickOne = <T>(rel: T | T[] | null | undefined): T | null =>
  Array.isArray(rel) ? (rel[0] ?? null) : (rel ?? null);

const truncate = (text: string, max = 60): string =>
  text.length > max ? `${text.slice(0, max)}…` : text;

const mapInquiry = (row: RawInquiry): Omit<AdminNotification, 'isUnread'> => ({
  id: `inquiry:${row.id}`,
  type: 'inquiry',
  title: '새 문의 메일',
  summary: truncate(
    `${row.from_name || row.from_email || '익명'}: ${row.subject || '(제목 없음)'}`
  ),
  createdAt: row.created_at,
  href: '/admin/mailbox',
});

const mapPost = (row: RawPost): Omit<AdminNotification, 'isUnread'> => {
  const author = pickOne(row.profiles)?.nickname || '회원';
  return {
    id: `post:${row.id}`,
    type: 'post',
    title: '새 게시글',
    summary: truncate(`${author}: ${row.title}`),
    createdAt: row.created_at,
    href: '/admin/board-posts',
  };
};

const mapComment = (row: RawComment): Omit<AdminNotification, 'isUnread'> => {
  const postTitle = pickOne(row.posts)?.title || '게시글';
  return {
    id: `comment:${row.id}`,
    type: 'comment',
    title: '새 댓글',
    summary: truncate(`"${postTitle}"에 댓글: ${row.body}`),
    createdAt: row.created_at,
    href: '/admin/board-posts',
  };
};

const mapSignup = (row: RawSignup): Omit<AdminNotification, 'isUnread'> => ({
  id: `signup:${row.id}`,
  type: 'signup',
  title: '신규 회원가입',
  summary: truncate(`${row.nickname || '새 회원'}님이 가입했습니다`),
  createdAt: row.created_at,
  href: '/admin/members',
});

export function buildNotificationFeed(
  sources: RawSources,
  seenAt: string | null,
  limit = 20
): NotificationFeed {
  const seenMs = seenAt ? new Date(seenAt).getTime() : null;
  const merged = [
    ...sources.inquiries.map(mapInquiry),
    ...sources.posts.map(mapPost),
    ...sources.comments.map(mapComment),
    ...sources.signups.map(mapSignup),
  ].map((n) => ({
    ...n,
    isUnread: seenMs === null || new Date(n.createdAt).getTime() > seenMs,
  }));

  merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = merged.filter((n) => n.isUnread).length;
  return { items: merged.slice(0, limit), unreadCount };
}

export function formatRelativeTime(iso: string, now: Date): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return '방금 전';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  return `${day}일 전`;
}
```

- [ ] **Step 4: 테스트 통과 확인**

Run: `pnpm test src/lib/adminNotifications.test.ts`
Expected: PASS (전체 테스트 통과)

- [ ] **Step 5: 포맷 + 커밋**

```bash
pnpm format
git add src/lib/adminNotifications.ts src/lib/adminNotifications.test.ts
git commit -m "feat(admin): 알림 피드 가공 순수 함수 + 단위 테스트"
```

---

## Task 3: GET API — `pages/api/admin/notifications/index.ts`

**Files:**
- Create: `pages/api/admin/notifications/index.ts`

**Interfaces:**
- Consumes: `requireAdminApi` from `@/lib/adminAuth`; `createSupabaseServiceClient` from `@/lib/supabaseService`; `buildNotificationFeed`, `RawSources` from `@/lib/adminNotifications`
- Produces: `GET /api/admin/notifications` → `200 { items: AdminNotification[]; unreadCount: number }`. 각 소스 쿼리는 독립 실패 허용(실패 소스는 빈 배열로 취급).

- [ ] **Step 1: 구현 작성**

`pages/api/admin/notifications/index.ts`:

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '@/lib/adminAuth';
import { createSupabaseServiceClient } from '@/lib/supabaseService';
import {
  buildNotificationFeed,
  type RawComment,
  type RawInquiry,
  type RawPost,
  type RawSignup,
} from '@/lib/adminNotifications';

const PER_SOURCE = 15;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await requireAdminApi(req, res);
  if (!session) return;

  res.setHeader('Cache-Control', 'no-store');

  const supabase = createSupabaseServiceClient();
  const seenAt = session.member.notifications_seen_at ?? null;

  const [inquiriesRes, postsRes, commentsRes, signupsRes] = await Promise.all([
    supabase
      .from('mailbox_messages')
      .select('id,subject,from_name,from_email,created_at')
      .eq('direction', 'inbound')
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE),
    supabase
      .from('posts')
      .select('id,title,created_at,profiles!posts_author_id_fkey(nickname)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE),
    supabase
      .from('post_comments')
      .select('id,body,created_at,posts(title)')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE),
    supabase
      .from('profiles')
      .select('id,nickname,created_at')
      .order('created_at', { ascending: false })
      .limit(PER_SOURCE),
  ]);

  // 한 소스가 실패해도 나머지는 보여준다.
  for (const [name, r] of Object.entries({
    inquiries: inquiriesRes,
    posts: postsRes,
    comments: commentsRes,
    signups: signupsRes,
  })) {
    if (r.error) console.error(`[notifications] ${name} query failed:`, r.error.message);
  }

  const feed = buildNotificationFeed(
    {
      inquiries: (inquiriesRes.data as RawInquiry[] | null) ?? [],
      posts: (postsRes.data as RawPost[] | null) ?? [],
      comments: (commentsRes.data as RawComment[] | null) ?? [],
      signups: (signupsRes.data as RawSignup[] | null) ?? [],
    },
    seenAt
  );

  return res.status(200).json(feed);
}
```

참고: `session.member.notifications_seen_at`이 타입 에러면 Task 5의 타입 보강(아래 Step) 또는 `AdminMember` 타입에 `notifications_seen_at?: string | null` 추가가 필요하다. → 다음 Step에서 처리.

- [ ] **Step 2: `AdminMember` 타입에 컬럼 추가**

`src/types/cms.ts`의 `AdminMember` 인터페이스에 필드를 추가한다(정확한 위치는 파일에서 `interface AdminMember` 확인):

```ts
// AdminMember 인터페이스 내부, 기존 필드들과 나란히 추가
notifications_seen_at?: string | null;
```

- [ ] **Step 3: 타입체크**

Run: `pnpm typecheck`
Expected: PASS (notifications 관련 에러 없음)

- [ ] **Step 4: 수동 동작 확인**

`pnpm dev` 실행 후 관리자로 로그인한 브라우저에서:
```
GET http://localhost:3000/api/admin/notifications
```
Expected: `{ items: [...], unreadCount: N }` JSON. 비로그인 시 401.

- [ ] **Step 5: 포맷 + 커밋**

```bash
pnpm format
git add pages/api/admin/notifications/index.ts src/types/cms.ts
git commit -m "feat(admin): 알림 피드 GET API"
```

---

## Task 4: POST seen API — `pages/api/admin/notifications/seen.ts`

**Files:**
- Create: `pages/api/admin/notifications/seen.ts`

**Interfaces:**
- Consumes: `requireAdminApi`, `createSupabaseServiceClient`
- Produces: `POST /api/admin/notifications/seen` → `200 { ok: true }`. 현재 관리자의 `notifications_seen_at = now()`.

- [ ] **Step 1: 구현 작성**

`pages/api/admin/notifications/seen.ts`:

```ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAdminApi } from '@/lib/adminAuth';
import { createSupabaseServiceClient } from '@/lib/supabaseService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const session = await requireAdminApi(req, res);
  if (!session) return;

  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from('admin_members')
    .update({ notifications_seen_at: new Date().toISOString() })
    .eq('id', session.member.id);

  if (error) {
    console.error('[notifications/seen] update failed:', error.message);
    return res.status(500).json({ error: 'update_failed' });
  }

  return res.status(200).json({ ok: true });
}
```

- [ ] **Step 2: 타입체크 + 수동 확인**

Run: `pnpm typecheck`
Expected: PASS

`pnpm dev`에서 관리자 세션으로:
```
POST http://localhost:3000/api/admin/notifications/seen
```
Expected: `{ ok: true }`. 직후 `GET /api/admin/notifications`의 `unreadCount`가 0.

- [ ] **Step 3: 포맷 + 커밋**

```bash
pnpm format
git add pages/api/admin/notifications/seen.ts
git commit -m "feat(admin): 알림 읽음 처리 POST API"
```

---

## Task 5: UI — `NotificationBell` + AdminLayout 통합

**Files:**
- Create: `src/components/admin/NotificationBell.tsx`
- Modify: `src/components/admin/AdminLayout.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/notifications`, `POST /api/admin/notifications/seen`; `AdminNotification`, `formatRelativeTime` from `@/lib/adminNotifications`
- Produces: `export default function NotificationBell()` — props 없음. AdminLayout 헤더 우측(로그아웃 버튼 앞)에 렌더.

- [ ] **Step 1: NotificationBell 구현 작성**

`src/components/admin/NotificationBell.tsx`:

```tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';
import { formatRelativeTime, type AdminNotification } from '@/lib/adminNotifications';

const POLL_MS = 60_000;

const TYPE_ICON: Record<AdminNotification['type'], string> = {
  inquiry: '✉️',
  post: '📝',
  comment: '💬',
  signup: '🎉',
};

export default function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/notifications');
      if (!res.ok) return;
      const data = (await res.json()) as { items: AdminNotification[]; unreadCount: number };
      setItems(data.items);
      setUnreadCount(data.unreadCount);
    } catch {
      // 네트워크 오류는 조용히 무시 — 다음 폴링에서 재시도
    }
  }, []);

  // 마운트 시 1회 + 60초 폴링
  useEffect(() => {
    fetchFeed();
    const t = setInterval(fetchFeed, POLL_MS);
    return () => clearInterval(t);
  }, [fetchFeed]);

  // 외부 클릭 닫힘
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      await fetchFeed();
      setLoading(false);
      // 종을 여는 순간 읽음 처리 → 배지 즉시 0, 목록 강조는 유지
      setUnreadCount(0);
      fetch('/api/admin/notifications/seen', { method: 'POST' }).catch(() => {});
    }
  };

  const handleItemClick = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const now = new Date();

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="알림"
        aria-expanded={open}
        className="relative rounded border border-deep-ocean/20 bg-white p-2 text-deep-ocean transition hover:border-jeju-ocean hover:text-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-sunset-coral px-1 text-[0.7rem] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 z-50 mt-2 max-h-[70vh] w-80 overflow-y-auto rounded-lg border border-deep-ocean/10 bg-white shadow-lg"
          >
            <div className="border-b border-deep-ocean/10 px-4 py-3">
              <span className="font-display text-sm font-bold text-deep-ocean">알림</span>
            </div>
            {loading && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-coastal-gray">불러오는 중…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-coastal-gray">새 알림이 없습니다</p>
            ) : (
              <ul className="divide-y divide-deep-ocean/5">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(item.href)}
                      className={classNames(
                        'flex w-full gap-3 px-4 py-3 text-left transition hover:bg-ocean-sand',
                        item.isUnread && 'bg-jeju-ocean/5'
                      )}
                    >
                      <span aria-hidden className="text-base leading-none">
                        {TYPE_ICON[item.type]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-deep-ocean">
                          {item.title}
                        </span>
                        <span className="block truncate text-xs text-coastal-gray">
                          {item.summary}
                        </span>
                        <span className="mt-0.5 block text-[0.7rem] text-coastal-gray/70">
                          {formatRelativeTime(item.createdAt, now)}
                        </span>
                      </span>
                      {item.isUnread && (
                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sunset-coral" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: AdminLayout에 삽입**

`src/components/admin/AdminLayout.tsx` 상단 import 추가:

```tsx
import NotificationBell from '@/components/admin/NotificationBell';
```

헤더 우측 div(현재 `<div className="flex items-center gap-3 text-sm">` ~ 로그아웃 버튼) 안에서, 사용자명 `span` 다음·로그아웃 `button` 앞에 종을 넣는다:

```tsx
<div className="flex items-center gap-3 text-sm">
  {member && (
    <span className="hidden text-coastal-gray sm:inline">
      {member.display_name || member.email}
    </span>
  )}
  <NotificationBell />
  <button
    type="button"
    onClick={handleSignOut}
    className="rounded border border-deep-ocean/20 bg-white px-3 py-2 font-medium text-deep-ocean transition hover:border-jeju-ocean hover:text-jeju-ocean focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
  >
    로그아웃
  </button>
</div>
```

- [ ] **Step 3: 타입체크 + 린트**

Run: `pnpm typecheck && pnpm lint`
Expected: PASS

- [ ] **Step 4: 수동 동작 확인**

`pnpm dev`에서 관리자로 `/admin` 접속:
- 헤더 우측에 종 아이콘 표시, 안읽음 있으면 빨간 배지 숫자
- 종 클릭 → 드롭다운에 최근 이벤트 목록(아이콘/제목/요약/상대시간), 안읽음 배경 강조
- 드롭다운 연 직후 배지가 0으로 바뀜(새로고침해도 0 유지 = seen 저장됨)
- 항목 클릭 → 해당 페이지(/admin/mailbox 등)로 이동
- 알림 없으면 "새 알림이 없습니다"

- [ ] **Step 5: 포맷 + 커밋 + 푸시**

```bash
pnpm format
git add src/components/admin/NotificationBell.tsx src/components/admin/AdminLayout.tsx
git commit -m "feat(admin): 헤더 종 알림 UI + 폴링/읽음 연동"
git push origin main
```

---

## Self-Review (작성자 점검 결과)

- **Spec 커버리지:** 데이터/읽음(Task 1·2), GET API(Task 3), seen API(Task 4), UI+위치+폴링(Task 5), 4개 이벤트 소스 전부 매핑됨(Task 2/3), href 라우팅·빈 상태·9+ 배지·에러격리 모두 포함. ✅
- **Spec과의 차이(의도적 단순화):** spec의 "unreadCount는 각 소스 count 쿼리로 정밀 합산"은, 각 소스 15건 조회 후 목록 기반 카운트로 단순화했다. 배지가 9+로 캡되므로 10건 이상 안읽음에서 체감 차이 없음 — count 쿼리 4개를 줄이는 YAGNI 선택. (16건 이상 한 소스에 쌓인 안읽음은 과소 카운트 가능하나 실무상 무의미)
- **타입 일관성:** `AdminNotification`/`RawSources`/`buildNotificationFeed`/`formatRelativeTime` 시그니처가 Task 2 정의와 Task 3·5 사용처에서 일치. `AdminMember.notifications_seen_at` 추가(Task 3 Step 2)로 API의 `session.member.notifications_seen_at` 접근 타입 보장. ✅
- **플레이스홀더:** 없음(모든 코드 step에 전체 코드 포함). ✅
```
