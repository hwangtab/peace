-- Harden post_comments SELECT: a comment is publicly visible only when the
-- parent post is published AND its board is active (defense in depth, matching
-- the posts/post_images parent-state checks). Authors and admins still see all.
drop policy if exists "comments readable" on public.post_comments;
create policy "comments readable" on public.post_comments for select to anon, authenticated
using (
  (status = 'published' and exists (
    select 1 from public.posts p join public.boards b on b.id = p.board_id
    where p.id = post_id and p.status = 'published' and b.is_active
  ))
  or author_id = (select auth.uid())
  or public.is_active_admin()
);
