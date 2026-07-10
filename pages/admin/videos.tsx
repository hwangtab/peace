import type { GetServerSidePropsContext } from 'next';

// 비디오는 정적 json(public/data/**/videos.json)을 단일 출처(SSOT)로 전환했다.
// 어드민 CMS 편집 레이어(archive_videos)는 공개 사이트에 반영되지 않으므로
// 메뉴를 제거하고, 직접 접근(북마크 등)은 상황판으로 리다이렉트한다.
// 참조: [[project_gallery_static_ssot]] [[project_supabase_egress]]
export default function AdminVideosRemoved() {
  return null;
}

export const getServerSideProps = async (_context: GetServerSidePropsContext) => ({
  redirect: { destination: '/admin', permanent: false },
});
