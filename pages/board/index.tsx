import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config';
import { loadActiveBoards, loadBoardPostCounts } from '@/lib/boardData';
import type { Board } from '@/types/board';

interface BoardWithCount extends Board {
  postCount: number;
}

interface Props {
  boards: BoardWithCount[];
}

export default function BoardIndexPage({ boards }: Props) {
  const { t } = useTranslation('board');

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-2xl font-bold text-deep-ocean">{t('index.title')}</h1>
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
  );
}

export const getServerSideProps = async ({ locale }: GetServerSidePropsContext) => {
  const [rawBoards, postCounts] = await Promise.all([
    loadActiveBoards(),
    loadBoardPostCounts(),
  ]);

  const boards: BoardWithCount[] = rawBoards.map((board) => ({
    ...board,
    postCount: postCounts[board.id] ?? 0,
  }));

  return {
    props: {
      boards,
      ...(await serverSideTranslations(locale ?? 'ko', ['board', 'translation'], nextI18NextConfig)),
    },
  };
};
