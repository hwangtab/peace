-- 게시글 조회수. 본인 글이 아니어도 조회 시 증가시켜야 하므로 security definer RPC로 처리한다
-- (일반 사용자는 posts를 직접 update할 권한이 없음). 공개(published) 글만 증가.

alter table public.posts
  add column if not exists view_count integer not null default 0;

create or replace function public.increment_post_view(p_post_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.posts
     set view_count = view_count + 1
   where id = p_post_id
     and status = 'published';
end; $$;

grant execute on function public.increment_post_view(uuid) to anon, authenticated;
