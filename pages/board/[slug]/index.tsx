import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../next-i18next.config';
import { loadBoardBySlug, loadBoardPosts, loadBoardPostCount } from '@/lib/boardData';
import type { Board, PostWithMeta } from '@/types/board';
import PostCard from '@/components/board/PostCard';
import { useOptionalAuth } from '@/components/auth/AuthProvider';
import PageHero from '@/components/common/PageHero';

// 게시판별 히어로 배경 — 슬러그마다 테마에 맞는 다른 사진을 쓴다.
// 후기: 캠프 단체 기념사진 / 자유게시판: 강정 평화센터 앞 환호하는 사람들 / 공연 소식: 공연 현장.
// boards 테이블에 게시판이 추가되면 여기 매핑도 함께 갱신할 것(없으면 폴백 사용).
const BOARD_HERO_BY_SLUG: Record<string, string> = {
  reviews: '/images-webp/camps/2025/peacemusic-1.webp',
  free: '/images-webp/camps/2025/DSC00625.webp',
  shows: '/images-webp/camps/2025/DSC00976.webp',
};
const BOARD_DETAIL_HERO_FALLBACK = '/images-webp/camps/2025/DSC00798.webp';

const PAGE_SIZE = 20;

interface Props {
  board: Board;
  posts: PostWithMeta[];
  hasMore: boolean;
  offset: number;
  total: number;
}

export default function BoardSlugPage({ board, posts, hasMore, offset, total }: Props) {
  const { t } = useTranslation('board');
  const auth = useOptionalAuth();
  const isLoggedIn = Boolean(auth?.user);

  const nextOffset = offset + PAGE_SIZE;
  const prevOffset = Math.max(0, offset - PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHero
        compact
        title={board.name}
        backgroundImage={BOARD_HERO_BY_SLUG[board.slug] ?? BOARD_DETAIL_HERO_FALLBACK}
      />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <Link href="/board" className="text-sm text-coastal-gray hover:underline">
              ← {t('index.title')}
            </Link>
            {board.description && (
              <p className="mt-1 text-sm text-coastal-gray">{board.description}</p>
            )}
            <p className="mt-1 text-xs text-coastal-gray">
              {total} {t('index.posts')}
            </p>
          </div>
          {isLoggedIn ? (
            <Link
              href={`/board/${board.slug}/new`}
              className="flex-shrink-0 rounded-lg bg-jeju-ocean px-4 py-2 text-sm font-semibold text-white transition hover:bg-deep-ocean"
            >
              {t('index.writeCta')}
            </Link>
          ) : (
            <Link
              href={`/login?next=/board/${board.slug}/new`}
              className="flex-shrink-0 rounded-lg border border-jeju-ocean px-4 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam"
            >
              {t('index.loginToWrite')}
            </Link>
          )}
        </div>

        {posts.length === 0 ? (
          <p className="text-coastal-gray">{t('list.empty')}</p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id}>
                <PostCard post={post} boardSlug={board.slug} />
              </li>
            ))}
          </ul>
        )}

        {(offset > 0 || hasMore) && (
          <div className="mt-8 flex items-center justify-between gap-4">
            {offset > 0 ? (
              <Link
                href={`/board/${board.slug}?offset=${prevOffset}`}
                className="rounded-lg border border-jeju-ocean px-5 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam"
              >
                ← {t('list.prev')}
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="text-sm text-coastal-gray">
              {currentPage} / {totalPages}
            </span>
            {hasMore ? (
              <Link
                href={`/board/${board.slug}?offset=${nextOffset}`}
                className="rounded-lg border border-jeju-ocean px-5 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam"
              >
                {t('list.next')} →
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
        )}
      </main>
    </>
  );
}

export const getServerSideProps = async ({ locale, params, query }: GetServerSidePropsContext) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const rawOffset = Math.max(
    0,
    parseInt(typeof query.offset === 'string' ? query.offset : '0', 10) || 0
  );
  const offset = Math.floor(rawOffset / PAGE_SIZE) * PAGE_SIZE;

  const board = await loadBoardBySlug(slug);
  if (!board) return { notFound: true };

  const [{ items: posts, hasMore }, total] = await Promise.all([
    loadBoardPosts(board.id, { limit: PAGE_SIZE, offset }),
    loadBoardPostCount(board.id),
  ]);

  return {
    props: {
      board,
      posts,
      hasMore,
      offset,
      total,
      ...(await serverSideTranslations(
        locale ?? 'ko',
        ['board', 'translation'],
        nextI18NextConfig
      )),
    },
  };
};
