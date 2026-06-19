create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  status text not null default 'published',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_comments_body_len check (char_length(body) between 1 and 1000),
  constraint post_comments_status_check check (status in ('published','hidden'))
);
create index if not exists post_comments_post_idx on public.post_comments (post_id, created_at);

drop trigger if exists set_post_comments_updated_at on public.post_comments;
create trigger set_post_comments_updated_at before update on public.post_comments
for each row execute function public.set_updated_at();

alter table public.post_comments enable row level security;
grant select on public.post_comments to anon, authenticated;
grant insert, update, delete on public.post_comments to authenticated;

drop policy if exists "comments readable" on public.post_comments;
create policy "comments readable" on public.post_comments for select to anon, authenticated
using (status = 'published' or author_id = (select auth.uid()) or public.is_active_admin());
drop policy if exists "members create own comments" on public.post_comments;
create policy "members create own comments" on public.post_comments for insert to authenticated
with check ((select auth.uid()) is not null and author_id = (select auth.uid()));
drop policy if exists "authors or admins update comments" on public.post_comments;
create policy "authors or admins update comments" on public.post_comments for update to authenticated
using (author_id = (select auth.uid()) or public.is_active_admin())
with check (author_id = (select auth.uid()) or public.is_active_admin());
drop policy if exists "authors or admins delete comments" on public.post_comments;
create policy "authors or admins delete comments" on public.post_comments for delete to authenticated
using (author_id = (select auth.uid()) or public.is_active_admin());
