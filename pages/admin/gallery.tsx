import type { GetServerSidePropsContext } from 'next';

// 갤러리는 정적 json(public/data/gallery/*)을 단일 출처(SSOT)로 전환했다.
// 어드민 CMS 편집 레이어(archive_gallery_images)는 화면에 반영되지 않으므로
// 메뉴를 제거하고, 직접 접근(북마크 등)은 상황판으로 리다이렉트한다.
export default function AdminGalleryRemoved() {
  return null;
}

export const getServerSideProps = async (_context: GetServerSidePropsContext) => ({
  redirect: { destination: '/admin', permanent: false },
});
