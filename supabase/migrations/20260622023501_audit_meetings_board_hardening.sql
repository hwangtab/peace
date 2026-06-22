-- 관리자 시스템 전수감사 후속 하드닝
--
-- [B] meeting-files 스토리지 업로드 경로 제약:
--   기존 INSERT/UPDATE 정책은 bucket_id + admin_can_edit()만 검사해 에디터가 버킷 임의 경로에
--   파일을 올릴 수 있었다(메타 API는 meeting_id/ 접두사를 강제하지만 스토리지 객체 자체는 막지 못함).
--   board-images의 per-user 폴더 스코핑과 동일한 취지로, 첫 경로 세그먼트가 UUID(회의 폴더)
--   형태여야만 업로드/수정되도록 제약한다.
drop policy if exists "editors upload meeting files" on storage.objects;
create policy "editors upload meeting files" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'meeting-files'
  and public.admin_can_edit()
  and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

drop policy if exists "editors update meeting files" on storage.objects;
create policy "editors update meeting files" on storage.objects
for update to authenticated
using (bucket_id = 'meeting-files' and public.admin_can_edit())
with check (
  bucket_id = 'meeting-files'
  and public.admin_can_edit()
  and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
);

-- [G] posts INSERT 컬럼 grant에서 status 제거:
--   기존 grant는 status를 포함해, 일반 회원이 직접 REST로 status='hidden' 게시글을 만들 수 있었다
--   (enforce_status_moderation 트리거는 BEFORE UPDATE만 적용되어 INSERT를 막지 못함).
--   게시글 생성 경로(PostForm)는 status를 보내지 않으므로 DB 기본값('published')이 항상 적용된다.
--   따라서 status를 insert 가능 컬럼에서 제외해도 정상 생성은 영향이 없고, 주입 경로만 차단된다.
revoke insert on public.posts from authenticated;
grant insert (board_id, author_id, title, body, rating) on public.posts to authenticated;
