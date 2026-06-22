-- prevent_last_owner_loss 트리거 버그 수정:
-- 기존 함수는 `select count(*) ... for update`로 잠금을 시도했으나 Postgres는
-- 집계 함수와 FOR UPDATE를 함께 쓸 수 없어(0A000) 활성 owner의 강등/비활성화/삭제 시
-- 항상 에러가 났다. 행을 FOR UPDATE로 잠근 뒤 get diagnostics의 row_count로 세도록 고친다.
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

  -- Lock other active owner rows (FOR UPDATE cannot be combined with an aggregate),
  -- then read how many were locked via row_count.
  perform 1
  from public.admin_members
  where role = 'owner' and active and id <> old.id
  for update;
  get diagnostics remaining = row_count;

  if remaining = 0 then
    raise exception 'cannot remove or demote the last active owner';
  end if;

  if (tg_op = 'DELETE') then return old; else return new; end if;
end;
$$;
