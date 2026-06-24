-- 회의록에 캠프 회차(연도) 부여. meeting_date(회의 날짜)와 별개 — 제3회 캠프 준비 회의는
-- 2025-11~2026-06에 걸쳐 있어 회의 날짜로 묶으면 회차가 쪼개진다.
alter table public.meetings add column if not exists event_year integer;
-- 기존 14건은 전부 제3회(2026) 자료.
update public.meetings set event_year = 2026 where event_year is null;
create index if not exists meetings_event_year_idx on public.meetings (event_year);
