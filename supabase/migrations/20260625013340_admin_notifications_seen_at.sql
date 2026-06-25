-- 관리자 종 알림의 "읽음" 기준 시각. 이 시각 이후 발생한 이벤트를 안읽음으로 본다.
-- 기존 기획단 행은 now()로 채워 도입 시점 이전 이벤트가 한꺼번에 안읽음으로 잡히지 않게 한다.
alter table public.admin_members add column if not exists notifications_seen_at timestamptz;
update public.admin_members set notifications_seen_at = now() where notifications_seen_at is null;
