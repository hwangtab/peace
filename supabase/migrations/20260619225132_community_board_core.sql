-- Community boards (Phase 2A): boards, posts, post_images.
-- Reuses is_active_admin()/admin_can_edit()/set_updated_at() from earlier migrations.

create table if not exists public.boards (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  description text not null default '',
  sort_order int not null default 0,
  has_rating boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint boards_slug_unique unique (slug),
  constraint boards_slug_format check (slug ~ '^[a-z0-9-]+$')
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  body text not null default '',
  rating int,
  status text not null default 'published',
  like_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_title_len check (char_length(title) between 1 and 120),
  constraint posts_rating_range check (rating is null or rating between 1 and 5),
  constraint posts_status_check check (status in ('published','hidden'))
);
create index if not exists posts_board_list_idx on public.posts (board_id, status, created_at desc);
create index if not exists posts_author_idx on public.posts (author_id);

create table if not exists public.post_images (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0
);
create index if not exists post_images_post_idx on public.post_images (post_id, sort_order);

-- updated_at triggers
drop trigger if exists set_boards_updated_at on public.boards;
create trigger set_boards_updated_at before update on public.boards
for each row execute function public.set_updated_at();
drop trigger if exists set_posts_updated_at on public.posts;
create trigger set_posts_updated_at before update on public.posts
for each row execute function public.set_updated_at();

alter table public.boards enable row level security;
alter table public.posts enable row level security;
alter table public.post_images enable row level security;

grant select on public.boards to anon, authenticated;
grant insert, update, delete on public.boards to authenticated;
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant select on public.post_images to anon, authenticated;
grant insert, update, delete on public.post_images to authenticated;

-- boards: public reads active; admins manage
drop policy if exists "boards are readable" on public.boards;
create policy "boards are readable" on public.boards for select to anon, authenticated
using (is_active or public.is_active_admin());
drop policy if exists "admins manage boards" on public.boards;
create policy "admins manage boards" on public.boards for all to authenticated
using (public.admin_can_edit()) with check (public.admin_can_edit());

-- posts: public reads published; author/admin read all; author creates own; author/admin edit/delete
drop policy if exists "posts readable" on public.posts;
create policy "posts readable" on public.posts for select to anon, authenticated
using (status = 'published' or author_id = (select auth.uid()) or public.is_active_admin());
drop policy if exists "members create own posts" on public.posts;
create policy "members create own posts" on public.posts for insert to authenticated
with check ((select auth.uid()) is not null and author_id = (select auth.uid()));
drop policy if exists "authors or admins update posts" on public.posts;
create policy "authors or admins update posts" on public.posts for update to authenticated
using (author_id = (select auth.uid()) or public.is_active_admin())
with check (author_id = (select auth.uid()) or public.is_active_admin());
drop policy if exists "authors or admins delete posts" on public.posts;
create policy "authors or admins delete posts" on public.posts for delete to authenticated
using (author_id = (select auth.uid()) or public.is_active_admin());

-- post_images: readable when parent post is; mutable by parent author or admin
drop policy if exists "post images readable" on public.post_images;
create policy "post images readable" on public.post_images for select to anon, authenticated
using (exists (select 1 from public.posts p where p.id = post_id
  and (p.status = 'published' or p.author_id = (select auth.uid()) or public.is_active_admin())));
drop policy if exists "authors manage own post images" on public.post_images;
create policy "authors manage own post images" on public.post_images for all to authenticated
using (exists (select 1 from public.posts p where p.id = post_id
  and (p.author_id = (select auth.uid()) or public.is_active_admin())))
with check (exists (select 1 from public.posts p where p.id = post_id
  and (p.author_id = (select auth.uid()) or public.is_active_admin())));

-- seed initial boards
insert into public.boards (slug, name, description, sort_order, has_rating) values
  ('reviews', '후기', '캠프·공연 후기를 나눠요', 1, true),
  ('free',    '자유게시판', '자유롭게 이야기하는 공간', 2, false),
  ('shows',   '공연 소식', '다른 공연·행사 소식을 공유해요', 3, false)
on conflict (slug) do nothing;

-- storage bucket for post images (public read, logged-in members upload)
insert into storage.buckets (id, name, public) values ('board-images', 'board-images', true)
on conflict (id) do nothing;

drop policy if exists "board images publicly readable" on storage.objects;
create policy "board images publicly readable" on storage.objects for select
using (bucket_id = 'board-images');
drop policy if exists "members upload board images" on storage.objects;
create policy "members upload board images" on storage.objects for insert to authenticated
with check (bucket_id = 'board-images');
drop policy if exists "members update own board images" on storage.objects;
create policy "members update own board images" on storage.objects for update to authenticated
using (bucket_id = 'board-images' and owner = (select auth.uid()))
with check (bucket_id = 'board-images' and owner = (select auth.uid()));
drop policy if exists "members delete own board images" on storage.objects;
create policy "members delete own board images" on storage.objects for delete to authenticated
using (bucket_id = 'board-images' and owner = (select auth.uid()));
