-- PEACE archive CMS locale/storage hardening.
-- v1 CMS is multilingual: media/content rows are managed per locale, while
-- archive hide actions can still target all locale variants by public_id.

update public.admin_members
set email = lower(email)
where email <> lower(email);

alter table public.admin_members
  add constraint admin_members_email_lowercase_check check (email = lower(email));

create unique index if not exists admin_members_email_lower_unique_idx
  on public.admin_members (lower(email));

alter table public.archive_gallery_images
  add column if not exists locale text not null default 'ko';

alter table public.cms_content_blocks
  add constraint cms_content_blocks_locale_check
  check (locale in ('ko', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'ja', 'zh-Hans', 'zh-Hant', 'hi', 'id'));
alter table public.archive_videos
  add constraint archive_videos_locale_check
  check (locale in ('ko', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'ja', 'zh-Hans', 'zh-Hant', 'hi', 'id'));
alter table public.archive_press_items
  add constraint archive_press_items_locale_check
  check (locale in ('ko', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'ja', 'zh-Hans', 'zh-Hant', 'hi', 'id'));
alter table public.archive_gallery_images
  add constraint archive_gallery_images_locale_check
  check (locale in ('ko', 'en', 'es', 'fr', 'de', 'pt', 'ru', 'ar', 'ja', 'zh-Hans', 'zh-Hant', 'hi', 'id'));

alter table public.archive_videos
  drop constraint if exists archive_videos_public_id_key;
alter table public.archive_press_items
  drop constraint if exists archive_press_items_public_id_key;
alter table public.archive_gallery_images
  drop constraint if exists archive_gallery_images_public_id_key;

alter table public.archive_videos
  add constraint archive_videos_public_id_locale_unique unique (public_id, locale);
alter table public.archive_press_items
  add constraint archive_press_items_public_id_locale_unique unique (public_id, locale);
alter table public.archive_gallery_images
  add constraint archive_gallery_images_public_id_locale_unique unique (public_id, locale);

create index if not exists archive_gallery_images_locale_public_idx
  on public.archive_gallery_images (status, locale, event_year desc, sort_order);

insert into storage.buckets (id, name, public)
values ('archive-gallery', 'archive-gallery', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

drop policy if exists "archive gallery files are publicly readable" on storage.objects;
drop policy if exists "active admins can upload archive gallery files" on storage.objects;
drop policy if exists "active admins can update archive gallery files" on storage.objects;
drop policy if exists "active admins can delete archive gallery files" on storage.objects;

create policy "archive gallery files are publicly readable"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'archive-gallery');

create policy "active admins can upload archive gallery files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'archive-gallery'
  and exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "active admins can update archive gallery files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'archive-gallery'
  and exists (
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
  bucket_id = 'archive-gallery'
  and exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);

create policy "active admins can delete archive gallery files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'archive-gallery'
  and exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = (select auth.uid())
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  )
);
