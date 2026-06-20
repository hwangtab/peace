import Link from 'next/link';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import nextI18NextConfig from '../../../next-i18next.config';
import { loadBoardBySlug, loadBoardPosts } from '@/lib/boardData';
import type { Board, PostWithMeta } from '@/types/board';
import PostCard from '@/components/board/PostCard';
import { useOptionalAuth } from '@/components/auth/AuthProvider';

const PAGE_SIZE = 20;

interface Props {
  board: Board;
  posts: PostWithMeta[];
  hasMore: boolean;
  offset: number;
}

export default function BoardSlugPage({ board, posts, hasMore, offset }: Props) {
  const { t } = useTranslation('board');
  const auth = useOptionalAuth();
  const isLoggedIn = Boolean(auth?.user);

  const nextOffset = offset + PAGE_SIZE;

  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/board" className="text-sm text-coastal-gray hover:underline">
            ← {t('index.title')}
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-deep-ocean">{board.name}</h1>
          {board.description && (
            <p className="mt-1 text-sm text-coastal-gray">{board.description}</p>
          )}
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

      {hasMore && (
        <div className="mt-8 text-center">
          <Link
            href={`/board/${board.slug}?offset=${nextOffset}`}
            className="inline-block rounded-lg border border-jeju-ocean px-6 py-2 text-sm font-semibold text-jeju-ocean transition hover:bg-seafoam"
          >
            {t('list.more')}
          </Link>
        </div>
      )}
    </main>
  );
}

export const getServerSideProps = async ({
  locale,
  params,
  query,
}: GetServerSidePropsContext) => {
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const rawOffset = Math.max(0, parseInt(typeof query.offset === 'string' ? query.offset : '0', 10) || 0);
  const offset = Math.floor(rawOffset / PAGE_SIZE) * PAGE_SIZE;

  const board = await loadBoardBySlug(slug);
  if (!board) return { notFound: true };

  const { items: posts, hasMore } = await loadBoardPosts(board.id, {
    limit: PAGE_SIZE,
    offset,
  });

  return {
    props: {
      board,
      posts,
      hasMore,
      offset,
      ...(await serverSideTranslations(locale ?? 'ko', ['board', 'translation'], nextI18NextConfig)),
    },
  };
};
