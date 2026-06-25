-- 갤러리를 정적 json(public/data/gallery/*, 이미지 폴더 스캔으로 자동 생성)
-- 단일 출처(SSOT)로 전환함에 따라 archive_gallery_images CMS 테이블을 제거한다.
--
-- 배경: 이 테이블은 정적 갤러리의 stale 부분집합이었고(고유 데이터 0),
-- public_id = eventYear*100000 + typeOffset + id 합성값이 런타임 merge 의
-- 원본 id 와 영원히 불일치해 같은 이미지가 중복 노출(React key 충돌)되는
-- 원인이었다. 런타임은 더 이상 이 테이블을 읽지 않으며(loadPublishedGallery
-- 가 정적만 반환), 어드민 편집 메뉴도 제거됐다.
--
-- videos/press archive 테이블은 계속 사용하므로 건드리지 않는다.

drop table if exists public.archive_gallery_images cascade;
