-- archive_videos: 뮤지션이 아닌 외부 영상감독의 이름을 직접 저장하기 위한 컬럼.
-- 기존 director_musician_id(뮤지션 감독)와 병행한다. 공개 페이지는 뮤지션 감독을
-- 우선 표시하고, 없을 때 director_name을 이름 크레딧으로 보여준다.
alter table public.archive_videos
  add column if not exists director_name text;
