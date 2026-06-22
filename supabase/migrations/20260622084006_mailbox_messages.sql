-- 관리자 메일함: admin@peaceandmusic.net 수신 메일(Resend 인바운드)과 답장 보관
-- 받기는 webhook이 service_role로 insert(RLS 우회), 읽기/답장은 admin 세션 + RLS.

create table if not exists public.mailbox_messages (
  id uuid primary key default gen_random_uuid(),
  direction text not null,
  resend_id text,
  from_email text not null default '',
  from_name text not null default '',
  to_email text not null default '',
  subject text not null default '',
  text_body text not null default '',
  html_body text not null default '',
  reply_to_id uuid references public.mailbox_messages (id) on delete set null,
  is_read boolean not null default false,
  created_by text not null default '',
  created_at timestamptz not null default now(),
  constraint mailbox_messages_direction_check check (direction in ('inbound', 'outbound'))
);
create index if not exists mailbox_messages_list_idx on public.mailbox_messages (direction, created_at desc);
create unique index if not exists mailbox_messages_resend_id_uniq
  on public.mailbox_messages (resend_id)
  where resend_id is not null;

alter table public.mailbox_messages enable row level security;

-- Intentionally NOT granted to anon. 관리자 전용. webhook은 service_role로 insert.
grant select, insert, update, delete on public.mailbox_messages to authenticated;

drop policy if exists "active admins read mailbox" on public.mailbox_messages;
create policy "active admins read mailbox" on public.mailbox_messages
for select to authenticated using (public.is_active_admin());

drop policy if exists "editors insert mailbox" on public.mailbox_messages;
create policy "editors insert mailbox" on public.mailbox_messages
for insert to authenticated with check (public.admin_can_edit());

drop policy if exists "editors update mailbox" on public.mailbox_messages;
create policy "editors update mailbox" on public.mailbox_messages
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());

drop policy if exists "editors delete mailbox" on public.mailbox_messages;
create policy "editors delete mailbox" on public.mailbox_messages
for delete to authenticated using (public.admin_can_edit());
