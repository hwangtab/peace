import Link from 'next/link';
import type { GetStaticPropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config';
import { loadActiveBoards, loadBoardPostCounts } from '@/lib/boardData';
import type { Board } from '@/types/board';
import PageHero from '@/components/common/PageHero';
import SEOHelmet from '@/components/shared/SEOHelmet';

const BOARD_HERO_IMAGE = '/images-webp/camps/2025/DSC00921.webp';

interface BoardWithCount extends Board {
  postCount: number;
}

interface Props {
  boards: BoardWithCount[];
}

export default function BoardIndexPage({ boards }: Props) {
  const { t } = useTranslation('board');

  return (
    <>
      <SEOHelmet title={t('index.title')} description={t('index.metaDescription')} />
      <PageHero compact title={t('index.title')} backgroundImage={BOARD_HERO_IMAGE} />
      <main className="mx-auto max-w-2xl px-4 py-12">
        {boards.length === 0 ? (
          <p className="text-coastal-gray">{t('list.empty')}</p>
        ) : (
          <ul className="space-y-4">
            {boards.map((board) => (
              <li key={board.id}>
                <Link
                  href={`/board/${board.slug}`}
                  className="flex items-center justify-between rounded-xl border border-seafoam bg-cloud-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <p className="font-semibold text-deep-ocean">{board.name}</p>
                    {board.description && (
                      <p className="mt-1 text-sm text-coastal-gray">{board.description}</p>
                    )}
                  </div>
                  <span className="ml-4 flex-shrink-0 text-sm text-coastal-gray">
                    {board.postCount} {t('index.posts')}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

// 게시판 목록·글 수는 실시간 정확성이 불필요하므로 ISR(5분 재생성)로 정적 서빙한다.
// — TTFB·Edge CDN 캐시 개선. 새 글 카운트는 다음 재생성 주기에 반영된다.
export const getStaticProps = async ({ locale }: GetStaticPropsContext) => {
  const [rawBoards, postCounts] = await Promise.all([loadActiveBoards(), loadBoardPostCounts()]);

  const boards: BoardWithCount[] = rawBoards.map((board) => ({
    ...board,
    postCount: postCounts[board.id] ?? 0,
  }));

  return {
    props: {
      boards,
      ...(await serverSideTranslations(
        locale ?? 'ko',
        ['board', 'translation'],
        nextI18NextConfig
      )),
    },
    revalidate: 300,
  };
};
