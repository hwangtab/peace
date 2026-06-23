-- 단체 메일 수신자 명단 (관리자 전용 비공개)
create table if not exists public.mail_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  group_type text not null,
  cohorts text[] not null default '{}',
  note text not null default '',
  is_active boolean not null default true,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mail_contacts_name_len check (char_length(name) between 1 and 200),
  constraint mail_contacts_group_check check (group_type in ('musician', 'planning', 'sponsor')),
  constraint mail_contacts_email_format check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')
);

-- 같은 이메일 중복 방지(대소문자 무시)
create unique index if not exists mail_contacts_email_unique on public.mail_contacts (lower(email));
create index if not exists mail_contacts_group_idx on public.mail_contacts (group_type);
create index if not exists mail_contacts_cohorts_idx on public.mail_contacts using gin (cohorts);

alter table public.mail_contacts enable row level security;

-- anon 미부여. 관리자 전용.
grant select, insert, update, delete on public.mail_contacts to authenticated;

drop policy if exists "active admins read contacts" on public.mail_contacts;
create policy "active admins read contacts" on public.mail_contacts
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert contacts" on public.mail_contacts;
create policy "editors insert contacts" on public.mail_contacts
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update contacts" on public.mail_contacts;
create policy "editors update contacts" on public.mail_contacts
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete contacts" on public.mail_contacts;
create policy "editors delete contacts" on public.mail_contacts
for delete to authenticated using (public.admin_can_edit());

-- 단체 발송 추적: 같은 campaign_id로 묶고, 수신자별 실패 사유 기록
alter table public.mailbox_messages add column if not exists campaign_id uuid;
alter table public.mailbox_messages add column if not exists send_error text;
create index if not exists mailbox_messages_campaign_idx on public.mailbox_messages (campaign_id);
