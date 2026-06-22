-- 기획단 회의록 시스템: 회의/안건/참석자/첨부 (관리자 전용 비공개)

create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  meeting_date date,
  meeting_time text not null default '',
  location text not null default '',
  status text not null default 'scheduled',
  minutes_md text not null default '',
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meetings_title_len check (char_length(title) between 1 and 200),
  constraint meetings_status_check check (status in ('scheduled', 'completed'))
);
create index if not exists meetings_date_idx on public.meetings (meeting_date desc, created_at desc);

create table if not exists public.meeting_agendas (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  title text not null,
  content text not null default '',
  sort_order int not null default 0,
  status text not null default 'proposed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint meeting_agendas_title_len check (char_length(title) between 1 and 200),
  constraint meeting_agendas_status_check check (status in ('proposed', 'discussed', 'resolved'))
);
create index if not exists meeting_agendas_meeting_idx on public.meeting_agendas (meeting_id, sort_order, created_at);

create table if not exists public.meeting_attendees (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  name text not null,
  note text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  constraint meeting_attendees_name_len check (char_length(name) between 1 and 50)
);
create index if not exists meeting_attendees_meeting_idx on public.meeting_attendees (meeting_id, sort_order, created_at);

create table if not exists public.meeting_attachments (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid not null references public.meetings (id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  mime_type text,
  uploaded_by text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists meeting_attachments_meeting_idx on public.meeting_attachments (meeting_id, created_at desc);

alter table public.meetings enable row level security;
alter table public.meeting_agendas enable row level security;
alter table public.meeting_attendees enable row level security;
alter table public.meeting_attachments enable row level security;

-- Intentionally NOT granted to anon. 회의록은 관리자 전용 비공개.
grant select, insert, update, delete on public.meetings to authenticated;
grant select, insert, update, delete on public.meeting_agendas to authenticated;
grant select, insert, update, delete on public.meeting_attendees to authenticated;
grant select, insert, update, delete on public.meeting_attachments to authenticated;

-- meetings
drop policy if exists "active admins read meetings" on public.meetings;
create policy "active admins read meetings" on public.meetings
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert meetings" on public.meetings;
create policy "editors insert meetings" on public.meetings
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update meetings" on public.meetings;
create policy "editors update meetings" on public.meetings
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete meetings" on public.meetings;
create policy "editors delete meetings" on public.meetings
for delete to authenticated using (public.admin_can_edit());

-- meeting_agendas
drop policy if exists "active admins read agendas" on public.meeting_agendas;
create policy "active admins read agendas" on public.meeting_agendas
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert agendas" on public.meeting_agendas;
create policy "editors insert agendas" on public.meeting_agendas
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update agendas" on public.meeting_agendas;
create policy "editors update agendas" on public.meeting_agendas
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete agendas" on public.meeting_agendas;
create policy "editors delete agendas" on public.meeting_agendas
for delete to authenticated using (public.admin_can_edit());

-- meeting_attendees
drop policy if exists "active admins read attendees" on public.meeting_attendees;
create policy "active admins read attendees" on public.meeting_attendees
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert attendees" on public.meeting_attendees;
create policy "editors insert attendees" on public.meeting_attendees
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update attendees" on public.meeting_attendees;
create policy "editors update attendees" on public.meeting_attendees
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete attendees" on public.meeting_attendees;
create policy "editors delete attendees" on public.meeting_attendees
for delete to authenticated using (public.admin_can_edit());

-- meeting_attachments
drop policy if exists "active admins read attachments" on public.meeting_attachments;
create policy "active admins read attachments" on public.meeting_attachments
for select to authenticated using (public.is_active_admin());
drop policy if exists "editors insert attachments" on public.meeting_attachments;
create policy "editors insert attachments" on public.meeting_attachments
for insert to authenticated with check (public.admin_can_edit());
drop policy if exists "editors update attachments" on public.meeting_attachments;
create policy "editors update attachments" on public.meeting_attachments
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());
drop policy if exists "editors delete attachments" on public.meeting_attachments;
create policy "editors delete attachments" on public.meeting_attachments
for delete to authenticated using (public.admin_can_edit());

drop trigger if exists set_meetings_updated_at on public.meetings;
create trigger set_meetings_updated_at before update on public.meetings
for each row execute function public.set_updated_at();

drop trigger if exists set_meeting_agendas_updated_at on public.meeting_agendas;
create trigger set_meeting_agendas_updated_at before update on public.meeting_agendas
for each row execute function public.set_updated_at();

-- 비공개 버킷 (public=false): 공개 URL 없음, signed URL 또는 admin 세션으로만 접근
insert into storage.buckets (id, name, public) values ('meeting-files', 'meeting-files', false)
on conflict (id) do nothing;

-- 용량 제한 20MB. MIME 화이트리스트는 두지 않는다(문서 유형이 다양하고 hwp 등은 브라우저 MIME가 비어
-- 정상 업로드가 막히므로). 클라이언트가 확장자 화이트리스트로 1차 검증하고, 버킷은 admin 전용 + 용량으로 방어.
update storage.buckets set file_size_limit = 20971520 where id = 'meeting-files';

drop policy if exists "active admins read meeting files" on storage.objects;
create policy "active admins read meeting files" on storage.objects
for select to authenticated using (bucket_id = 'meeting-files' and public.is_active_admin());
drop policy if exists "editors upload meeting files" on storage.objects;
create policy "editors upload meeting files" on storage.objects
for insert to authenticated with check (bucket_id = 'meeting-files' and public.admin_can_edit());
drop policy if exists "editors update meeting files" on storage.objects;
create policy "editors update meeting files" on storage.objects
for update to authenticated
using (bucket_id = 'meeting-files' and public.admin_can_edit())
with check (bucket_id = 'meeting-files' and public.admin_can_edit());
drop policy if exists "editors delete meeting files" on storage.objects;
create policy "editors delete meeting files" on storage.objects
for delete to authenticated using (bucket_id = 'meeting-files' and public.admin_can_edit());
