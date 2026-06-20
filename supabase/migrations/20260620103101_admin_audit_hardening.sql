-- Admin-system audit hardening.

-- FIX 1 (HIGH): archive-gallery storage policies still gate writes on "any active
-- admin" (is_active_admin equivalent), not edit privilege — a viewer-role admin can
-- upload/overwrite/delete gallery objects via Storage REST. Align with content tables
-- (admin_can_edit = owner/editor). Public SELECT stays as-is.
drop policy if exists "active admins can upload archive gallery files" on storage.objects;
create policy "editors can upload archive gallery files" on storage.objects for insert to authenticated
with check (bucket_id = 'archive-gallery' and public.admin_can_edit());

drop policy if exists "active admins can update archive gallery files" on storage.objects;
create policy "editors can update archive gallery files" on storage.objects for update to authenticated
using (bucket_id = 'archive-gallery' and public.admin_can_edit())
with check (bucket_id = 'archive-gallery' and public.admin_can_edit());

drop policy if exists "active admins can delete archive gallery files" on storage.objects;
create policy "editors can delete archive gallery files" on storage.objects for delete to authenticated
using (bucket_id = 'archive-gallery' and public.admin_can_edit());

-- FIX 2 (MEDIUM): cms_change_logs INSERT allowed any active admin (incl. viewer) to
-- forge audit rows. Require editor/owner (the roles that can actually mutate content),
-- keeping the self-binding so writers can only log under their own identity.
drop policy if exists "active admins can insert own change logs" on public.cms_change_logs;
create policy "editors can insert own change logs" on public.cms_change_logs for insert to authenticated
with check (
  public.admin_can_edit()
  and exists (
    select 1 from public.admin_members m
    where m.active
      and m.id = admin_member_id
      and lower(m.email) = lower(admin_email)
      and (m.user_id = (select auth.uid()) or lower(m.email) = lower(coalesce(auth.jwt() ->> 'email','')))
  )
);

-- FIX 3 (MEDIUM): last-active-owner invariant only existed in the members API; direct
-- REST (UPDATE/DELETE) by an owner could drop active owners to zero → permanent lockout.
-- Enforce in the DB so it holds regardless of entry point and is concurrency-safe.
create or replace function public.prevent_last_owner_loss()
returns trigger language plpgsql security definer set search_path = public as $$
declare remaining int;
begin
  -- Only act when an active owner is being demoted/deactivated (UPDATE) or removed (DELETE).
  if (tg_op = 'UPDATE') then
    if not (old.role = 'owner' and old.active) then return new; end if;
    if (new.role = 'owner' and new.active) then return new; end if; -- still an active owner
  elsif (tg_op = 'DELETE') then
    if not (old.role = 'owner' and old.active) then return old; end if;
  end if;

  select count(*) into remaining
  from public.admin_members
  where role = 'owner' and active and id <> old.id
  for update;

  if remaining = 0 then
    raise exception 'cannot remove or demote the last active owner';
  end if;

  if (tg_op = 'DELETE') then return old; else return new; end if;
end;
$$;

drop trigger if exists admin_members_prevent_last_owner on public.admin_members;
create trigger admin_members_prevent_last_owner
before update or delete on public.admin_members
for each row execute function public.prevent_last_owner_loss();
