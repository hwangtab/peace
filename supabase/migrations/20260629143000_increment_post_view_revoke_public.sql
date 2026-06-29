-- 보정: 직전 마이그레이션의 `revoke ... from anon`만으로는 anon 호출이 막히지 않았다.
-- Postgres 함수는 생성 시 PUBLIC에 EXECUTE가 기본 부여되므로, anon은 PUBLIC 경로로
-- 여전히 실행할 수 있었다(검증에서 STILL ALLOWED 확인). PUBLIC에서 회수하고
-- 로그인 회원(authenticated)에게만 명시 부여한다.
revoke execute on function public.increment_post_view(uuid) from public;
revoke execute on function public.increment_post_view(uuid) from anon;
grant execute on function public.increment_post_view(uuid) to authenticated;
