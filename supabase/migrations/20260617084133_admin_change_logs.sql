create table if not exists public.cms_change_logs (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  table_name text not null,
  row_id uuid,
  public_id integer,
  locale text,
  action text not null,
  primary_label text,
  before_data jsonb,
  after_data jsonb,
  admin_member_id uuid references public.admin_members (id) on delete set null,
  admin_email text not null,
  restored_from_log_id uuid references public.cms_change_logs (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint cms_change_logs_collection_check
    check (collection in ('content', 'videos', 'gallery', 'press')),
  constraint cms_change_logs_table_name_check
    check (table_name in ('cms_content_blocks', 'archive_videos', 'archive_gallery_images', 'archive_press_items')),
  constraint cms_change_logs_action_check
    check (action in ('create', 'update', 'hide', 'restore'))
);

create index if not exists cms_change_logs_created_at_idx
  on public.cms_change_logs (created_at desc);
create index if not exists cms_change_logs_target_idx
  on public.cms_change_logs (collection, row_id, created_at desc);
create index if not exists cms_change_logs_public_locale_idx
  on public.cms_change_logs (collection, public_id, locale, created_at desc);

alter table public.cms_change_logs enable row level security;

grant select, insert on public.cms_change_logs to authenticated;

create policy "active admins can read change logs"
on public.cms_change_logs
for select
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

create policy "active admins can insert own change logs"
on public.cms_change_logs
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_members m
    where m.active
      and m.id = admin_member_id
      and lower(m.email) = lower(admin_email)
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);
