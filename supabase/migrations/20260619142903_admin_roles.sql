-- Role-based access control for the admin CMS.
--
-- Before this migration every active admin (any role) could write to all
-- content tables, because each write policy only checked `active`. Auth uses the
-- anon key + authenticated cookies, so RLS is the real enforcement layer: a
-- viewer could call the Supabase REST API directly and mutate data. This
-- migration introduces SECURITY DEFINER role helpers and rewrites the write
-- policies so only owner/editor can mutate content, and only owner can manage
-- members.

-- Role helpers. SECURITY DEFINER so they can read admin_members regardless of
-- that table's own RLS (avoids recursive policy evaluation). search_path is
-- pinned for safety.
create or replace function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_members m
    where m.active
      and (
        m.user_id = auth.uid()
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

create or replace function public.admin_can_edit()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_members m
    where m.active
      and m.role in ('owner', 'editor')
      and (
        m.user_id = auth.uid()
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

create or replace function public.is_admin_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_members m
    where m.active
      and m.role = 'owner'
      and (
        m.user_id = auth.uid()
        or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
      )
  );
$$;

grant execute on function public.is_active_admin() to anon, authenticated;
grant execute on function public.admin_can_edit() to anon, authenticated;
grant execute on function public.is_admin_owner() to anon, authenticated;

-- cms_content_blocks: viewers keep read access, only editors+ may write.
drop policy if exists "published content is public and admins can read all" on public.cms_content_blocks;
create policy "published content is public and admins can read all"
on public.cms_content_blocks
for select
to anon, authenticated
using (status = 'published' or public.is_active_admin());

drop policy if exists "admins can insert content" on public.cms_content_blocks;
create policy "admins can insert content"
on public.cms_content_blocks
for insert
to authenticated
with check (public.admin_can_edit());

drop policy if exists "admins can update content" on public.cms_content_blocks;
create policy "admins can update content"
on public.cms_content_blocks
for update
to authenticated
using (public.admin_can_edit())
with check (public.admin_can_edit());

drop policy if exists "admins can delete content" on public.cms_content_blocks;
create policy "admins can delete content"
on public.cms_content_blocks
for delete
to authenticated
using (public.admin_can_edit());

-- archive_videos
drop policy if exists "published videos are public and admins can read all" on public.archive_videos;
create policy "published videos are public and admins can read all"
on public.archive_videos
for select
to anon, authenticated
using (status = 'published' or public.is_active_admin());

drop policy if exists "admins can manage videos" on public.archive_videos;
create policy "admins can manage videos"
on public.archive_videos
for all
to authenticated
using (public.admin_can_edit())
with check (public.admin_can_edit());

-- archive_gallery_images
drop policy if exists "published gallery images are public and admins can read all" on public.archive_gallery_images;
create policy "published gallery images are public and admins can read all"
on public.archive_gallery_images
for select
to anon, authenticated
using (status = 'published' or public.is_active_admin());

drop policy if exists "admins can manage gallery images" on public.archive_gallery_images;
create policy "admins can manage gallery images"
on public.archive_gallery_images
for all
to authenticated
using (public.admin_can_edit())
with check (public.admin_can_edit());

-- archive_press_items
drop policy if exists "published press items are public and admins can read all" on public.archive_press_items;
create policy "published press items are public and admins can read all"
on public.archive_press_items
for select
to anon, authenticated
using (status = 'published' or public.is_active_admin());

drop policy if exists "admins can manage press items" on public.archive_press_items;
create policy "admins can manage press items"
on public.archive_press_items
for all
to authenticated
using (public.admin_can_edit())
with check (public.admin_can_edit());

-- admin_members: owners can read every member and manage membership. Existing
-- "active admins can read own membership" policy stays so non-owners can still
-- resolve their own row during auth.
grant insert, update, delete on public.admin_members to authenticated;

drop policy if exists "owners can read all members" on public.admin_members;
create policy "owners can read all members"
on public.admin_members
for select
to authenticated
using (public.is_admin_owner());

drop policy if exists "owners can insert members" on public.admin_members;
create policy "owners can insert members"
on public.admin_members
for insert
to authenticated
with check (public.is_admin_owner());

drop policy if exists "owners can update members" on public.admin_members;
create policy "owners can update members"
on public.admin_members
for update
to authenticated
using (public.is_admin_owner())
with check (public.is_admin_owner());

drop policy if exists "owners can delete members" on public.admin_members;
create policy "owners can delete members"
on public.admin_members
for delete
to authenticated
using (public.is_admin_owner());
