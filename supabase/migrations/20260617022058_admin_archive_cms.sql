-- PEACE website/archive CMS v1.
-- Public visitors can read published archive/content rows.
-- Signed-in operators can manage rows only when their email/user id is present
-- in admin_members and active=true.

create table if not exists public.admin_members (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  role text not null default 'editor',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_members_email_lower_unique unique (email),
  constraint admin_members_role_check check (role in ('owner', 'editor', 'viewer'))
);

create table if not exists public.cms_content_blocks (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  locale text not null default 'ko',
  route_path text not null,
  placement text not null,
  label text not null,
  value text not null default '',
  description text,
  status text not null default 'draft',
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cms_content_blocks_status_check check (status in ('draft', 'published', 'hidden')),
  constraint cms_content_blocks_unique_key unique (key, locale)
);

create table if not exists public.archive_videos (
  id uuid primary key default gen_random_uuid(),
  public_id integer not null unique,
  locale text not null default 'ko',
  title text not null,
  description text not null default '',
  youtube_url text not null,
  date date not null,
  location text not null default '',
  event_type text not null default 'camp',
  event_year integer not null,
  thumbnail_url text,
  duration text,
  musician_ids integer[] not null default '{}',
  director_musician_id integer,
  status text not null default 'draft',
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint archive_videos_status_check check (status in ('draft', 'published', 'hidden')),
  constraint archive_videos_event_type_check check (event_type in ('camp', 'album'))
);

create table if not exists public.archive_gallery_images (
  id uuid primary key default gen_random_uuid(),
  public_id integer not null unique,
  image_url text not null,
  description text,
  event_type text not null default 'camp',
  event_year integer not null,
  photographer text,
  status text not null default 'draft',
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint archive_gallery_images_status_check check (status in ('draft', 'published', 'hidden')),
  constraint archive_gallery_images_event_type_check check (event_type in ('camp', 'album'))
);

create table if not exists public.archive_press_items (
  id uuid primary key default gen_random_uuid(),
  public_id integer not null unique,
  locale text not null default 'ko',
  title text not null,
  publisher text not null,
  date date not null,
  source_url text not null,
  description text not null default '',
  image_url text,
  event_type text not null default 'camp',
  event_year integer not null,
  status text not null default 'draft',
  sort_order integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint archive_press_items_status_check check (status in ('draft', 'published', 'hidden')),
  constraint archive_press_items_event_type_check check (event_type in ('camp', 'album'))
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_updated_at() from public;

drop trigger if exists set_admin_members_updated_at on public.admin_members;
create trigger set_admin_members_updated_at
before update on public.admin_members
for each row execute function public.set_updated_at();

drop trigger if exists set_cms_content_blocks_updated_at on public.cms_content_blocks;
create trigger set_cms_content_blocks_updated_at
before update on public.cms_content_blocks
for each row execute function public.set_updated_at();

drop trigger if exists set_archive_videos_updated_at on public.archive_videos;
create trigger set_archive_videos_updated_at
before update on public.archive_videos
for each row execute function public.set_updated_at();

drop trigger if exists set_archive_gallery_images_updated_at on public.archive_gallery_images;
create trigger set_archive_gallery_images_updated_at
before update on public.archive_gallery_images
for each row execute function public.set_updated_at();

drop trigger if exists set_archive_press_items_updated_at on public.archive_press_items;
create trigger set_archive_press_items_updated_at
before update on public.archive_press_items
for each row execute function public.set_updated_at();

create index if not exists admin_members_active_email_idx
  on public.admin_members (active, lower(email));
create index if not exists cms_content_blocks_public_idx
  on public.cms_content_blocks (status, locale, route_path, sort_order);
create index if not exists archive_videos_public_idx
  on public.archive_videos (status, locale, event_year desc, date desc, sort_order);
create index if not exists archive_gallery_images_public_idx
  on public.archive_gallery_images (status, event_year desc, sort_order);
create index if not exists archive_press_items_public_idx
  on public.archive_press_items (status, locale, event_year desc, date desc, sort_order);

alter table public.admin_members enable row level security;
alter table public.cms_content_blocks enable row level security;
alter table public.archive_videos enable row level security;
alter table public.archive_gallery_images enable row level security;
alter table public.archive_press_items enable row level security;

grant select on public.admin_members to authenticated;
grant select on public.cms_content_blocks to anon, authenticated;
grant insert, update, delete on public.cms_content_blocks to authenticated;
grant select on public.archive_videos to anon, authenticated;
grant insert, update, delete on public.archive_videos to authenticated;
grant select on public.archive_gallery_images to anon, authenticated;
grant insert, update, delete on public.archive_gallery_images to authenticated;
grant select on public.archive_press_items to anon, authenticated;
grant insert, update, delete on public.archive_press_items to authenticated;

create policy "active admins can read own membership"
on public.admin_members
for select
to authenticated
using (
  active
  and (
    user_id = (select auth.uid())
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  )
);

create policy "published content is public and admins can read all"
on public.cms_content_blocks
for select
to anon, authenticated
using (
  status = 'published'
  or exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "admins can insert content"
on public.cms_content_blocks
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "admins can update content"
on public.cms_content_blocks
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
)
with check (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "admins can delete content"
on public.cms_content_blocks
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "published videos are public and admins can read all"
on public.archive_videos
for select
to anon, authenticated
using (
  status = 'published'
  or exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "admins can manage videos"
on public.archive_videos
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
)
with check (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "published gallery images are public and admins can read all"
on public.archive_gallery_images
for select
to anon, authenticated
using (
  status = 'published'
  or exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "admins can manage gallery images"
on public.archive_gallery_images
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
)
with check (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "published press items are public and admins can read all"
on public.archive_press_items
for select
to anon, authenticated
using (
  status = 'published'
  or exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "admins can manage press items"
on public.archive_press_items
for all
to authenticated
using (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
)
with check (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);
