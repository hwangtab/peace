create table if not exists public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint post_likes_pk primary key (post_id, user_id)
);

create or replace function public.sync_post_like_count()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (tg_op = 'INSERT') then
    update public.posts set like_count = like_count + 1 where id = new.post_id;
    return new;
  elsif (tg_op = 'DELETE') then
    update public.posts set like_count = greatest(like_count - 1, 0) where id = old.post_id;
    return old;
  end if;
  return null;
end; $$;

drop trigger if exists post_likes_count_sync on public.post_likes;
create trigger post_likes_count_sync
after insert or delete on public.post_likes
for each row execute function public.sync_post_like_count();

alter table public.post_likes enable row level security;
grant select on public.post_likes to anon, authenticated;
grant insert, delete on public.post_likes to authenticated;

drop policy if exists "likes readable" on public.post_likes;
create policy "likes readable" on public.post_likes for select to anon, authenticated using (true);
drop policy if exists "members like as self" on public.post_likes;
create policy "members like as self" on public.post_likes for insert to authenticated
with check (user_id = (select auth.uid()));
drop policy if exists "members unlike own" on public.post_likes;
create policy "members unlike own" on public.post_likes for delete to authenticated
using (user_id = (select auth.uid()));
