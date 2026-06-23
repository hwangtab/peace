-- comment_count는 '공개(published)' 댓글만 세야 한다. 기존 트리거는 status 무관하게
-- INSERT +1 / DELETE -1 만 처리해, 관리자가 댓글을 숨김(status=hidden) 처리해도 카운트가
-- 줄지 않아 카드의 댓글 수가 실제 보이는 수와 어긋났다. status 전환(UPDATE)까지 반영하도록 보강.

create or replace function public.sync_post_comment_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    if new.status = 'published' then
      update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    if old.status = 'published' then
      update public.posts set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
    end if;
    return old;
  elsif (tg_op = 'UPDATE') then
    if old.status = 'published' and new.status is distinct from 'published' then
      update public.posts set comment_count = greatest(comment_count - 1, 0) where id = new.post_id;
    elsif old.status is distinct from 'published' and new.status = 'published' then
      update public.posts set comment_count = comment_count + 1 where id = new.post_id;
    end if;
    return new;
  end if;
  return null;
end; $$;

drop trigger if exists post_comments_count_sync on public.post_comments;
create trigger post_comments_count_sync
after insert or delete or update of status on public.post_comments
for each row execute function public.sync_post_comment_count();

-- 공개 댓글 기준으로 backfill 재계산(기존 숨김 포함 값 교정).
update public.posts p
  set comment_count = (
    select count(*) from public.post_comments c
     where c.post_id = p.id and c.status = 'published'
  );
