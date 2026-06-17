import type { GetServerSidePropsContext } from 'next';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import { getAdminSession, redirectToAdminLogin } from '@/lib/adminAuth';
import { createSupabaseServerClient } from '@/lib/supabaseServer';
import type { AdminMember } from '@/types/cms';

interface AdminHomeProps {
  member: AdminMember;
  counts: {
    content: number;
    videos: number;
    gallery: number;
    press: number;
  };
}

const ADMIN_CARDS = [
  {
    href: '/admin/content',
    title: '웹사이트 문구',
    body: '페이지 제목, 소개 문단, 안내 문구를 직접 고칩니다.',
    key: 'content',
  },
  {
    href: '/admin/videos',
    title: '비디오 아카이브',
    body: '유튜브 링크와 영상 설명을 추가하거나 공개에서 내립니다.',
    key: 'videos',
  },
  {
    href: '/admin/gallery',
    title: '갤러리 아카이브',
    body: '사진 URL, 촬영자, 연도별 노출 상태를 관리합니다.',
    key: 'gallery',
  },
  {
    href: '/admin/press',
    title: '언론보도 아카이브',
    body: '기사 링크, 매체명, 대표 이미지와 요약을 관리합니다.',
    key: 'press',
  },
] as const;

export default function AdminHomePage({ member, counts }: AdminHomeProps) {
  return (
    <AdminLayout title="상황판" member={member}>
      <div className="mb-8 max-w-3xl">
        <h1 className="font-display text-3xl font-bold">웹사이트 관리 상황판</h1>
        <p className="mt-2 text-coastal-gray">
          제3회 캠프 이후에는 운영 체크리스트보다 아카이브 완성도와 공개 콘텐츠 관리가 중심입니다.
          아래 메뉴에서 문구, 영상, 사진, 언론보도를 직접 추가하고 내릴 수 있습니다.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ADMIN_CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="rounded border border-deep-ocean/10 bg-white p-5 transition hover:-translate-y-0.5 hover:border-jeju-ocean/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jeju-ocean"
          >
            <span className="text-sm font-semibold text-jeju-ocean">{counts[card.key]}개 등록</span>
            <h2 className="mt-2 font-display text-2xl font-bold">{card.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-coastal-gray">{card.body}</p>
          </Link>
        ))}
      </div>
    </AdminLayout>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const session = await getAdminSession(context);
  if (!session) return redirectToAdminLogin(context.resolvedUrl);

  const supabase = createSupabaseServerClient(context.req, context.res);
  const [content, videos, gallery, press] = await Promise.all([
    supabase.from('cms_content_blocks').select('id', { count: 'exact', head: true }),
    supabase.from('archive_videos').select('id', { count: 'exact', head: true }),
    supabase.from('archive_gallery_images').select('id', { count: 'exact', head: true }),
    supabase.from('archive_press_items').select('id', { count: 'exact', head: true }),
  ]);

  return {
    props: {
      member: session.member,
      counts: {
        content: content.count ?? 0,
        videos: videos.count ?? 0,
        gallery: gallery.count ?? 0,
        press: press.count ?? 0,
      },
    },
  };
}
