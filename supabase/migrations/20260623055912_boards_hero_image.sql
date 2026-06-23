-- 게시판별 히어로 배경 이미지를 관리자에서 지정할 수 있도록 컬럼 추가.
-- 비우면 코드의 폴백 히어로를 사용한다.
alter table public.boards
  add column if not exists hero_image_url text;
