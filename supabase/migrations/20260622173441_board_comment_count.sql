-- 게시글 댓글 수 비정규화 (like_count와 동일한 패턴). 목록 카드에서 댓글 수를
-- 매 글마다 count 쿼리 없이 바로 보여주기 위함.

alter table public.posts
  add column if not exists comment_count integer not null default 0;

create or replace function public.sync_post_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end; $$;

drop trigger if exists post_comments_count_sync on public.post_comments;
create trigger post_comments_count_sync
after insert or delete on public.post_comments
for each row execute function public.sync_post_comment_count();

-- 기존 데이터 backfill
update public.posts p
  set comment_count = (
    select count(*) from public.post_comments c where c.post_id = p.id
  );
