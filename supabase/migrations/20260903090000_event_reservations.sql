-- 공연 예매 접수(event_reservations).
-- Keep Singing for Palestine(2026-09-19) 등 단발 공연의 예매 신청을 담는다.
-- 쓰기는 서버 API(service role)만 하고, 공개 정책은 두지 않는다.
-- is_active_admin()/admin_can_edit()/set_updated_at()은 기존 마이그레이션 것을 재사용한다.

create table if not exists public.event_reservations (
  id uuid primary key default gen_random_uuid(),
  event_slug text not null,
  name text not null,
  phone text not null, -- 정규화 010-0000-0000
  quantity smallint not null check (quantity between 1 and 4),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled')),
  admin_note text,
  privacy_agreed_at timestamptz not null default now(),
  client_ip text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_reservations_name_len check (char_length(name) between 1 and 40)
);

-- 활성(취소 아님) 건은 공연별 연락처당 1건 — 중복 접수 방지(위반 시 23505 → API 409).
create unique index if not exists event_reservations_active_phone
  on public.event_reservations (event_slug, phone)
  where status <> 'cancelled';

create index if not exists event_reservations_event_created_idx
  on public.event_reservations (event_slug, created_at desc);

drop trigger if exists set_event_reservations_updated_at on public.event_reservations;
create trigger set_event_reservations_updated_at
before update on public.event_reservations
for each row execute function public.set_updated_at();

alter table public.event_reservations enable row level security;

grant select, update, delete on public.event_reservations to authenticated;

-- 공개 정책 없음(anon 접근 불가). 관리자만 조회·수정·삭제.
drop policy if exists event_reservations_admin_read on public.event_reservations;
create policy event_reservations_admin_read on public.event_reservations
  for select using (public.is_active_admin());

drop policy if exists event_reservations_admin_write on public.event_reservations;
create policy event_reservations_admin_write on public.event_reservations
  for update using (public.admin_can_edit()) with check (public.admin_can_edit());

drop policy if exists event_reservations_admin_delete on public.event_reservations;
create policy event_reservations_admin_delete on public.event_reservations
  for delete using (public.admin_can_edit());
