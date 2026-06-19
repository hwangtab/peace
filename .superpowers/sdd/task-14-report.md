## Final-review fixes

### Fix A — board_id UPDATE grant hardening
- File: `supabase/migrations/20260620000619_community_board_post_grant.sql`
- Revoked full UPDATE grant on `public.posts` from `authenticated`, re-granted only `(title, body, rating, status, updated_at)`.
- Applied with `supabase db push`.
- Verify query result (UPDATE grant columns for `authenticated`): `body, rating, status, title, updated_at` — `board_id`, `like_count`, `created_at` absent.

### Fix B — author/admin locked out of their own hidden post
- Files: `src/lib/boardData.ts`, `pages/board/[slug]/[postId]/index.tsx`, `pages/board/[slug]/[postId]/edit.tsx`
- Exported `mapPostRow` from `boardData.ts`.
- Added `loadPostDetailWithClient(client, postId)` — no status filter, RLS decides visibility.
- Both `getServerSideProps` now call `loadPostDetailWithClient(createSupabaseServerClient(req, res), postId)` instead of `loadPostDetail(postId)`.

### Fix C — non-transactional edit image replace
- File: `src/components/board/PostForm.tsx`
- In edit mode: captured old image ids from `initial.images`, inserted new rows first, deleted old rows only after successful insert, logged (but did not fail) if old-row delete fails.

### Fix D — orphaned storage objects
- Files: `src/lib/boardData.ts`, `src/components/board/PostImageUploader.tsx`, `src/components/board/PostForm.tsx`, `pages/board/[slug]/[postId]/index.tsx`
- Added and exported `boardImagePath(url)` helper in `boardData.ts`.
- `PostImageUploader.handleRemove`: calls `supabase.storage.from('board-images').remove([path])` on remove (best-effort).
- `PostForm.tsx` edit: removes storage objects for images dropped from the set after DB delete succeeds.
- Post delete handler: removes all post image storage objects before deleting the post DB row.

### Fix E — comment insert errors swallowed
- File: `src/components/board/CommentSection.tsx`
- Captured `{ error: insertError }` from `post_comments` insert; on error, surfaces `t('error.saveFailed')` via `setValidationError` and does not clear textarea or refetch.

### Verify results
- Tests: 211 passed, 0 failed (27 suites)
- TypeScript: clean (no errors)
- ESLint: 0 errors, 2 pre-existing warnings in `AuthProvider.tsx` (set-state-in-effect)
- UPDATE grant columns: `body, rating, status, title, updated_at` — board_id removed: YES
