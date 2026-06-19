-- Private long-form documents for the admin area (e.g. the camp operations
-- whitepaper). The repo is public and the whitepaper contains sensitive budget
-- and settlement data, so the body is NEVER committed to git — it lives only
-- here in the database. anon has no access at all; only active admins can read,
-- and editors/owners can write.

create table if not exists public.admin_documents (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  body_md text not null default '',
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint admin_documents_slug_unique unique (slug)
);

create index if not exists admin_documents_slug_idx on public.admin_documents (slug);

alter table public.admin_documents enable row level security;

-- Intentionally NOT granted to anon.
grant select, insert, update, delete on public.admin_documents to authenticated;

drop trigger if exists set_admin_documents_updated_at on public.admin_documents;
create trigger set_admin_documents_updated_at
before update on public.admin_documents
for each row execute function public.set_updated_at();

drop policy if exists "active admins can read documents" on public.admin_documents;
create policy "active admins can read documents"
on public.admin_documents
for select
to authenticated
using (public.is_active_admin());

drop policy if exists "editors can insert documents" on public.admin_documents;
create policy "editors can insert documents"
on public.admin_documents
for insert
to authenticated
with check (public.admin_can_edit());

drop policy if exists "editors can update documents" on public.admin_documents;
create policy "editors can update documents"
on public.admin_documents
for update
to authenticated
using (public.admin_can_edit())
with check (public.admin_can_edit());

drop policy if exists "editors can delete documents" on public.admin_documents;
create policy "editors can delete documents"
on public.admin_documents
for delete
to authenticated
using (public.admin_can_edit());
