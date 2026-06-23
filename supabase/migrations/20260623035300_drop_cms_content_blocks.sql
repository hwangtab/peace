-- 웹사이트 문구(content) 편집기 기능을 제거함에 따라 더 이상 쓰지 않는
-- cms_content_blocks 테이블을 삭제한다. (관련 RLS 정책·트리거·grant도 cascade로 함께 제거)
-- 과거 변경이력(admin_change_logs)의 content 관련 행은 그대로 보존된다(FK 없음).

drop table if exists public.cms_content_blocks cascade;
