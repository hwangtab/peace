-- 삭제된 테이블명 잔존 참조 정리(정합성). 보안 구멍은 아니나, drop된 테이블이
-- 화이트리스트/CHECK에 남아 있어 오해·런타임 오류 소지가 있다.
--   - cms_content_blocks: 20260623035300에서 drop
--   - archive_gallery_images: 20260625100000에서 drop(갤러리는 정적 json SSOT로 이관)

-- 1) admin_archive_facets 화이트리스트에서 archive_gallery_images 제거(본문은 동일).
create or replace function public.admin_archive_facets(p_table text, p_locale text)
returns table (event_type text, event_year integer)
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_table not in ('archive_videos', 'archive_press_items') then
    raise exception 'invalid table: %', p_table;
  end if;
  -- locale은 $1로 바인딩해 인젝션을 막는다(테이블명만 화이트리스트 후 format).
  return query execute format(
    'select distinct t.event_type, t.event_year from public.%I t where t.locale = $1',
    p_table
  ) using p_locale;
end;
$$;

-- 2) cms_change_logs.table_name CHECK를 현존 테이블로 현행화.
-- 과거 로그에 drop된 테이블명(cms_content_blocks/archive_gallery_images)이 남아 있을 수 있어
-- NOT VALID로 추가한다(기존 행은 검증 생략, 신규 INSERT부터 적용).
alter table public.cms_change_logs
  drop constraint if exists cms_change_logs_table_name_check;
alter table public.cms_change_logs
  add constraint cms_change_logs_table_name_check
  check (table_name in ('archive_videos', 'archive_press_items')) not valid;
