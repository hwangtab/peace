-- 필터 옵션을 현재 언어(locale) 기준으로 산출하도록 admin_archive_facets에 p_locale 추가.
-- 기존엔 locale 무관 distinct라, 특정 언어에만 있는 유형/연도가 옵션에 떠서 선택 시 빈 목록이 됐다.
-- 목록 쿼리가 locale로 필터되므로 옵션도 같은 locale 기준이어야 일치한다.
drop function if exists public.admin_archive_facets(text);

create or replace function public.admin_archive_facets(p_table text, p_locale text)
returns table (event_type text, event_year integer)
language plpgsql
security invoker
set search_path = public
as $$
begin
  if p_table not in ('archive_videos', 'archive_gallery_images', 'archive_press_items') then
    raise exception 'invalid table: %', p_table;
  end if;
  -- locale은 $1로 바인딩해 인젝션을 막는다(테이블명만 화이트리스트 후 format).
  return query execute format(
    'select distinct t.event_type, t.event_year from public.%I t where t.locale = $1',
    p_table
  ) using p_locale;
end;
$$;

grant execute on function public.admin_archive_facets(text, text) to authenticated;
