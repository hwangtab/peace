-- 단체 메일 발송 작업(job) — 청크 발송의 진행 커서·수신자 스냅샷 보관.
-- 한 HTTP 요청당 소분량(청크)만 발송하고 진행 상태를 여기 저장, 클라이언트가
-- 완료까지 반복 호출한다. job.id 가 곧 campaign_id 이며, 실제 발송 1건씩은
-- mailbox_messages 에 기록된다(멱등성 판정의 진실 원천).
--
-- 정책은 mailbox_messages / mail_contacts 와 동일 수준: anon 미부여, 관리자 세션 + RLS.
create table if not exists public.mail_broadcast_jobs (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  text_body text not null,
  from_email text not null default '',
  -- 발송 시점에 고정한 수신자 명단 스냅샷: [{ id, name, email }, ...]
  -- (명단이 발송 도중 바뀌어도 흔들리지 않도록 동결)
  recipients jsonb not null default '[]'::jsonb,
  total integer not null default 0,
  -- 다음에 발송할 recipients 인덱스(= 지금까지 처리한 수신자 수)
  cursor integer not null default 0,
  -- 누적 성공 건수
  sent_count integer not null default 0,
  -- 누적 실패 목록: [{ email, error }, ...] (직접입력 형식 오류도 포함)
  failed jsonb not null default '[]'::jsonb,
  status text not null default 'in_progress',
  created_by text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mail_broadcast_jobs_status_check check (status in ('in_progress', 'done'))
);
create index if not exists mail_broadcast_jobs_status_idx
  on public.mail_broadcast_jobs (status, created_at desc);

alter table public.mail_broadcast_jobs enable row level security;

-- anon 미부여. 관리자 전용.
grant select, insert, update, delete on public.mail_broadcast_jobs to authenticated;

drop policy if exists "active admins read broadcast jobs" on public.mail_broadcast_jobs;
create policy "active admins read broadcast jobs" on public.mail_broadcast_jobs
for select to authenticated using (public.is_active_admin());

drop policy if exists "editors insert broadcast jobs" on public.mail_broadcast_jobs;
create policy "editors insert broadcast jobs" on public.mail_broadcast_jobs
for insert to authenticated with check (public.admin_can_edit());

drop policy if exists "editors update broadcast jobs" on public.mail_broadcast_jobs;
create policy "editors update broadcast jobs" on public.mail_broadcast_jobs
for update to authenticated using (public.admin_can_edit()) with check (public.admin_can_edit());

drop policy if exists "editors delete broadcast jobs" on public.mail_broadcast_jobs;
create policy "editors delete broadcast jobs" on public.mail_broadcast_jobs
for delete to authenticated using (public.admin_can_edit());
