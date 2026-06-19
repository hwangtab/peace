-- Single-call published post counts per board (avoids N+1 on the board index).
create or replace function public.board_published_post_counts()
returns table (board_id uuid, post_count bigint)
language sql stable security definer set search_path = public as $$
  select p.board_id, count(*)::bigint
  from public.posts p
  join public.boards b on b.id = p.board_id
  where p.status = 'published' and b.is_active
  group by p.board_id;
$$;
grant execute on function public.board_published_post_counts() to anon, authenticated;
