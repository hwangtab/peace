-- Orphan board-images paths: objects with no referencing post_images row, older
-- than a grace period. Computed server-side (antijoin) to avoid pagination/
-- consistency bugs in the edge function. SECURITY DEFINER to read storage.objects.
create or replace function public.orphan_board_image_paths(grace_hours int default 24)
returns table (path text)
language sql
security definer
set search_path = public, storage
as $$
  select o.name
  from storage.objects o
  where o.bucket_id = 'board-images'
    and o.created_at is not null
    and o.created_at < now() - make_interval(hours => grace_hours)
    and not exists (
      select 1 from public.post_images pi
      where pi.image_url like '%/board-images/' || o.name
    );
$$;

revoke all on function public.orphan_board_image_paths(int) from public, anon, authenticated;
grant execute on function public.orphan_board_image_paths(int) to service_role;
