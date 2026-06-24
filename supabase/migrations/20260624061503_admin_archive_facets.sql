-- 아카이브 목록의 유형/연도 필터 옵션 동적 생성용 distinct 조회 함수.
-- PostgREST가 행 응답을 db-max-rows(1000)로 잘라, 갤러리(1.6만행)처럼 큰 테이블은
-- event_type/event_year를 단순 select로 모으면 일부 연도(예: 2026)가 누락된다.
-- distinct를 DB에서 계산해 작은 결과만 반환한다.
-- SECURITY INVOKER: 호출자(관리자 세션)의 RLS가 그대로 적용된다(is_active_admin select 허용).
create or replace function public.admin_archive_facets(p_table text)
returns table (event_type text, event_year integer)
language plpgsql
security invoker
set search_path = public
as $$
begin
  -- 화이트리스트로 임의 테이블 조회 차단.
  if p_table not in ('archive_videos', 'archive_gallery_images', 'archive_press_items') then
    raise exception 'invalid table: %', p_table;
  end if;
  return query execute format(
    'select distinct t.event_type, t.event_year from public.%I t',
    p_table
  );
end;
$$;

grant execute on function public.admin_archive_facets(text) to authenticated;
