# Audit 2 Fix B Report

## Fix 1 — LikeButton initializing guard (LOW)

**File:** `src/components/board/LikeButton.tsx`

**Problem:** `initializing` was `useState(!!user)`. On SSR load, AuthProvider starts with `user=null`, so `initializing` started `false` and was never re-armed when the session resolved. A logged-in user could click during the membership-check window with stale `liked=false`, causing spurious count inflation.

**Fix applied:**
- Changed `useState(!!user)` → `useState(true)` so the button is always disabled until the first check resolves.
- In the membership effect: always call `setInitializing(true)` at start (with `eslint-disable-next-line` to suppress the sync-setState-in-effect lint warning — the call is intentional and load-bearing).
- Both branches (user present / absent) resolve through a `.then()` callback via `Promise.resolve({ data: null })` for the no-user path, which sets `liked` and `setInitializing(false)`.
- Cancelled-flag guards against race conditions on effect cleanup.
- Destructured `loading: authLoading` from `useAuth()`; `handleClick` returns early if `authLoading` (does NOT redirect to /login while auth is still resolving).
- `disabled` now includes `authLoading || loading || initializing`.

---

## Fix 2 — CommentSection client refetch drops hidden comments (LOW)

**File:** `src/components/board/CommentSection.tsx`

**Problem:** `fetchComments` hard-coded `.eq('status', 'published')`, so after any add/delete, admin/author-visible hidden comments vanished from the list (inconsistent with SSR load which uses RLS).

**Fix applied:**
- Removed `.eq('status', 'published')` from `fetchComments`. RLS on the server decides visibility, mirroring `loadPostCommentsWithClient`.
- Added optional `readOnly?: boolean` prop to `CommentSection`. When `true`, the add-comment form (and login-prompt link) is not rendered, but the existing comment list is still shown.

---

## Fix 3 — Hidden post renders with no indicator + active interaction forms (LOW UX)

**File:** `pages/board/[slug]/[postId]/index.tsx`

**Problem:** When `post.status === 'hidden'`, the page rendered normally with LikeButton and add-comment form visible — even though the author's likes/comments on a hidden post are invisible to everyone.

**Fix applied:**
- Computed `const isHidden = post.status === 'hidden'`.
- When `isHidden`: renders an amber banner using `t('post.hiddenNotice')`.
- `<LikeButton>` is only rendered when `!isHidden`.
- `<CommentSection>` receives `readOnly={isHidden}` which hides the add-comment form.

**i18n — board:post.hiddenNotice added to all 13 locales:**
- `ko`: "이 글은 관리자에 의해 숨김 처리되어 다른 사람에게 보이지 않습니다."
- `en` + 11 others: "This post has been hidden by an administrator and is not visible to others."

---

## Verification Results

### Jest
```
Test Suites: 27 passed, 27 total
Tests:       213 passed, 213 total
Time:        1.811s
```

### TypeScript (`tsc --noEmit`)
```
exit: 0 (clean)
```

### ESLint (`pages/board` + `src/components/board`)
```
exit: 0 — 0 errors, 0 warnings
```

### 13-locale parity
```
ko ok / en ok / es ok / fr ok / de ok / pt ok / ru ok / ar ok / ja ok / zh-Hans ok / zh-Hant ok / hi ok / id ok
```
