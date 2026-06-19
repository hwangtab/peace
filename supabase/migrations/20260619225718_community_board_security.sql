-- Security hardening for community board (automated review findings):
-- 1) Column-level grants on posts so clients cannot set like_count/created_at.
-- 2) posts/post_images SELECT also require the parent board to be active (defense in depth).
-- 3) board-images uploads scoped to a per-user folder prefix + MIME/size limits.

-- (1) Column-level grants on posts. RLS is row-level only; without column grants a
-- member updating their own row could set like_count/created_at arbitrarily.
revoke insert, update on public.posts from authenticated;
grant insert (board_id, author_id, title, body, rating, status) on public.posts to authenticated;
grant update (title, body, rating, status, board_id, updated_at) on public.posts to authenticated;
-- (delete grant from the core migration remains; row-level RLS restricts it.)

-- (2) Parent-board-active check in SELECT policies.
drop policy if exists "posts readable" on public.posts;
create policy "posts readable" on public.posts for select to anon, authenticated
using (
  (status = 'published' and exists (select 1 from public.boards b where b.id = board_id and b.is_active))
  or author_id = (select auth.uid())
  or public.is_active_admin()
);

drop policy if exists "post images readable" on public.post_images;
create policy "post images readable" on public.post_images for select to anon, authenticated
using (
  exists (
    select 1 from public.posts p join public.boards b on b.id = p.board_id
    where p.id = post_id
      and ((p.status = 'published' and b.is_active)
           or p.author_id = (select auth.uid())
           or public.is_active_admin())
  )
);

-- (3) Storage hardening for board-images.
update storage.buckets
  set allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'],
      file_size_limit = 10485760
  where id = 'board-images';

drop policy if exists "members upload board images" on storage.objects;
create policy "members upload board images" on storage.objects for insert to authenticated
with check (bucket_id = 'board-images' and (storage.foldername(name))[1] = (select auth.uid())::text);
