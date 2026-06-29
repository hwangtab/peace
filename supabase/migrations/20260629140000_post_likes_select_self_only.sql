-- post_likes SELECT 노출 축소 (PII 보호).
--
-- 기존 정책은 `using (true)`라 익명 포함 누구나 GET /rest/v1/post_likes 로
-- "어떤 회원(user_id)이 어떤 게시글을 좋아요했는지" 전체 목록을 조회할 수 있었다.
-- profiles가 공개(nickname)라 user_id→닉네임 연결까지 가능해 회원 행동 패턴이 노출됐다.
--
-- 좋아요 "수"는 posts.like_count 비정규화 컬럼(sync_post_like_count 트리거 유지)으로 충족되고,
-- "내가 좋아요했는지" 여부는 본인 행 조회로 충분하다(LikeButton은 .eq('user_id', auth.uid())로 조회).
-- 따라서 SELECT를 본인 행으로 제한한다. INSERT/DELETE 정책(본인만)은 그대로 둔다.
drop policy if exists "likes readable" on public.post_likes;
create policy "likes readable" on public.post_likes
for select
to anon, authenticated
using (user_id = (select auth.uid()));
