-- increment_post_view 실행 권한을 로그인 회원으로 제한.
--
-- 기존엔 anon에게도 execute가 허용돼, 비로그인 사용자가 임의 post_id로 무제한 조회수 조작이
-- 가능했고(SECURITY DEFINER로 RLS 우회), published 여부에 따라 view_count가 증가/미증가하는
-- 차이로 게시글 존재 여부를 캐내는 오라클로도 악용될 수 있었다.
-- 함수 본문(공개 글만 +1)은 그대로 두고 anon 실행 권한만 회수한다.
revoke execute on function public.increment_post_view(uuid) from anon;
