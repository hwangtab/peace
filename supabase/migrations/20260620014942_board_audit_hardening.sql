-- Audit hardening (final review findings).

-- FIX 1 (HIGH): community moderation must require editor/owner (admin_can_edit),
-- not any active admin (is_active_admin) — a viewer could otherwise edit/delete/hide
-- any member's post, comment, or image via direct REST. SELECT policies that use
-- is_active_admin() to VIEW hidden content stay as-is (viewing is fine for any admin).
drop policy if exists "authors or admins update posts" on public.posts;
create policy "authors or admins update posts" on public.posts for update to authenticated
using (author_id = (select auth.uid()) or public.admin_can_edit())
with check (author_id = (select auth.uid()) or public.admin_can_edit());

drop policy if exists "authors or admins delete posts" on public.posts;
create policy "authors or admins delete posts" on public.posts for delete to authenticated
using (author_id = (select auth.uid()) or public.admin_can_edit());

drop policy if exists "authors manage own post images" on public.post_images;
create policy "authors manage own post images" on public.post_images for all to authenticated
using (exists (select 1 from public.posts p where p.id = post_id
  and (p.author_id = (select auth.uid()) or public.admin_can_edit())))
with check (exists (select 1 from public.posts p where p.id = post_id
  and (p.author_id = (select auth.uid()) or public.admin_can_edit())));

drop policy if exists "authors or admins update comments" on public.post_comments;
create policy "authors or admins update comments" on public.post_comments for update to authenticated
using (author_id = (select auth.uid()) or public.admin_can_edit())
with check (author_id = (select auth.uid()) or public.admin_can_edit());

drop policy if exists "authors or admins delete comments" on public.post_comments;
create policy "authors or admins delete comments" on public.post_comments for delete to authenticated
using (author_id = (select auth.uid()) or public.admin_can_edit());

-- FIX 2 (LOW): restrict profiles UPDATE to the nickname column so clients can't
-- forge created_at. (updated_at is maintained by the set_profiles_updated_at trigger,
-- which runs as table owner regardless of column grants.)
revoke update on public.profiles from authenticated;
grant update (nickname) on public.profiles to authenticated;

-- FIX 3 (LOW): board-images UPDATE (rename/move) must keep the per-user folder
-- prefix the INSERT policy enforces, so objects can't be moved out of the owner's namespace.
drop policy if exists "members update own board images" on storage.objects;
create policy "members update own board images" on storage.objects for update to authenticated
using (bucket_id = 'board-images' and owner = (select auth.uid()))
with check (bucket_id = 'board-images' and owner = (select auth.uid())
  and (storage.foldername(name))[1] = (select auth.uid())::text);

-- FIX 4 (LOW): admin_members email uniqueness must be case-insensitive to match
-- every auth lookup (lower(email) / ilike). Dedupe defensively, then swap the
-- case-sensitive unique constraint for a case-insensitive unique index.
-- (No case-variant duplicates can exist via the app since inserts are lowercased,
-- but enforce the invariant the auth model assumes.)
alter table public.admin_members drop constraint if exists admin_members_email_lower_unique;
create unique index if not exists admin_members_email_lower_unique on public.admin_members (lower(email));
