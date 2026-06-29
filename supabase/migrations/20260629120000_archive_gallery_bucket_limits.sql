-- archive-gallery 버킷에 MIME 화이트리스트 + 크기 제한 추가.
-- 생성(20260617032014) 당시 제한이 없어 관리자 실수로 임의 MIME/대용량 파일 업로드가
-- 가능했다. board-images(이미지 4종·10MB)와 동일한 화이트리스트를 적용하되, 아카이브
-- 갤러리는 고화질 원본을 다루므로 상한은 meeting-files 와 같은 20MB 로 둔다.
-- 기존 업로드 객체에는 영향이 없고 향후 업로드만 제한된다.
update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
    file_size_limit = 20971520
where id = 'archive-gallery';
